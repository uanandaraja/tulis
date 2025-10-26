import { X } from "lucide-react";
import { forwardRef } from "react";
import {
	DocumentEditor,
	type EditorHandle,
} from "@/components/editor/document-editor";
import { Button } from "@/components/ui/button";

interface EditorPanelProps {
	editorContent: string;
	onClose: () => void;
}

export const EditorPanel = forwardRef<EditorHandle, EditorPanelProps>(
	({ editorContent, onClose }, ref) => {
		return (
			<div className="flex flex-col flex-1 min-h-0 border-l relative">
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full hover:bg-muted"
				>
					<X className="h-4 w-4" />
				</Button>
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
