import { Search } from "lucide-react";
import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@/components/ai-elements/task";
import type { WebSearchToolOutput } from "@/lib/types/ai";

interface WebSearchRendererProps {
	output: WebSearchToolOutput;
	toolCallId: string;
}

export function WebSearchRenderer({
	output,
	toolCallId,
}: WebSearchRendererProps) {
	return (
		<Task key={`tool-${toolCallId}`} defaultOpen={false}>
			<TaskTrigger
				title="Searching the web"
				icon={<Search className="size-4" />}
			/>
			<TaskContent>
				{output.results.map((result) => {
					const url = new URL(result.url);
					const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
					return (
						<TaskItem key={result.id}>
							<div className="flex items-start gap-2">
								<img
									src={faviconUrl}
									alt=""
									className="w-4 h-4 mt-0.5 flex-shrink-0"
								/>
								<div className="flex flex-col gap-0.5 min-w-0 flex-1">
									<a
										href={result.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:underline font-medium text-sm truncate block"
										title={result.title}
									>
										{result.title}
									</a>
									<a
										href={result.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[300px]"
										title={result.url}
									>
										{result.url}
									</a>
								</div>
							</div>
						</TaskItem>
					);
				})}
			</TaskContent>
		</Task>
	);
}
