"use client";

import { Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mockVersions = [
	{
		id: "v2",
		versionNumber: 2,
		timeAgo: "30 minutes ago",
		changeDescription: "Expanded benefits section with more details",
		wordCount: 142,
		isCurrent: true,
	},
	{
		id: "v1",
		versionNumber: 1,
		timeAgo: "2 hours ago",
		changeDescription: "Initial draft with basic structure",
		wordCount: 98,
		isCurrent: false,
	},
];

export function VersionTrackingMock() {
	return (
		<div className="w-full bg-background border border-border rounded-lg shadow-lg h-64 flex flex-col">
			{/* Modal Header */}
			<div className="p-3 border-b flex-shrink-0">
				<h3 className="font-medium text-sm flex items-center gap-2">
					<Clock className="h-4 w-4" />
					Version History
				</h3>
			</div>

			{/* Version List */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-2">
					{mockVersions.map((version, index) => (
						<div key={version.id}>
							<div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
								<div className="flex items-center justify-between mb-1">
									<span className="font-medium text-sm">
										Version {version.versionNumber}
									</span>
									{version.isCurrent && (
										<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
											Current
										</span>
									)}
								</div>
								<div className="text-xs text-muted-foreground mb-1">
									{version.timeAgo}
								</div>
								<div className="text-xs text-muted-foreground mb-2">
									{version.changeDescription}
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs text-muted-foreground flex-shrink-0">
										{version.wordCount} words
									</span>
									{!version.isCurrent && (
										<Button
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-xs flex-shrink-0"
											disabled
										>
											<RotateCcw className="h-3 w-3 mr-1" />
											Restore
										</Button>
									)}
								</div>
							</div>
							{index < mockVersions.length - 1 && (
								<Separator className="my-1" />
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
