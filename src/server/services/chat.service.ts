import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, type UIMessage } from "ai";
import { and, desc, eq, isNull } from "drizzle-orm";
import { CHAT_TITLE_GENERATION_MODEL } from "@/lib/constants/models";
import { db } from "@/lib/db";
import { chat } from "@/lib/db/schema";
import { TITLE_GENERATION_PROMPT } from "@/lib/prompts";
import { getChatStorageKey, storage } from "@/lib/storage";
import type { StoredChatData } from "@/lib/types/chat";

export async function listChats(userId: string) {
	return db.query.chat.findMany({
		where: and(eq(chat.userId, userId), isNull(chat.deletedAt)),
		orderBy: [desc(chat.updatedAt)],
		limit: 50,
	});
}

export async function getChat(chatId: string, userId: string) {
	const chatData = await db.query.chat.findFirst({
		where: and(
			eq(chat.id, chatId),
			eq(chat.userId, userId),
			isNull(chat.deletedAt),
		),
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

	const existingChat = await db.query.chat.findFirst({
		where: eq(chat.id, chatId),
	});

	let title = existingChat?.title || "New Chat";

	// Only generate title if chat doesn't exist or has default title
	if (!existingChat || existingChat.title === "New Chat") {
		const userMessage = messages.find((m) => m.role === "user");
		const userPrompt = userMessage?.parts.find(
			(p) => p.type === "text" && "text" in p,
		)?.text;

		if (userPrompt) {
			title = await generateChatTitle(userPrompt);
		}
	}

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
				title,
				storageKey,
				messageCount: messages.length,
				updatedAt: new Date(),
				model,
			},
		});

	return { success: true };
}

export async function deleteChat(chatId: string, userId: string) {
	// Soft delete by setting deletedAt timestamp
	const result = await db
		.update(chat)
		.set({ deletedAt: new Date() })
		.where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
		.returning({ storageKey: chat.storageKey });

	if (result.length === 0) {
		throw new Error("Chat not found");
	}

	return { success: true };
}

export async function initializeChat(
	userId: string,
	chatId: string,
	model?: string,
) {
	// Check if chat already exists
	const existingChat = await db.query.chat.findFirst({
		where: eq(chat.id, chatId),
	});

	if (existingChat) {
		return { success: true, alreadyExists: true };
	}

	// Create minimal chat record
	await db.insert(chat).values({
		id: chatId,
		userId,
		title: "New Chat",
		model,
		messageCount: 0,
		storageKey: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return { success: true, alreadyExists: false };
}

export async function generateChatTitle(userPrompt: string): Promise<string> {
	try {
		const { text } = await generateText({
			model: openrouter(CHAT_TITLE_GENERATION_MODEL),
			prompt: `${TITLE_GENERATION_PROMPT}\n\nUser message: ${userPrompt}`,
		});

		return text.trim().slice(0, 50);
	} catch (error) {
		console.error("Failed to generate chat title:", error);
		return userPrompt.slice(0, 50);
	}
}
