"use client";

import { useState } from "react";
import { Clock, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mockVersions = [
	{
		id: "v2",
		versionNumber: 2,
		createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
		changeDescription: "Expanded benefits section with more details",
		wordCount: 142,
		isCurrent: true,
	},
	{
		id: "v1",
		versionNumber: 1,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		changeDescription: "Initial draft with basic structure",
		wordCount: 98,
		isCurrent: false,
	},
];

function formatDistanceToNow(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function VersionTrackingMock() {
	const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

	const toggleDiff = (versionId: string) => {
		setExpandedVersion(expandedVersion === versionId ? null : versionId);
	};

	return (
		<div className="w-full bg-background border border-border rounded-lg shadow-lg max-h-[400px] overflow-hidden">
			{/* Modal Header */}
			<div className="p-3 border-b">
				<h3 className="font-medium text-sm flex items-center gap-2">
					<Clock className="h-4 w-4" />
					Version History
				</h3>
			</div>

			{/* Version List */}
			<div className="max-h-80 overflow-y-auto">
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
									{formatDistanceToNow(version.createdAt)}
								</div>
								<div className="text-xs text-muted-foreground mb-2">
									{version.changeDescription}
								</div>
								<div className="flex items-center justify-between">
									<span className="text-xs text-muted-foreground">
										{version.wordCount} words
									</span>
									{!version.isCurrent && (
										<Button
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-xs"
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
