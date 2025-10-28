import { Link } from "lucide-react";
import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@/components/ai-elements/task";
import type { ScrapeUrlToolOutput } from "@/lib/types/ai";

interface ScrapeUrlRendererProps {
	output: ScrapeUrlToolOutput;
	toolCallId: string;
}

export function ScrapeUrlRenderer({
	output,
	toolCallId,
}: ScrapeUrlRendererProps) {
	const url = new URL(output.url);
	const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;

	return (
		<Task key={`tool-${toolCallId}`} defaultOpen={false}>
			<TaskTrigger title="Scraping URL" icon={<Link className="size-4" />} />
			<TaskContent>
				<TaskItem>
					<div className="flex items-start gap-2">
						<img
							src={faviconUrl}
							alt=""
							className="w-4 h-4 mt-0.5 flex-shrink-0"
						/>
						<div className="flex flex-col gap-0.5 min-w-0 flex-1">
							{output.metadata?.title && (
								<span
									className="text-foreground font-medium text-sm truncate block"
									title={output.metadata.title}
								>
									{output.metadata.title}
								</span>
							)}
							<a
								href={output.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[300px]"
								title={output.url}
							>
								{output.url}
							</a>
						</div>
					</div>
				</TaskItem>
			</TaskContent>
		</Task>
	);
}
