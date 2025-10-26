"use client";

import type { UIMessage } from "ai";
import { useRef, useState } from "react";
import type { EditorHandle } from "@/components/editor/document-editor";
import { useAutoSend } from "@/hooks/use-auto-send";
import { useChatState } from "@/hooks/use-chat-state";
import { useEditorState } from "@/hooks/use-editor-state";
import { usePlanStepsState } from "@/hooks/use-plan-steps-state";
import { modelSupportsReasoning } from "@/lib/constants/models";
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
				<ChatMessages
					messages={messages}
					isLoading={isLoading}
					selectedModel={selectedModel}
					isStreaming={isStreaming}
					enableReasoning={enableReasoning}
					allPlanSteps={allPlanSteps}
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
				/>
			</div>

			{showEditor && hasEditorContent && (
				<EditorPanel
					ref={editorRef}
					editorContent={editorContent ?? ""}
					onClose={closeEditor}
					documentId={documentId}
				/>
			)}
		</div>
	);
}
