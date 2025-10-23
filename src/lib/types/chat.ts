import type { UIMessage } from "ai";

export interface StoredChatData {
	chatId: string;
	userId: string;
	model?: string;
	messages: UIMessage[];
	updatedAt: string;
}
