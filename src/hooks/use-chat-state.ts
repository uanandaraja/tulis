import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { isToolUIPart, DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { WritingAgentUIMessage } from "@/server/agents/writing-agent";

interface UseChatStateProps {
	chatId: string;
	initialMessages: UIMessage[];
	selectedModel: string;
	enableReasoning: boolean;
	supportsReasoning: boolean;
}

export function useChatState({
	chatId,
	initialMessages,
	selectedModel,
	enableReasoning,
	supportsReasoning,
}: UseChatStateProps) {
	const utils = trpc.useUtils();
	const [documentId, setDocumentId] = useState<string | null>(null);
	const documentIdRef = useRef<string | null>(null);

	const saveChatMutation = trpc.chat.save.useMutation({
		onSuccess: () => {
			utils.chat.list.invalidate();
		},
	});

	const { messages, sendMessage, status, error } =
		useChat<WritingAgentUIMessage>({
			id: chatId,
			messages: initialMessages as WritingAgentUIMessage[],
			transport: new DefaultChatTransport({
				api: "/api/chat",
				body: () => ({
					selectedModel,
					enableReasoning: enableReasoning && supportsReasoning,
					chatId,
					documentId: documentIdRef.current,
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

	// Extract documentId from writeToEditor tool results
	useEffect(() => {
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
				const output = part.output as {
					success: boolean;
					documentId?: string;
				};

				if (output.success && output.documentId) {
					documentIdRef.current = output.documentId;
					setDocumentId(output.documentId);
					return;
				}
			}
		}
	}, [messages]);

	const isLoading = status === "submitted" || status === "streaming";
	const isStreaming = status === "streaming";

	return {
		messages,
		sendMessage,
		status,
		error,
		isLoading,
		isStreaming,
		utils,
		documentId,
	};
}
