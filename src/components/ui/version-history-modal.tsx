import { formatDistanceToNow } from "date-fns";
import { Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc/react";

interface VersionHistoryPopoverProps {
	documentId: string;
	onRestore?: (documentId: string) => void;
	children: React.ReactNode;
}

export function VersionHistoryPopover({
	documentId,
	onRestore,
	children,
}: VersionHistoryPopoverProps) {
	const [open, setOpen] = useState(false);
	
	const { data: versions, isLoading } = trpc.document.listVersions.useQuery(
		{ documentId, limit: 10 },
		{ enabled: open && !!documentId }
	);

	const restoreMutation = trpc.document.restoreVersion.useMutation({
		onSuccess: () => {
			onRestore?.(documentId);
			setOpen(false);
		},
	});

	const handleRestore = (versionId: string) => {
		restoreMutation.mutate({ versionId });
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{children}
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="p-3 border-b">
					<h3 className="font-medium text-sm flex items-center gap-2">
						<Clock className="h-4 w-4" />
						Version History
					</h3>
				</div>
				
				<div className="max-h-96 overflow-y-auto">
					{isLoading ? (
						<div className="p-4 text-sm text-muted-foreground">
							Loading versions...
						</div>
					) : !versions?.length ? (
						<div className="p-4 text-sm text-muted-foreground">
							No versions found
						</div>
					) : (
						<div className="p-2">
							{versions.map((version: any, index: number) => (
								<div key={version.id}>
									<div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center justify-between mb-1">
											<span className="font-medium text-sm">
												Version {version.versionNumber}
											</span>
											{index === 0 && (
												<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
													Current
												</span>
											)}
										</div>
										<div className="text-xs text-muted-foreground mb-1">
											{formatDistanceToNow(new Date(version.createdAt), {
												addSuffix: true,
											})}
										</div>
										<div className="text-xs text-muted-foreground mb-2">
											{version.changeDescription || "No description"}
										</div>
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												{version.wordCount} words
											</span>
											{index !== 0 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRestore(version.id)}
													disabled={restoreMutation.isPending}
													className="h-6 px-2 text-xs"
												>
													<RotateCcw className="h-3 w-3 mr-1" />
													Restore
												</Button>
											)}
										</div>
									</div>
									{index < versions.length - 1 && <Separator className="my-1" />}
								</div>
							))}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}