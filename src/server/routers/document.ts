import { z } from "zod";
import {
	createDocument,
	deleteDocument,
	getDocument,
	getDocumentVersion,
	listDocuments,
	listDocumentVersions,
	restoreVersion,
	updateDocument,
} from "@/server/services/document.service";
import { protectedProcedure, router } from "@/server/trpc";

export const documentRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				content: z.string(),
				chatId: z.string().optional(),
				changeDescription: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return createDocument(
				ctx.user.id,
				input.title,
				input.content,
				input.chatId,
				"user",
				input.changeDescription,
			);
		}),

	update: protectedProcedure
		.input(
			z.object({
				documentId: z.string(),
				content: z.string(),
				changeDescription: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return updateDocument(
				input.documentId,
				ctx.user.id,
				input.content,
				"user",
				input.changeDescription,
			);
		}),

	get: protectedProcedure
		.input(z.object({ documentId: z.string() }))
		.query(async ({ ctx, input }) => {
			return getDocument(input.documentId, ctx.user.id);
		}),

	list: protectedProcedure
		.input(z.object({ limit: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			return listDocuments(ctx.user.id, input.limit);
		}),

	listVersions: protectedProcedure
		.input(
			z.object({
				documentId: z.string(),
				limit: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return listDocumentVersions(input.documentId, ctx.user.id, input.limit);
		}),

	getVersion: protectedProcedure
		.input(z.object({ versionId: z.string() }))
		.query(async ({ ctx, input }) => {
			return getDocumentVersion(input.versionId, ctx.user.id);
		}),

	restoreVersion: protectedProcedure
		.input(z.object({ versionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return restoreVersion(input.versionId, ctx.user.id);
		}),

	delete: protectedProcedure
		.input(z.object({ documentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return deleteDocument(input.documentId, ctx.user.id);
		}),
});
