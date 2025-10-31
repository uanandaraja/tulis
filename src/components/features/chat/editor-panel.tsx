import { Check, Clock, Code, Copy, FileText, GitCompare, X } from "lucide-react";
import { forwardRef, useState, useEffect } from "react";
import {
	DocumentEditor,
	type EditorHandle,
} from "@/components/editor/document-editor";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionHistoryPopover } from "@/components/ui/version-history-modal";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { trpc } from "@/lib/trpc/react";

interface EditorPanelProps {
	editorContent: string;
	onClose: () => void;
	documentId?: string | null;
	selectedVersionId?: string | null;
	currentVersionNumber?: number;
	latestVersionContent?: string | null;
	onDocumentUpdate?: () => void;
	onShowLatest?: () => void;
}

export const EditorPanel = forwardRef<EditorHandle, EditorPanelProps>(
	(
		{
			editorContent,
			onClose,
			documentId,
			selectedVersionId,
			currentVersionNumber,
			latestVersionContent,
			onDocumentUpdate,
			onShowLatest,
		},
		ref,
	) => {
		// Fetch versions to get latest version number (always fetch to compare when viewing specific version)
		const { data: versions } = trpc.document.listVersions.useQuery(
			{ documentId: documentId!, limit: 1 },
			{ enabled: !!documentId },
		);

		const latestVersion = versions?.[0];
		const isViewingSpecificVersion = !!selectedVersionId;
		// Check if we're viewing the latest version by comparing version numbers
		const isViewingLatestVersion = 
			!isViewingSpecificVersion || 
			(currentVersionNumber !== undefined && 
			 latestVersion?.versionNumber !== undefined && 
			 currentVersionNumber === latestVersion.versionNumber);
		const canShowDiff = isViewingSpecificVersion && latestVersionContent;
		// Default to showing diff when viewing an older version
		const [showDiff, setShowDiff] = useState(isViewingSpecificVersion);
		const displayVersionNumber =
			currentVersionNumber ?? latestVersion?.versionNumber;
		const [copyPopoverOpen, setCopyPopoverOpen] = useState(false);
		const [copiedType, setCopiedType] = useState<"raw" | "markdown" | null>(
			null,
		);

		// Auto-show diff when viewing a specific version, reset when viewing latest
		useEffect(() => {
			if (isViewingLatestVersion) {
				setShowDiff(false);
			} else {
				setShowDiff(true);
			}
		}, [selectedVersionId, isViewingLatestVersion, currentVersionNumber, latestVersion?.versionNumber]);

		const handleCopyRawText = async () => {
			if (!ref || typeof ref === "function" || !ref.current) return;

			try {
				// For Tiptap, getContent returns markdown, so we extract plain text from it
				const markdown = ref.current.getContent();
				// Simple markdown to plain text conversion
				const plainText = markdown
					.replace(/^#+\s+/gm, "") // Remove headings
					.replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
					.replace(/\*(.+?)\*/g, "$1") // Remove italic
					.replace(/`(.+?)`/g, "$1") // Remove inline code
					.replace(/```[\s\S]*?```/g, "") // Remove code blocks
					.replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links, keep text
					.replace(/^>\s+/gm, "") // Remove blockquotes
					.replace(/^[-*+]\s+/gm, "") // Remove list markers
					.replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
					.trim();

				if (typeof window !== "undefined" && navigator.clipboard) {
					await navigator.clipboard.writeText(plainText);
					setCopiedType("raw");
					setTimeout(() => {
						setCopiedType(null);
						setCopyPopoverOpen(false);
					}, 2000);
				}
			} catch (error) {
				console.error("Error copying raw text:", error);
			}
		};

		const handleCopyMarkdown = async () => {
			try {
				if (typeof window !== "undefined" && navigator.clipboard) {
					await navigator.clipboard.writeText(editorContent);
					setCopiedType("markdown");
					setTimeout(() => {
						setCopiedType(null);
						setCopyPopoverOpen(false);
					}, 2000);
				}
			} catch (error) {
				console.error("Error copying markdown:", error);
			}
		};

		return (
			<div className="flex flex-col flex-1 min-h-0 min-w-0 border-l relative">
				<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						{documentId ? (
							<VersionHistoryPopover
								documentId={documentId}
								onRestore={onDocumentUpdate}
							>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Clock className="h-4 w-4" />
								</Button>
							</VersionHistoryPopover>
						) : (
							<Button variant="ghost" size="icon" className="h-8 w-8" disabled>
								<Clock className="h-4 w-4" />
							</Button>
						)}
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								Document{" "}
								{displayVersionNumber ? `Version ${displayVersionNumber}` : ""}
							</span>
							{!isViewingLatestVersion && canShowDiff && (
								<Button
									variant={showDiff ? "default" : "outline"}
									size="sm"
									onClick={() => setShowDiff(!showDiff)}
									className="h-6 px-2 text-xs gap-1"
								>
									<GitCompare className="h-3 w-3" />
									{showDiff ? "Hide Diff" : "Show Diff"}
								</Button>
							)}
							{!isViewingLatestVersion && isViewingSpecificVersion && onShowLatest && (
								<Button
									variant="ghost"
									size="sm"
									onClick={onShowLatest}
									className="h-6 px-2 text-xs"
								>
									View Latest
								</Button>
							)}
						</div>
						{documentId && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
											{documentId.slice(0, 8)}
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<p className="font-mono text-xs">{documentId}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
					<div className="flex items-center gap-1">
						<Popover open={copyPopoverOpen} onOpenChange={setCopyPopoverOpen}>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Copy className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-1" align="end">
								<div className="flex flex-col">
									<Button
										variant="ghost"
										size="sm"
										className="justify-start h-9 px-2 gap-2"
										onClick={handleCopyRawText}
									>
										{copiedType === "raw" ? (
											<>
												<Check className="h-4 w-4" />
												Copied!
											</>
										) : (
											<>
												<FileText className="h-4 w-4" />
												Copy Raw Text
											</>
										)}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="justify-start h-9 px-2 gap-2"
										onClick={handleCopyMarkdown}
									>
										{copiedType === "markdown" ? (
											<>
												<Check className="h-4 w-4" />
												Copied!
											</>
										) : (
											<>
												<Code className="h-4 w-4" />
												Copy Markdown
											</>
										)}
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="h-8 w-8"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="flex-1 overflow-auto">
					{showDiff && canShowDiff ? (
						<div className="h-full w-full overflow-auto px-16 py-12">
							<div className="max-w-3xl mx-auto px-8">
								<DiffViewer
									oldContent={editorContent}
									newContent={latestVersionContent!}
									className="min-h-full"
								/>
							</div>
						</div>
					) : (
						<DocumentEditor 
							key={selectedVersionId || 'latest'} 
							ref={ref} 
							initialContent={editorContent} 
						/>
					)}
				</div>
			</div>
		);
		},
	);

EditorPanel.displayName = "EditorPanel";
