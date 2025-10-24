import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";

export function useInitialMessages<T extends UIMessage>(
	currentMessages: T[],
	initialMessages: T[] | null | undefined,
	setMessages: (messages: T[]) => void,
) {
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;

		if (
			initialMessages &&
			initialMessages.length > 0 &&
			currentMessages.length === 0
		) {
			initialized.current = true;
			setMessages(initialMessages);
		}
	}, []);
}
