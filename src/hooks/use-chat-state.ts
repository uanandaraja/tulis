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

	// Extract documentId from writeToEditor tool results and invalidate cache
	useEffect(() => {
		let newDocumentId: string | null = null;

		for (const message of [...messages].reverse()) {
			if (message.role !== "assistant") continue;

			// Check for any document editing tool that creates/updates documents
			const documentToolParts = message.parts.filter(
				(part) =>
					isToolUIPart(part) &&
					(part.type === "tool-writeToEditor" ||
						part.type === "tool-batchEdit" ||
						part.type === "tool-editContent" ||
						part.type === "tool-insertContent" ||
						part.type === "tool-removeCitations") &&
					part.state === "output-available",
			);

			for (const part of documentToolParts) {
				if (!isToolUIPart(part)) continue;
				const output = part.output as {
					success: boolean;
					documentId?: string;
				};

				if (output.success && output.documentId) {
					newDocumentId = output.documentId;
					break;
				}
			}
		}

		// Update documentId state and invalidate cache if changed
		if (newDocumentId && newDocumentId !== documentIdRef.current) {
			documentIdRef.current = newDocumentId;
			setDocumentId(newDocumentId);
			// Invalidate document cache to force fresh data
			utils.document.get.invalidate({ documentId: newDocumentId });
		}
	}, [messages, utils, documentId]);

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
