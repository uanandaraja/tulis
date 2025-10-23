import type { UIMessage } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chat } from "@/lib/db/schema";
import { getChatStorageKey, storage } from "@/lib/storage";
import type { StoredChatData } from "@/lib/types/chat";

export async function listChats(userId: string) {
	return db.query.chat.findMany({
		where: eq(chat.userId, userId),
		orderBy: [desc(chat.updatedAt)],
		limit: 50,
	});
}

export async function getChat(chatId: string, userId: string) {
	const chatData = await db.query.chat.findFirst({
		where: and(eq(chat.id, chatId), eq(chat.userId, userId)),
	});

	if (!chatData || !chatData.storageKey) {
		return null;
	}

	try {
		const content = await storage.file(chatData.storageKey).text();
		const data: StoredChatData = JSON.parse(content);
		return data.messages;
	} catch (error) {
		console.error("Failed to load chat from storage:", error);
		return null;
	}
}

export async function saveChat(
	userId: string,
	chatId: string,
	messages: UIMessage[],
	model?: string,
) {
	if (!messages) {
		throw new Error("Invalid request: messages required");
	}

	const storageKey = getChatStorageKey(userId, chatId);

	const chatData: StoredChatData = {
		chatId,
		userId,
		model,
		messages,
		updatedAt: new Date().toISOString(),
	};

	await storage.write(storageKey, JSON.stringify(chatData), {
		type: "application/json",
	});

	const title =
		messages
			.find((m) => m.role === "user")
			?.parts.find((p) => p.type === "text" && "text" in p)
			?.text?.slice(0, 100) || "New Chat";

	await db
		.insert(chat)
		.values({
			id: chatId,
			userId,
			title,
			model,
			storageKey,
			messageCount: messages.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: chat.id,
			set: {
				messageCount: messages.length,
				updatedAt: new Date(),
				model,
			},
		});

	return { success: true };
}

export async function deleteChat(chatId: string, userId: string) {
	// Get chat data to find storage key
	const chatData = await db.query.chat.findFirst({
		where: and(eq(chat.id, chatId), eq(chat.userId, userId)),
	});

	if (!chatData) {
		throw new Error("Chat not found");
	}

	// Delete from storage if storage key exists
	if (chatData.storageKey) {
		try {
			await storage.file(chatData.storageKey).delete();
		} catch (error) {
			// Storage deletion failed, but continue with DB deletion
		}
	}

	// Delete from database
	await db
		.delete(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)));

	return { success: true };
}
