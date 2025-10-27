import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport, isToolUIPart } from "ai";
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
	const chatInitializedRef = useRef(false);

	const initializeChatMutation = trpc.chat.initialize.useMutation();

	const saveChatMutation = trpc.chat.save.useMutation({
		onSuccess: () => {
			utils.chat.list.invalidate();
		},
	});

	const {
		messages,
		sendMessage: originalSendMessage,
		status,
		error,
	} = useChat<WritingAgentUIMessage>({
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

	// Wrapper for sendMessage that initializes chat first
	const sendMessage: typeof originalSendMessage = async (message) => {
		// Initialize chat in DB before first message
		if (!chatInitializedRef.current) {
			try {
				await initializeChatMutation.mutateAsync({
					chatId,
					model: selectedModel,
				});
				chatInitializedRef.current = true;
			} catch (error) {
				console.error("Failed to initialize chat:", error);
				// Continue anyway - chat might already exist
			}
		}
		return originalSendMessage(message);
	};

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
