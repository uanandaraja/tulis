"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { ArrowUp, Brain, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { MessageContent } from "@/components/ui/message";
import { PromptInput, PromptInputTextarea } from "@/components/ui/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import { ScrollButton } from "@/components/ui/scroll-button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tool } from "@/components/ui/tool";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AI_MODELS,
	DEFAULT_MODEL,
	modelSupportsReasoning,
} from "@/lib/constants/models";
import {
	getToolConfig,
	isWebSearchToolOutput,
	toToolPart,
	type WebSearchToolUIPart,
} from "@/lib/types/ai";

export default function ChatPage() {
	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [enableReasoning, setEnableReasoning] = useState(false);
	const { messages, sendMessage, status, error } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const isLoading = status === "submitted" || status === "streaming";
	const isStreaming = status === "streaming";
	const supportsReasoning = modelSupportsReasoning(selectedModel);

	const handleSubmit = () => {
		if (input.trim() && !isLoading) {
			sendMessage(
				{
					text: input,
				},
				{
					body: {
						selectedModel,
						enableReasoning: enableReasoning && supportsReasoning,
					},
				},
			);
			setInput("");
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] px-4 py-8 max-w-4xl mx-auto w-full">
			<div className="flex flex-col flex-1 min-h-0">
				<ChatContainerRoot className="flex-1 relative" style={{ minHeight: 0 }}>
					<ChatContainerContent className="p-4 space-y-4">
						{messages.length === 0 ? (
							<div className="text-center text-muted-foreground py-12">
								Start a conversation by typing a message below
							</div>
						) : (
							messages.map((message: UIMessage) => {
								const textContent = message.parts
									.filter((part) => part.type === "text")
									.map((part) => ("text" in part ? part.text : ""))
									.join("");

								const reasoningParts = message.parts.filter(
									(part) => part.type === "reasoning",
								);

								const reasoningText = reasoningParts
									.map((part) => ("text" in part ? part.text : ""))
									.join("\n");

								const toolParts = message.parts.filter(isToolUIPart);
								const webSearchParts = toolParts.filter(
									(part): part is WebSearchToolUIPart =>
										part.type === "tool-webSearch",
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

								const citedSourceIds = new Set(
									(textContent.match(/\[(\d+)\]/g) || []).map((match) =>
										parseInt(match.slice(1, -1), 10),
									),
								);

								const exaSources = allExaSources.filter((source) =>
									citedSourceIds.has(source.id),
								);

								if (
									!textContent.trim() &&
									reasoningParts.length === 0 &&
									toolParts.length === 0
								)
									return null;

								const isUserMessage = message.role === "user";
								const showReasoning =
									reasoningParts.length > 0 &&
									modelSupportsReasoning(selectedModel);

								return (
									<div
										key={message.id}
										className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
									>
										<div className="flex flex-col gap-2 max-w-full">
											{(showReasoning ||
												(isStreaming &&
													enableReasoning &&
													supportsReasoning)) && (
												<Reasoning
													isStreaming={
														isStreaming &&
														enableReasoning &&
														supportsReasoning &&
														message.role === "assistant"
													}
												>
													<ReasoningTrigger>Show reasoning</ReasoningTrigger>
													<ReasoningContent markdown>
														{reasoningText || "Thinking..."}
													</ReasoningContent>
												</Reasoning>
											)}
											{toolParts.map((toolPart) => {
												const config = getToolConfig(toolPart.type);
												const icon =
													toolPart.type === "tool-webSearch" ? (
														<Globe className="h-4 w-4 text-blue-500" />
													) : null;

												return (
													<Tool
														key={toolPart.toolCallId}
														toolPart={toToolPart(toolPart)}
														defaultOpen={false}
														displayName={config.displayName}
														icon={icon}
													/>
												);
											})}
											{textContent && (
												<MessageContent
													markdown={!isUserMessage}
													className={`prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border ${!isUserMessage ? "p-4" : ""}`}
													sources={exaSources}
												>
													{textContent}
												</MessageContent>
											)}
										</div>
									</div>
								);
							})
						)}
						{isLoading &&
							messages[messages.length - 1]?.role !== "assistant" && (
								<div className="flex justify-start">
									<div className="rounded-lg p-2 text-foreground bg-secondary">
										{modelSupportsReasoning(selectedModel) ? (
											<Loader
												variant="text-shimmer"
												size="md"
												text="Thinking"
											/>
										) : (
											<Loader variant="typing" size="sm" />
										)}
									</div>
								</div>
							)}
						{isLoading &&
							messages[messages.length - 1]?.role === "assistant" &&
							messages[messages.length - 1]?.parts?.length === 0 && (
								<div className="flex justify-start">
									<div className="rounded-lg p-2 text-foreground bg-secondary">
										{modelSupportsReasoning(selectedModel) ? (
											<Loader
												variant="text-shimmer"
												size="md"
												text="Thinking"
											/>
										) : (
											<Loader variant="typing" size="sm" />
										)}
									</div>
								</div>
							)}
					</ChatContainerContent>
					<div className="absolute right-4 bottom-4">
						<ScrollButton />
					</div>
				</ChatContainerRoot>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
						Error: {error.message}
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="relative"
				>
					<PromptInput
						value={input}
						onValueChange={setInput}
						onSubmit={handleSubmit}
						isLoading={isLoading}
					>
						<PromptInputTextarea
							placeholder="Ask me anything..."
							className="pr-14"
						/>
						<div className="flex items-center gap-3 px-2">
							<Select value={selectedModel} onValueChange={setSelectedModel}>
								<SelectTrigger className="w-[200px] border-0 shadow-none focus:ring-0">
									<SelectValue placeholder="Select model" />
								</SelectTrigger>
								<SelectContent>
									{AI_MODELS.map((model) => (
										<SelectItem key={model.value} value={model.value}>
											{model.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{supportsReasoning && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												onClick={() => setEnableReasoning(!enableReasoning)}
												aria-label="Toggle reasoning"
												className="p-2 rounded-md hover:bg-muted transition-colors"
											>
												<Brain
													className={`h-4 w-4 transition-colors ${
														enableReasoning
															? "text-blue-500"
															: "text-muted-foreground"
													}`}
												/>
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Show reasoning</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					</PromptInput>
					<Button
						type="submit"
						size="icon"
						disabled={isLoading || !input.trim()}
						className="absolute right-3 bottom-3 rounded-full h-8 w-8"
					>
						<ArrowUp className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
