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
 * Unified document editing tool using Google's diff-match-patch library.
 * This tool provides a simple, reliable way to edit documents by specifying
 * what text to find and what to replace it with.
 */
export function createApplyDiffTool(context: ToolContext) {
	return tool({
		description:
			"Edit the document by finding and replacing text. This is the PRIMARY tool for making changes to existing documents. Provide the exact text you want to change (oldText) and what to replace it with (newText). The tool uses Google's diff-match-patch for reliable, fuzzy matching. Perfect for: updating paragraphs, fixing citations, changing specific sections, or making multiple edits in one operation.",
		inputSchema: z.object({
			changes: z
				.array(
					z.object({
						oldText: z
							.string()
							.describe(
								"The exact text to find. Should be substantial (at least a full sentence or paragraph) for reliable matching. Copy this EXACTLY from the document.",
							),
						newText: z
							.string()
							.describe(
								"What to replace it with. Use empty string '' to delete the text entirely.",
							),
					}),
				)
				.describe(
					"Array of changes to apply. Each change is applied sequentially. You can make multiple replacements in one call.",
				),
			description: z
				.string()
				.describe(
					"Brief description of what you changed (e.g., 'Converted citations from [1] to Harvard style', 'Updated introduction and added references section')",
				),
		}),
		execute: async ({ changes, description }) => {
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

				let currentContent = currentDoc.content;
				const appliedChanges: string[] = [];
				const failedChanges: string[] = [];

				// Apply each change sequentially
				for (let i = 0; i < changes.length; i++) {
					const { oldText, newText } = changes[i];

					// First try exact match
					if (currentContent.includes(oldText)) {
						// Use replaceAll for exact matches
						currentContent = currentContent.replaceAll(oldText, newText);
						appliedChanges.push(
							`Change ${i + 1}: Found and replaced exact match (${oldText.length} chars)`,
						);
					} else {
						// Try fuzzy matching with diff-match-patch
						const matchIndex = dmp.match_main(currentContent, oldText, 0);

						if (matchIndex !== -1) {
							// Found fuzzy match, use patch system
							const patches = dmp.patch_make(oldText, newText);
							const [patchedContent, results] = dmp.patch_apply(
								patches,
								currentContent,
							);

							if (results.every((r) => r === true)) {
								currentContent = patchedContent;
								appliedChanges.push(
									`Change ${i + 1}: Applied fuzzy match (${oldText.length} chars)`,
								);
							} else {
								failedChanges.push(
									`Change ${i + 1}: Patch application failed. Text may have changed.`,
								);
							}
						} else {
							// No match found
							failedChanges.push(
								`Change ${i + 1}: Could not find text. First 100 chars: "${oldText.slice(0, 100)}..."`,
							);
						}
					}
				}

				// Check if any changes were made
				if (appliedChanges.length === 0) {
					return {
						success: false,
						message: `No changes could be applied. ${failedChanges.join(" ")}`,
					};
				}

				// Generate diff for version history
				const diffs = dmp.diff_main(currentDoc.content, currentContent);
				dmp.diff_cleanupSemantic(diffs);
				const diffHtml = dmp.diff_prettyHtml(diffs);

				// Update document
				const updatedDoc = await updateDocument(
					documentId,
					userId,
					currentContent,
					"assistant",
					description,
					diffHtml,
				);

				// Get version info
				const latestVersion = await db.query.documentVersion.findFirst({
					where: eq(documentVersion.documentId, updatedDoc.id),
					orderBy: [desc(documentVersion.versionNumber)],
				});

				return {
					success: true,
					documentId: updatedDoc.id,
					versionId: latestVersion?.id,
					versionNumber: latestVersion?.versionNumber,
					appliedChanges: appliedChanges.length,
					failedChanges: failedChanges.length,
					details: {
						applied: appliedChanges,
						failed: failedChanges,
					},
					message: `Successfully applied ${appliedChanges.length} change(s). ${description}${failedChanges.length > 0 ? ` Warning: ${failedChanges.length} change(s) failed.` : ""}`,
				};
			} catch (error) {
				console.error("Error in applyDiff:", error);
				return {
					success: false,
					message: `Failed to apply changes: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
