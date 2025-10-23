import { desc, eq, and } from "drizzle-orm";
import type { UIMessage } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { chat } from "@/lib/db/schema";
import { getChatStorageKey, storage } from "@/lib/storage";
import { protectedProcedure, router } from "@/server/trpc";
import type { StoredChatData } from "@/lib/types/chat";

export const chatRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return db.query.chat.findMany({
			where: eq(chat.userId, ctx.user.id),
			orderBy: [desc(chat.updatedAt)],
			limit: 50,
		});
	}),

	get: protectedProcedure
		.input(z.object({ chatId: z.string() }))
		.query(async ({ ctx, input }) => {
			console.log("Loading chat:", input.chatId);

			const chatData = await db.query.chat.findFirst({
				where: and(eq(chat.id, input.chatId), eq(chat.userId, ctx.user.id)),
			});

			console.log("Chat data from DB:", chatData);

			if (!chatData || !chatData.storageKey) {
				console.log("No chat data or storage key");
				return null;
			}

			try {
				console.log("Fetching from S3:", chatData.storageKey);
				const content = await storage.file(chatData.storageKey).text();
				console.log("S3 content length:", content.length);
				const data: StoredChatData = JSON.parse(content);
				console.log("Parsed messages count:", data.messages?.length);
				return data.messages;
			} catch (error) {
				console.error("Failed to load chat from S3:", error);
				return null;
			}
		}),

	save: protectedProcedure
		.input(
			z.object({
				chatId: z.string(),
				messages: z.custom<UIMessage[]>(),
				model: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { chatId, messages, model } = input;

			if (!messages) {
				throw new Error("Invalid request: messages required");
			}

			const storageKey = getChatStorageKey(ctx.user.id, chatId);

			const chatData: StoredChatData = {
				chatId,
				userId: ctx.user.id,
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
					userId: ctx.user.id,
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
		}),
});
