"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
	ArrowUp,
	Brain,
	FileEdit,
	FileText,
	Globe,
	ListChecks,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import {
	DocumentEditor,
	type EditorHandle,
} from "@/components/editor/document-editor";
import { Button } from "@/components/ui/button";
import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/ui/chat-container";
import { EditorArtifact } from "@/components/ui/editor-artifact";
import { Loader } from "@/components/ui/loader";
import { MessageContent } from "@/components/ui/message";
import { PlanSteps } from "@/components/ui/plan-steps";
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
	type PlanStepsToolOutput,
	toToolPart,
	type WebSearchToolUIPart,
	type WriteToEditorToolOutput,
} from "@/lib/types/ai";

const TOOL_ICONS: Record<string, React.ReactNode> = {
	globe: <Globe className="h-4 w-4 text-blue-500" />,
	fileText: <FileText className="h-4 w-4 text-amber-500" />,
	fileEdit: <FileEdit className="h-4 w-4 text-purple-500" />,
	listChecks: <ListChecks className="h-4 w-4 text-green-500" />,
};

export default function ChatPage() {
	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [enableReasoning, setEnableReasoning] = useState(false);
	const [showEditor, setShowEditor] = useState(false);
	const editorRef = useRef<EditorHandle>(null);
	const prevEditorContentRef = useRef<string | null>(null);

	const { messages, sendMessage, status, error } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const isLoading = status === "submitted" || status === "streaming";
	const isStreaming = status === "streaming";
	const supportsReasoning = modelSupportsReasoning(selectedModel);

	const getEditorContent = () => {
		for (const message of [...messages].reverse()) {
			if (message.role !== "assistant") continue;

			const writeToEditorParts = message.parts.filter(
				(part) =>
					isToolUIPart(part) &&
					part.type === "tool-writeToEditor" &&
					part.state === "output-available",
			);

			for (const part of writeToEditorParts) {
				if (!isToolUIPart(part)) continue;
				const output = part.output as WriteToEditorToolOutput;

				if (output.success) {
					let fullContent = output.content;
					if (output.title) {
						fullContent = `# ${output.title}\n\n${output.content}`;
					}
					return fullContent;
				}
			}
		}
		return null;
	};

	const editorContent = getEditorContent();
	const hasEditorContent = editorContent !== null;

	if (editorContent && editorContent !== prevEditorContentRef.current) {
		prevEditorContentRef.current = editorContent;
		if (!showEditor) {
			setShowEditor(true);
		}
	}

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
		<div
			className={`flex h-[calc(100vh-4rem)] gap-4 px-4 py-8 w-full ${showEditor ? "max-w-none" : "max-w-4xl mx-auto"}`}
		>
			<div
				className={`flex flex-col min-h-0 min-w-0 ${showEditor ? "w-[600px]" : "flex-1"}`}
			>
				<ChatContainerRoot
					className="flex-1 relative overflow-x-hidden"
					style={{ minHeight: 0 }}
				>
					<ChatContainerContent className="p-4 space-y-4 max-w-full">
						{messages.length === 0 ? (
							<div className="text-center text-muted-foreground py-12">
								Start a conversation by typing a message below
							</div>
						) : (
							messages.map((message: UIMessage) => {
								if (message.parts.length === 0) return null;

								const isUserMessage = message.role === "user";

								// For user messages, just show text
								if (isUserMessage) {
									const textContent = message.parts
										.filter((part) => part.type === "text")
										.map((part) => ("text" in part ? part.text : ""))
										.join("");

									return (
										<div key={message.id} className="flex justify-end">
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

								// Get only the latest plan steps to avoid showing outdated plans
								const planStepsParts = message.parts.filter(
									(part) =>
										isToolUIPart(part) &&
										part.type === "tool-planSteps" &&
										part.state === "output-available",
								);
								const latestPlanStepsPart =
									planStepsParts.length > 0
										? planStepsParts[planStepsParts.length - 1]
										: null;

								return (
									<div key={message.id} className="flex justify-start w-full">
										<div className="flex flex-col gap-3 w-full min-w-0">
											{message.parts.map((part, index) => {
												// Render reasoning
												if (
													part.type === "reasoning" &&
													modelSupportsReasoning(selectedModel)
												) {
													const reasoningText = "text" in part ? part.text : "";
													return (
														<Reasoning
															key={`reasoning-${part.text?.slice(0, 20) || index}`}
															open={
																isStreaming &&
																enableReasoning &&
																supportsReasoning
															}
														>
															<ReasoningTrigger>
																Show reasoning
															</ReasoningTrigger>
															<ReasoningContent markdown>
																{reasoningText || "Thinking..."}
															</ReasoningContent>
														</Reasoning>
													);
												}

												// Render plan steps (only the latest one)
												if (
													latestPlanStepsPart &&
													part === latestPlanStepsPart
												) {
													const toolPart = part as any;
													const output = toolPart.output as PlanStepsToolOutput;
													return (
														<PlanSteps
															key={`plan-${toolPart.toolCallId}`}
															output={output}
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
													return (
														<EditorArtifact
															key={`editor-${part.toolCallId}`}
															title={output.title}
															onShowDocumentAction={() => setShowEditor(true)}
														/>
													);
												}

												// Render other tools
												if (
													isToolUIPart(part) &&
													part.type !== "tool-planSteps" &&
													part.type !== "tool-writeToEditor"
												) {
													const config = getToolConfig(part.type);
													const icon = config.iconName
														? TOOL_ICONS[config.iconName]
														: null;
													return (
														<Tool
															key={`tool-${part.toolCallId}`}
															toolPart={toToolPart(part)}
															defaultOpen={false}
															displayName={config.displayName}
															icon={icon}
														/>
													);
												}

												// Render text
												if (
													part.type === "text" &&
													"text" in part &&
													part.text.trim()
												) {
													const textContent = part.text;
													const citedSourceIds = new Set(
														(textContent.match(/\[(\d+)\]/g) || []).map(
															(match) => parseInt(match.slice(1, -1), 10),
														),
													);
													const exaSources = allExaSources.filter((source) =>
														citedSourceIds.has(source.id),
													);

													return (
														<MessageContent
															key={`text-${textContent.slice(0, 20) || index}`}
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

			{showEditor && hasEditorContent && (
				<div className="flex flex-col flex-1 min-h-0 border-l relative">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowEditor(false)}
						className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full hover:bg-muted"
					>
						<X className="h-4 w-4" />
					</Button>
					<div className="flex-1 overflow-auto">
						<DocumentEditor
							ref={editorRef}
							initialContent={editorContent}
							key={editorContent}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
