"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { isToolUIPart, DefaultChatTransport } from "ai";
import type { WritingAgentUIMessage } from "@/server/agents/writing-agent";
import { ArrowUp, Brain, Link, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@/components/ai-elements/task";
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
import {
	PromptInput,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoSend } from "@/hooks/use-auto-send";
import { useEditorState } from "@/hooks/use-editor-state";
import { usePlanStepsState } from "@/hooks/use-plan-steps-state";
import {
	AI_MODELS,
	DEFAULT_MODEL,
	modelSupportsReasoning,
} from "@/lib/constants/models";
import { trpc } from "@/lib/trpc/react";
import {
	isWebSearchToolOutput,
	type ScrapeUrlToolOutput,
	type WebSearchToolUIPart,
	type WriteToEditorToolOutput,
} from "@/lib/types/ai";

function ChatInterface({
	chatId,
	initialMessages,
	initialModel,
	initialReasoning,
	isNewChat,
	initialPrompt,
}: {
	chatId: string;
	initialMessages: UIMessage[];
	initialModel: string;
	initialReasoning: boolean;
	isNewChat: boolean;
	initialPrompt?: string;
}) {
	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(initialModel);
	const [enableReasoning, setEnableReasoning] = useState(initialReasoning);
	const editorRef = useRef<EditorHandle>(null);

	const utils = trpc.useUtils();
	const saveChatMutation = trpc.chat.save.useMutation({
		onSuccess: () => {
			utils.chat.list.invalidate();
		},
	});

	const { messages, sendMessage, status, error, setMessages } =
		useChat<WritingAgentUIMessage>({
			id: chatId,
			transport: new DefaultChatTransport({
				api: "/api/chat",
				body: () => ({
					selectedModel,
					enableReasoning: enableReasoning && supportsReasoning,
				}),
			}),
			onFinish: ({ messages: allMessages }) => {
				saveChatMutation.mutate({
					chatId,
					messages: allMessages,
					model: selectedModel,
				});
			},
		});

	const supportsReasoning = modelSupportsReasoning(selectedModel);

	useEffect(() => {
		if (
			initialMessages &&
			initialMessages.length > 0 &&
			messages.length === 0
		) {
			setMessages(initialMessages as WritingAgentUIMessage[]);
		}
	}, [initialMessages, messages.length, setMessages]);

	const {
		editorContent,
		hasContent: hasEditorContent,
		isOpen: showEditor,
		close: closeEditor,
	} = useEditorState(messages);
	const { allPlanSteps } = usePlanStepsState(messages);

	useAutoSend({
		isNewChat,
		initialPrompt,
		sendMessage,
		onBeforeSend: () => {
			utils.chat.list.setData(undefined, (old) => {
				if (!old) return old;
				const exists = old.some((c) => c.id === chatId);
				if (exists) return old;
				return [
					{
						id: chatId,
						userId: "",
						title: "New Chat",
						model: selectedModel,
						messageCount: 0,
						storageKey: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					...old,
				];
			});
		},
	});

	const isLoading = status === "submitted" || status === "streaming";
	const isStreaming = status === "streaming";

	const handleSubmit = () => {
		if (input.trim() && !isLoading) {
			sendMessage({
				text: input,
			});
			setInput("");
		}
	};

	return (
		<div
			className={`flex h-screen gap-4 px-4 w-full ${showEditor ? "max-w-none" : "max-w-2xl mx-auto"}`}
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
							<>
								{messages.map((message: UIMessage, messageIndex: number) => {
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

									const renderedPlanIds = new Set<string>();

									return (
										<div key={message.id} className="flex justify-start w-full">
											<div className="flex flex-col gap-3 w-full min-w-0">
												{message.parts.map((part, index) => {
													// Render reasoning
													if (
														part.type === "reasoning" &&
														modelSupportsReasoning(selectedModel)
													) {
														const reasoningText =
															"text" in part ? part.text : "";
														return (
															<Reasoning
																key={`reasoning-${messageIndex}-${index}`}
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

													// Render plan steps (show all updates in order)
													if (
														isToolUIPart(part) &&
														part.type === "tool-planSteps" &&
														part.state === "output-available" &&
														!renderedPlanIds.has(part.toolCallId)
													) {
														renderedPlanIds.add(part.toolCallId);
														const planData = allPlanSteps.find(
															(p) => p.toolCallId === part.toolCallId,
														);
														if (planData) {
															return (
																<PlanSteps
																	key={`plan-${part.toolCallId}`}
																	output={planData.output}
																/>
															);
														}
													}

													// Render write to editor artifact
													if (
														isToolUIPart(part) &&
														part.type === "tool-writeToEditor" &&
														part.state === "output-available"
													) {
														const output =
															part.output as WriteToEditorToolOutput;
														return (
															<EditorArtifact
																key={`editor-${part.toolCallId}`}
																title={output.title}
																onShowDocumentAction={() => {}}
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
																<Task
																	key={`tool-${part.toolCallId}`}
																	defaultOpen={false}
																>
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
													}

													// Render scrape URL tool
													if (
														isToolUIPart(part) &&
														part.type === "tool-scrapeUrl" &&
														part.state === "output-available"
													) {
														const output = part.output as ScrapeUrlToolOutput;
														const url = new URL(output.url);
														const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
														return (
															<Task
																key={`tool-${part.toolCallId}`}
																defaultOpen={false}
															>
																<TaskTrigger
																	title="Scraping URL"
																	icon={<Link className="size-4" />}
																/>
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
																key={`text-${messageIndex}-${index}`}
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
								})}
								{isLoading && (
									<div className="flex justify-start">
										<Loader variant="pulse-dot" size="sm" />
									</div>
								)}
							</>
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
					className="pb-4"
				>
					<PromptInput
						value={input}
						onValueChange={setInput}
						onSubmit={handleSubmit}
						isLoading={isLoading}
					>
						<PromptInputTextarea placeholder="Ask me anything..." />
						<PromptInputActions className="justify-between">
							<div className="flex items-center gap-2">
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
							<Button
								type="submit"
								size="icon"
								disabled={isLoading || !input.trim()}
								className="rounded-full h-8 w-8"
							>
								<ArrowUp className="h-4 w-4" />
							</Button>
						</PromptInputActions>
					</PromptInput>
				</form>
			</div>

			{showEditor && hasEditorContent && (
				<div className="flex flex-col flex-1 min-h-0 border-l relative">
					<Button
						variant="ghost"
						size="icon"
						onClick={closeEditor}
						className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full hover:bg-muted"
					>
						<X className="h-4 w-4" />
					</Button>
					<div className="flex-1 overflow-auto">
						<DocumentEditor
							ref={editorRef}
							initialContent={editorContent ?? ""}
							key={editorContent ?? ""}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default function ChatPage() {
	const params = useParams();
	const chatId = params.id as string;

	const initialDataRaw =
		typeof window !== "undefined"
			? sessionStorage.getItem(`chat-${chatId}-initial`)
			: null;
	const initialData = initialDataRaw ? JSON.parse(initialDataRaw) : null;

	const isNewChat = !!initialData;

	const { data: savedMessages, isLoading: isLoadingSavedMessages } =
		trpc.chat.get.useQuery({ chatId }, { enabled: !isNewChat });

	const isLoadingExistingChat = !isNewChat && isLoadingSavedMessages;

	if (isLoadingExistingChat) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<Loader variant="circular" size="lg" />
			</div>
		);
	}

	const initialMessages = isNewChat ? [] : savedMessages || [];

	return (
		<ChatInterface
			chatId={chatId}
			initialMessages={initialMessages}
			initialModel={initialData?.model || DEFAULT_MODEL}
			initialReasoning={initialData?.reasoning || false}
			isNewChat={isNewChat}
			initialPrompt={initialData?.prompt}
		/>
	);
}
