"use client";

import type { UIMessage } from "ai";
import { useRef, useState } from "react";
import type { EditorHandle } from "@/components/editor/document-editor";
import { useAutoSend } from "@/hooks/use-auto-send";
import { useChatState } from "@/hooks/use-chat-state";
import { useEditorState } from "@/hooks/use-editor-state";
import { usePlanStepsState } from "@/hooks/use-plan-steps-state";
import { modelSupportsReasoning } from "@/lib/constants/models";
import { trpc } from "@/lib/trpc/react";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { EditorPanel } from "./editor-panel";

interface ChatInterfaceProps {
	chatId: string;
	initialMessages: UIMessage[];
	initialModel: string;
	initialReasoning: boolean;
	isNewChat: boolean;
	initialPrompt?: string;
}

export function ChatInterface({
	chatId,
	initialMessages,
	initialModel,
	initialReasoning,
	isNewChat,
	initialPrompt,
}: ChatInterfaceProps) {
	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(initialModel);
	const [enableReasoning, setEnableReasoning] = useState(initialReasoning);
	const editorRef = useRef<EditorHandle>(null);

	const supportsReasoning = modelSupportsReasoning(selectedModel);

	const {
		messages,
		sendMessage,
		error,
		isLoading,
		isStreaming,
		utils,
		documentId,
	} = useChatState({
		chatId,
		initialMessages,
		selectedModel,
		enableReasoning,
		supportsReasoning,
	});

	const {
		editorContent,
		hasContent: hasEditorContent,
		isOpen: showEditor,
		selectedVersionId,
		currentVersionNumber,
		latestVersionContent,
		open: openEditor,
		close: closeEditor,
		showVersion,
		showLatest,
	} = useEditorState(messages, documentId);

	// Fetch plan from DB (new way)
	const { data: dbPlan } = trpc.plan.getActive.useQuery({ chatId });

	// Extract plan from messages (old way - for backwards compatibility)
	const { allPlanSteps: messagePlanSteps } = usePlanStepsState(messages);

	// Use DB plan if it exists, otherwise fall back to message-based plans
	const allPlanSteps = dbPlan
		? [
				{
					messageId: "db-plan",
					toolCallId: dbPlan.id,
					output: {
						success: true,
						steps: dbPlan.steps.map((step) => ({
							title: step.title,
							description: step.description || "",
							status: step.status as "pending" | "in_progress" | "completed",
						})),
						message: "Plan from database",
					},
				},
			]
		: messagePlanSteps;

	// Get the latest plan steps for display above input
	const latestPlanSteps =
		allPlanSteps.length > 0
			? allPlanSteps[allPlanSteps.length - 1].output
			: null;

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
						deletedAt: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					...old,
				];
			});
		},
	});

	const handleSubmit = () => {
		if (input.trim() && !isLoading) {
			sendMessage({
				text: input,
			});
			setInput("");
		}
	};

	const handleDocumentUpdate = () => {
		// Refresh the editor content when document is restored
		utils.chat.invalidate();
		utils.document.get.invalidate({ documentId: documentId! });
	};

	return (
		<div
			className={`flex h-screen gap-4 px-4 w-full overflow-x-hidden ${showEditor ? "max-w-none" : "max-w-2xl mx-auto"}`}
		>
			<div
				className={`flex flex-col min-h-0 min-w-0 flex-shrink-0 ${showEditor ? "w-[600px]" : "flex-1"}`}
			>
				<ChatMessages
					messages={messages}
					isLoading={isLoading}
					selectedModel={selectedModel}
					isStreaming={isStreaming}
					enableReasoning={enableReasoning}
					allPlanSteps={allPlanSteps}
					onShowDocument={(versionId) => {
						if (versionId) {
							showVersion(versionId);
						} else {
							showLatest();
						}
					}}
				/>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
						Error: {error.message}
					</div>
				)}

				<ChatInput
					input={input}
					onInputChange={setInput}
					onSubmit={handleSubmit}
					isLoading={isLoading}
					selectedModel={selectedModel}
					onModelChange={setSelectedModel}
					enableReasoning={enableReasoning}
					onReasoningToggle={() => setEnableReasoning(!enableReasoning)}
					supportsReasoning={supportsReasoning}
					planSteps={latestPlanSteps}
				/>
			</div>

			{showEditor && hasEditorContent && (
				<EditorPanel
					ref={editorRef}
					editorContent={editorContent ?? ""}
					onClose={closeEditor}
					documentId={documentId}
					selectedVersionId={selectedVersionId}
					currentVersionNumber={currentVersionNumber}
					latestVersionContent={latestVersionContent}
					onDocumentUpdate={handleDocumentUpdate}
					onShowLatest={showLatest}
				/>
			)}
		</div>
	);
}
