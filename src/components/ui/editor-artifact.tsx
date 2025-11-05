"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorArtifactProps = {
	title?: string;
	documentId?: string;
	versionId?: string;
	versionNumber?: number;
	onShowDocumentAction?: (versionId?: string) => void;
	className?: string;
};

export const EditorArtifact = ({
	title,
	documentId,
	versionId,
	versionNumber,
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
			<div className="p-3">
				<div className="flex flex-col">
					<span className="text-sm font-medium text-foreground">
						{title || "Document"}
					</span>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>Written to editor</span>
						{versionNumber !== undefined && versionNumber !== null && (
							<>
								<span>•</span>
								<span className="bg-muted px-1.5 py-0.5 rounded font-medium">
									v{versionNumber}
								</span>
							</>
						)}
						{documentId && (
							<>
								<span>•</span>
								<span className="font-mono bg-muted px-1.5 py-0.5 rounded">
									{documentId.slice(0, 8)}
								</span>
							</>
						)}
					</div>
				</div>
				<div className="mt-3 flex justify-start">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onShowDocumentAction?.(versionId)}
						className="h-8 px-3 text-xs font-medium"
					>
						{versionNumber ? `Show Version ${versionNumber}` : 'Show document'}
					</Button>
				</div>
			</div>
		</div>
	);
};
