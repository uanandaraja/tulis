import { tool } from "ai";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { documentVersion } from "@/lib/db/schema";
import {
	getDocument,
	updateDocument,
} from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

export function createRemoveCitationsTool(context: ToolContext) {
	return tool({
		description:
			"Remove ALL inline citations from the document in ONE operation. This tool removes citation patterns like [1], [2], [3], etc., and can also remove the References section. Use this ONCE to remove all citations from the entire document.",
		inputSchema: z.object({
			removeReferencesSection: z
				.boolean()
				.optional()
				.default(true)
				.describe(
					"Whether to also remove the '## References' section and all citations below it",
				),
		}),
		execute: async ({ removeReferencesSection }) => {
			const { userId, documentId } = context;

			try {
				// Need document to edit
				if (!documentId) {
					return {
						success: false,
						message:
							"No document found in current chat. Please create a document first using writeToEditor.",
					};
				}

				// Get current document
				const currentDoc = await getDocument(documentId, userId);
				if (!currentDoc) {
					return {
						success: false,
						message: "Document not found",
					};
				}

				let updatedContent = currentDoc.content;
				let citationsRemoved = 0;

				// Remove inline citations like [1], [2], [3], etc.
				const citationRegex = /\[\d+\]/g;
				const citationMatches = updatedContent.match(citationRegex) || [];
				citationsRemoved = citationMatches.length;

				updatedContent = updatedContent.replace(citationRegex, "");

				// Clean up extra spaces left by removed citations
				updatedContent = updatedContent
					.replace(/\s+/g, " ")
					.replace(/\n\s*\n/g, "\n\n");

				// Remove references section if requested
				let referencesRemoved = false;
				if (removeReferencesSection) {
					const referencesSectionRegex = /\n## References\n[\s\S]*$/;
					if (referencesSectionRegex.test(updatedContent)) {
						updatedContent = updatedContent.replace(referencesSectionRegex, "");
						referencesRemoved = true;
					}
				}

				// Clean up any trailing whitespace
				updatedContent = updatedContent.trim();

				// Update document with cleaned content
				const updatedDoc = await updateDocument(
					documentId,
					userId,
					updatedContent,
					"assistant",
					`Removed ${citationsRemoved} inline citation${citationsRemoved === 1 ? "" : "s"}${referencesRemoved ? " and References section" : ""}`,
				);

				// Get the version info from the document that was just updated
				const latestVersion = await db.query.documentVersion.findFirst({
					where: eq(documentVersion.documentId, updatedDoc.id),
					orderBy: [desc(documentVersion.versionNumber)],
				});

				const versionId = latestVersion?.id;
				const versionNumber = latestVersion?.versionNumber;

				return {
					success: true,
					documentId: updatedDoc.id,
					versionId,
					versionNumber,
					citationsRemoved,
					referencesRemoved,
					message: `Successfully removed ${citationsRemoved} inline citation${citationsRemoved === 1 ? "" : "s"}${referencesRemoved ? " and the References section" : ""} from the document.`,
				};
			} catch (error) {
				console.error("Error in removeCitations:", error);
				return {
					success: false,
					message: `Failed to remove citations: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
