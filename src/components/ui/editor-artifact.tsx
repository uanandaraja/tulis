"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileEdit } from "lucide-react";

export type EditorArtifactProps = {
	title?: string;
	onShowDocumentAction?: () => void;
	className?: string;
};

export const EditorArtifact = ({
	title,
	onShowDocumentAction,
	className,
}: EditorArtifactProps) => {
	return (
		<div
			className={cn(
				"mt-3 overflow-hidden rounded-lg border border-border bg-muted/50",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3 p-3">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
						<FileEdit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium text-foreground">
							{title || "Document"}
						</span>
						<span className="text-xs text-muted-foreground">
							Written to editor
						</span>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onShowDocumentAction}
					className="h-8 px-3 text-xs font-medium"
				>
					Show document
				</Button>
			</div>
		</div>
	);
};
