import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Fragment } from "react";
import { EditorArtifact } from "@/components/ui/editor-artifact";
import { MessageContent } from "@/components/ui/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import {
	isWebSearchToolOutput,
	type PlanStepsToolOutput,
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
	allPlanSteps?: Array<{
		messageId: string;
		toolCallId: string;
		output: PlanStepsToolOutput;
	}>;
	onShowDocument?: (versionId?: string) => void;
}

export function MessageRenderer({
	message,
	selectedModel: _selectedModel,
	isStreaming,
	enableReasoning,
	allPlanSteps: _allPlanSteps = [],
	onShowDocument,
}: MessageRendererProps) {
	if (message.parts.length === 0) return null;

	const isUserMessage = message.role === "user";

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
			<div className="flex flex-col gap-1.5 w-full min-w-0">
				{message.parts.map((part, partIndex) => {
					// Render reasoning (always show if it exists, regardless of current model selection)
					if (part.type === "reasoning") {
						const reasoningText = "text" in part ? part.text : "";
						const partKey =
							"toolCallId" in part && part.toolCallId
								? `reasoning-${part.toolCallId}`
								: `reasoning-${message.id}-${reasoningText.slice(0, 20)}`;
						return (
							<Reasoning
								key={partKey}
								isStreaming={isStreaming && enableReasoning}
							>
								<ReasoningTrigger>Show reasoning</ReasoningTrigger>
								<ReasoningContent markdown>
									{reasoningText || "Thinking..."}
								</ReasoningContent>
							</Reasoning>
						);
					}

					// Skip plan steps rendering - they're now shown above the prompt input
					if (
						isToolUIPart(part) &&
						part.type === "tool-planSteps" &&
						part.state === "output-available"
					) {
						return null;
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
								versionId={output.versionId}
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
								versionId={output.versionId}
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
						const fullText = part.text;

						// Extract <think> tags (OpenRouter embeds reasoning in text)
						// Match both complete <think>...</think> and incomplete <think>... (streaming)
						const completeMatch = fullText.match(/<think>([\s\S]*?)<\/think>/);
						const incompleteMatch = fullText.match(/<think>([\s\S]*?)$/);
						const reasoningText = completeMatch
							? completeMatch[1].trim()
							: incompleteMatch
								? incompleteMatch[1].trim() || "Thinking..." // Show placeholder while streaming
								: null;
						const textContent = fullText
							.replace(/<think>[\s\S]*?<\/think>/g, "")
							.replace(/<think>[\s\S]*$/g, "")
							.trim();

						const citedSourceIds = new Set(
							(textContent.match(/\[(\d+)\]/g) || []).map((match) =>
								parseInt(match.slice(1, -1), 10),
							),
						);
						const exaSources = allExaSources.filter((source) =>
							citedSourceIds.has(source.id),
						);
						const textKey = `text-${message.id}-${partIndex}`;

						return (
							<Fragment key={textKey}>
								{reasoningText && (
									<Reasoning
										key={`reasoning-${textKey}`}
										isStreaming={isStreaming}
									>
										<ReasoningTrigger>Show reasoning</ReasoningTrigger>
										<ReasoningContent markdown>
											{reasoningText}
										</ReasoningContent>
									</Reasoning>
								)}
								{textContent && (
									<div key={`content-${textKey}`} className="mt-3">
										<MessageContent
											markdown={true}
											className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border bg-transparent p-0"
											sources={exaSources}
										>
											{textContent}
										</MessageContent>
									</div>
								)}
							</Fragment>
						);
					}

					return null;
				})}
			</div>
		</div>
	);
}
