import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { EditorArtifact } from "@/components/ui/editor-artifact";
import { MessageContent } from "@/components/ui/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import { modelSupportsReasoning } from "@/lib/constants/models";
import {
	isWebSearchToolOutput,
	type ScrapeUrlToolOutput,
	shouldShowEditorArtifact,
	type WebSearchToolUIPart,
	type WriteToEditorToolOutput,
} from "@/lib/types/ai";

import { ScrapeUrlRenderer } from "./tool-renderers/scrape-url-renderer";
import { WebSearchRenderer } from "./tool-renderers/web-search-renderer";

interface MessageRendererProps {
	message: UIMessage;
	selectedModel: string;
	isStreaming: boolean;
	enableReasoning: boolean;
	onShowDocument?: () => void;
}

export function MessageRenderer({
	message,
	selectedModel,
	isStreaming,
	enableReasoning,
	onShowDocument,
}: MessageRendererProps) {
	if (message.parts.length === 0) return null;

	const isUserMessage = message.role === "user";
	const supportsReasoning = modelSupportsReasoning(selectedModel);

	// For user messages, just show text
	if (isUserMessage) {
		const textContent = message.parts
			.filter((part) => part.type === "text")
			.map((part) => ("text" in part ? part.text : ""))
			.join("");

		return (
			<div className="flex justify-end">
				<MessageContent
					markdown={false}
					className="prose dark:prose-invert max-w-xl p-4"
				>
					{textContent}
				</MessageContent>
			</div>
		);
	}

	// For assistant messages, render parts in chronological order
	const webSearchParts = message.parts.filter(
		(part): part is WebSearchToolUIPart =>
			isToolUIPart(part) && part.type === "tool-webSearch",
	);

	const allExaSources = webSearchParts.flatMap((part) => {
		if (
			part.state === "output-available" &&
			isWebSearchToolOutput(part.output)
		) {
			return part.output.results
				.filter((result) => result.url && result.title)
				.map((result) => ({
					id: result.id,
					url: result.url,
					title: result.title,
				}));
		}
		return [];
	});

	return (
		<div className="flex justify-start w-full">
			<div className="flex flex-col gap-3 w-full min-w-0">
				{message.parts.map((part) => {
					// Render reasoning
					if (part.type === "reasoning" && supportsReasoning) {
						const reasoningText = "text" in part ? part.text : "";
						const partKey =
							"toolCallId" in part && part.toolCallId
								? `reasoning-${part.toolCallId}`
								: `reasoning-${message.id}-${reasoningText.slice(0, 20)}`;
						return (
							<Reasoning
								key={partKey}
								open={isStreaming && enableReasoning && supportsReasoning}
							>
								<ReasoningTrigger>Show reasoning</ReasoningTrigger>
								<ReasoningContent markdown>
									{reasoningText || "Thinking..."}
								</ReasoningContent>
							</Reasoning>
						);
					}

					// Render document editing tools artifact (scalable approach)
					if (
						isToolUIPart(part) &&
						part.type !== "tool-writeToEditor" && // Handle separately below
						part.state === "output-available" &&
						shouldShowEditorArtifact(
							part.type,
							part.output as { success?: boolean; documentId?: string },
						)
					) {
						const output = part.output as {
							success: boolean;
							documentId?: string;
							versionId?: string;
							versionNumber?: number;
							message?: string;
						};

						return (
							<EditorArtifact
								key={`editor-${part.toolCallId}`}
								title="Document Updated"
								documentId={output.documentId}
								onShowDocumentAction={onShowDocument}
							/>
						);
					}

					// Render write to editor artifact
					if (
						isToolUIPart(part) &&
						part.type === "tool-writeToEditor" &&
						part.state === "output-available"
					) {
						const output = part.output as WriteToEditorToolOutput;
						// Extract title from first h1 heading in content
						const titleMatch = output.content.match(/^#\s+(.+)$/m);
						const title = titleMatch ? titleMatch[1].trim() : "Document";

						return (
							<EditorArtifact
								key={`editor-${part.toolCallId}`}
								title={title}
								documentId={output.documentId}
								versionNumber={output.versionNumber}
								onShowDocumentAction={onShowDocument}
							/>
						);
					}

					// Render document editing tools artifact (scalable approach)
					if (
						isToolUIPart(part) &&
						part.type !== "tool-writeToEditor" && // Handle separately above
						part.state === "output-available" &&
						shouldShowEditorArtifact(
							part.type,
							part.output as { success?: boolean; documentId?: string },
						)
					) {
						const output = part.output as {
							success: boolean;
							documentId?: string;
							versionId?: string;
							versionNumber?: number;
							message?: string;
						};

						return (
							<EditorArtifact
								key={`editor-${part.toolCallId}`}
								title="Document Updated"
								documentId={output.documentId}
								versionNumber={output.versionNumber}
								onShowDocumentAction={onShowDocument}
							/>
						);
					}

					// Render web search tool
					if (
						isToolUIPart(part) &&
						part.type === "tool-webSearch" &&
						part.state === "output-available"
					) {
						const output = part.output;
						if (isWebSearchToolOutput(output)) {
							return (
								<WebSearchRenderer
									key={`tool-${part.toolCallId}`}
									output={output}
									toolCallId={part.toolCallId}
								/>
							);
						}
					}

					// Render scrape URL tool
					if (
						isToolUIPart(part) &&
						part.type === "tool-scrapeUrl" &&
						part.state === "output-available"
					) {
						const output = part.output as ScrapeUrlToolOutput;
						return (
							<ScrapeUrlRenderer
								key={`tool-${part.toolCallId}`}
								output={output}
								toolCallId={part.toolCallId}
							/>
						);
					}

					// Render text
					if (part.type === "text" && "text" in part && part.text.trim()) {
						const textContent = part.text;
						const citedSourceIds = new Set(
							(textContent.match(/\[(\d+)\]/g) || []).map((match) =>
								parseInt(match.slice(1, -1), 10),
							),
						);
						const exaSources = allExaSources.filter((source) =>
							citedSourceIds.has(source.id),
						);
						const textKey = `text-${message.id}-${textContent.slice(0, 30).replace(/\s/g, "-")}`;

						return (
							<MessageContent
								key={textKey}
								markdown={true}
								className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border bg-transparent p-0"
								sources={exaSources}
							>
								{textContent}
							</MessageContent>
						);
					}

					return null;
				})}
			</div>
		</div>
	);
}
