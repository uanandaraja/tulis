import { Check, Clock, Code, Copy, FileText, X } from "lucide-react";
import { forwardRef, useState } from "react";
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
import { trpc } from "@/lib/trpc/react";
import { extractPlainText } from "@/lib/editor/text-extraction";
import type { YooptaContentValue } from "@yoopta/editor";

interface EditorPanelProps {
	editorContent: string;
	onClose: () => void;
	documentId?: string | null;
	selectedVersionId?: string | null;
	currentVersionNumber?: number;
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
			onDocumentUpdate,
			onShowLatest,
		},
		ref,
	) => {
		// Fetch versions to get current version number (only if not viewing a specific version)
		const { data: versions } = trpc.document.listVersions.useQuery(
			{ documentId: documentId!, limit: 1 },
			{ enabled: !!documentId && !selectedVersionId },
		);

		const latestVersion = versions?.[0];
		const isViewingSpecificVersion = !!selectedVersionId;
		const displayVersionNumber =
			currentVersionNumber ?? latestVersion?.versionNumber;
		const [copyPopoverOpen, setCopyPopoverOpen] = useState(false);
		const [copiedType, setCopiedType] = useState<"raw" | "markdown" | null>(
			null,
		);

		const handleCopyRawText = async () => {
			if (!ref || typeof ref === "function" || !ref.current) return;

			try {
				const content = ref.current.getContent();
				const editorValue = JSON.parse(content) as YooptaContentValue;
				const plainText = extractPlainText(editorValue);

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
							{isViewingSpecificVersion && onShowLatest && (
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
					<DocumentEditor ref={ref} initialContent={editorContent} />
				</div>
			</div>
		);
		},
	);

EditorPanel.displayName = "EditorPanel";
