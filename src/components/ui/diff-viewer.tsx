"use client";

import type React from "react";
import { useMemo } from "react";
import { diff_match_patch } from "diff-match-patch";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

interface DiffViewerProps {
	oldContent: string;
	newContent: string;
	className?: string;
}

export function DiffViewer({ oldContent, newContent, className }: DiffViewerProps) {
	const dmp = useMemo(() => new diff_match_patch(), []);
	const diffs = useMemo(() => {
		const result = dmp.diff_main(oldContent, newContent);
		dmp.diff_cleanupSemantic(result);
		return result;
	}, [oldContent, newContent, dmp]);

	const renderDiff = () => {
		const elements: React.ReactNode[] = [];
		let currentUnchanged = "";
		let currentDeleted = "";
		let currentAdded = "";
		let chunkIndex = 0;

		const flushCurrent = () => {
			if (currentUnchanged) {
				elements.push(
					<div key={`unchanged-${chunkIndex}`} className="my-1">
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<Markdown>{currentUnchanged}</Markdown>
						</div>
					</div>
				);
				currentUnchanged = "";
				chunkIndex++;
			}
			if (currentDeleted) {
				elements.push(
					<div
						key={`deleted-${chunkIndex}`}
						className="bg-destructive/20 text-destructive my-1 rounded relative"
					>
						<div className="absolute top-1 left-2 text-xs font-semibold text-destructive/70 z-10">
							−
						</div>
						<div className="ml-6 px-2 py-1 opacity-75">
							<div className="prose prose-sm dark:prose-invert max-w-none [&_*]:line-through">
								<Markdown>{currentDeleted}</Markdown>
							</div>
						</div>
					</div>
				);
				currentDeleted = "";
				chunkIndex++;
			}
			if (currentAdded) {
				elements.push(
					<div
						key={`added-${chunkIndex}`}
						className="bg-green-500/20 text-green-600 dark:text-green-400 my-1 rounded relative"
					>
						<div className="absolute top-1 left-2 text-xs font-semibold text-green-600 dark:text-green-400 z-10">
							+
						</div>
						<div className="ml-6 px-2 py-1">
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<Markdown>{currentAdded}</Markdown>
							</div>
						</div>
					</div>
				);
				currentAdded = "";
				chunkIndex++;
			}
		};

		diffs.forEach((diff) => {
			const [operation, text] = diff;

			if (operation === 0) {
				// No change - accumulate unchanged content
				if (currentDeleted || currentAdded) {
					flushCurrent();
				}
				currentUnchanged += text;
			} else if (operation === -1) {
				// Deletion
				if (currentUnchanged) {
					flushCurrent();
				}
				currentDeleted += text;
			} else {
				// Addition
				if (currentUnchanged) {
					flushCurrent();
				}
				currentAdded += text;
			}
		});

		// Flush any remaining content
		flushCurrent();

		return elements;
	};

	return (
		<div className={cn("w-full", className)}>
			<div className="space-y-1">
				{renderDiff()}
			</div>
		</div>
	);
}
