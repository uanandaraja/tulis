import { Clock, X } from "lucide-react";
import { forwardRef, useState } from "react";
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

interface EditorPanelProps {
	editorContent: string;
	onClose: () => void;
	documentId?: string | null;
}

export const EditorPanel = forwardRef<EditorHandle, EditorPanelProps>(
	({ editorContent, onClose, documentId }, ref) => {
		const [showVersions] = useState(false);

		return (
			<div className="flex flex-col flex-1 min-h-0 border-l relative">
				<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Document</span>
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
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										disabled={!documentId}
									>
										<Clock className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Version History (Coming Soon)</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
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
					<DocumentEditor
						ref={ref}
						initialContent={editorContent}
						key={editorContent}
					/>
				</div>
			</div>
		);
	},
);

EditorPanel.displayName = "EditorPanel";
