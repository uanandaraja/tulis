import { useEffect, useRef } from "react";

interface UseAutoSendOptions {
	isNewChat: boolean;
	initialPrompt?: string;
	sendMessage: (message: { text: string }) => void;
	onBeforeSend?: () => void;
}

export function useAutoSend({
	isNewChat,
	initialPrompt,
	sendMessage,
	onBeforeSend,
}: UseAutoSendOptions) {
	const hasAutoSentRef = useRef(false);

	useEffect(() => {
		if (isNewChat && initialPrompt && !hasAutoSentRef.current) {
			hasAutoSentRef.current = true;

			onBeforeSend?.();

			sendMessage({
				text: initialPrompt,
			});

			if (typeof window !== "undefined") {
				const chatId = window.location.pathname.split("/").pop();
				if (chatId) {
					sessionStorage.removeItem(`chat-${chatId}-initial`);
				}
			}
		}
	}, [isNewChat, initialPrompt, sendMessage, onBeforeSend]);
}
