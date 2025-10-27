import { Clock, X } from "lucide-react";
import { forwardRef } from "react";
import {
	DocumentEditor,
	type EditorHandle,
} from "@/components/editor/document-editor";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionHistoryPopover } from "@/components/ui/version-history-modal";
import { trpc } from "@/lib/trpc/react";

interface EditorPanelProps {
	editorContent: string;
	onClose: () => void;
	documentId?: string | null;
	onDocumentUpdate?: () => void;
}

export const EditorPanel = forwardRef<EditorHandle, EditorPanelProps>(
	({ editorContent, onClose, documentId, onDocumentUpdate }, ref) => {
		// Fetch versions to get current version number
		const { data: versions } = trpc.document.listVersions.useQuery(
			{ documentId: documentId!, limit: 1 },
			{ enabled: !!documentId },
		);

		const currentVersion = versions?.[0];

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
						<span className="text-sm text-muted-foreground">
							Document{" "}
							{currentVersion?.versionNumber
								? `Version ${currentVersion.versionNumber}`
								: ""}
						</span>
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
