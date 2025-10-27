import { tool } from "ai";
import { diff_match_patch } from "diff-match-patch";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { documentVersion } from "@/lib/db/schema";
import {
	getDocument,
	updateDocument,
} from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

const dmp = new diff_match_patch();

/**
 * Find and replace content using diff-match-patch for precise matching.
 * This tool is much simpler for LLMs to use - just provide the old text and new text.
 */
export function createReplaceContentTool(context: ToolContext) {
	return tool({
		description:
			"Find and replace content in the document. Provide the exact text you want to replace (oldText) and what to replace it with (newText). This tool uses fuzzy matching to find the content even if there are minor differences. Perfect for editing specific paragraphs, sentences, or sections.",
		inputSchema: z.object({
			oldText: z
				.string()
				.describe(
					"The exact text to find and replace. Should be a substantial chunk (at least a sentence or paragraph) for reliable matching. Include enough context to uniquely identify the location.",
				),
			newText: z
				.string()
				.describe(
					"The new text to replace the old text with. Use empty string to delete the text.",
				),
			description: z
				.string()
				.optional()
				.describe(
					"Brief description of what changed (e.g., 'Updated citation format', 'Fixed grammar in introduction')",
				),
		}),
		execute: async ({ oldText, newText, description }) => {
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

				// Check if oldText exists in document (exact match first)
				if (!currentDoc.content.includes(oldText)) {
					// Try fuzzy matching using diff-match-patch
					const match = dmp.match_main(currentDoc.content, oldText, 0);

					if (match === -1) {
						return {
							success: false,
							message: `Could not find the specified text in the document. Make sure oldText exactly matches the content you want to replace. First 100 chars of oldText: "${oldText.slice(0, 100)}..."`,
						};
					}
				}

				// Create patches from the old to new text
				const patches = dmp.patch_make(oldText, newText);

				// Apply patches to the document
				const [updatedContent, results] = dmp.patch_apply(
					patches,
					currentDoc.content,
				);

				// Check if all patches applied successfully
				const allSuccess = results.every((r) => r === true);

				if (!allSuccess) {
					return {
						success: false,
						message:
							"Could not apply all changes. The text might have changed or the match was ambiguous.",
					};
				}

				// Generate change description
				const changeDescription =
					description ||
					`Replaced text: "${oldText.slice(0, 50)}${oldText.length > 50 ? "..." : ""}"`;

				// Update document with new content
				const updatedDoc = await updateDocument(
					documentId,
					userId,
					updatedContent,
					"assistant",
					changeDescription,
				);

				// Get version info from the document that was just updated
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
					changeDescription,
					message: `Successfully replaced content. ${changeDescription}`,
				};
			} catch (error) {
				console.error("Error in replaceContent:", error);
				return {
					success: false,
					message: `Failed to replace content: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
