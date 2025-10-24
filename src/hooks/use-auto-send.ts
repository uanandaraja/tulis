import { useEffect, useRef } from "react";

interface UseAutoSendOptions {
	isNewChat: boolean;
	initialPrompt?: string;
	sendMessage: (
		options: {
			text: string;
		},
		body?: { body: Record<string, unknown> },
	) => void;
	selectedModel: string;
	enableReasoning: boolean;
	supportsReasoning: boolean;
	onBeforeSend?: () => void;
}

export function useAutoSend({
	isNewChat,
	initialPrompt,
	sendMessage,
	selectedModel,
	enableReasoning,
	supportsReasoning,
	onBeforeSend,
}: UseAutoSendOptions) {
	const hasAutoSentRef = useRef(false);

	useEffect(() => {
		if (isNewChat && initialPrompt && !hasAutoSentRef.current) {
			hasAutoSentRef.current = true;

			onBeforeSend?.();

			sendMessage(
				{
					text: initialPrompt,
				},
				{
					body: {
						selectedModel,
						enableReasoning: enableReasoning && supportsReasoning,
					},
				},
			);

			if (typeof window !== "undefined") {
				const chatId = window.location.pathname.split("/").pop();
				if (chatId) {
					sessionStorage.removeItem(`chat-${chatId}-initial`);
				}
			}
		}
	}, [
		isNewChat,
		initialPrompt,
		sendMessage,
		selectedModel,
		enableReasoning,
		supportsReasoning,
		onBeforeSend,
	]);
}
