import type { UIMessage } from "ai";
import { z } from "zod";
import {
	deleteChat,
	getChat,
	initializeChat,
	listChats,
	saveChat,
} from "@/server/services/chat.service";
import { protectedProcedure, router } from "@/server/trpc";

export const chatRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return listChats(ctx.user.id);
	}),

	get: protectedProcedure
		.input(z.object({ chatId: z.string() }))
		.query(async ({ ctx, input }) => {
			return getChat(input.chatId, ctx.user.id);
		}),

	initialize: protectedProcedure
		.input(
			z.object({
				chatId: z.string(),
				model: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return initializeChat(ctx.user.id, input.chatId, input.model);
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
			return saveChat(ctx.user.id, chatId, messages, model);
		}),

	delete: protectedProcedure
		.input(z.object({ chatId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return deleteChat(input.chatId, ctx.user.id);
		}),
});
