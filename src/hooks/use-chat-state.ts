import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
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
	};
}
