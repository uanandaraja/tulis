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

function findSectionBoundaries(
	content: string,
	sectionTitle: string,
): { start: number; end: number } | null {
	const lines = content.split("\n");
	let startLine = -1;
	let endLine = lines.length;

	// Find the section header
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		// Match markdown headers (# Title, ## Title, etc.)
		if (
			line.match(/^#{1,6}\s+/) &&
			line.toLowerCase().includes(sectionTitle.toLowerCase())
		) {
			startLine = i;
			break;
		}
	}

	if (startLine === -1) {
		return null;
	}

	// Find where this section ends (next header of same or higher level, or end of document)
	const headerLevel = lines[startLine].match(/^(#{1,6})/)?.[1].length || 1;

	for (let i = startLine + 1; i < lines.length; i++) {
		const line = lines[i].trim();
		const match = line.match(/^(#{1,6})\s+/);
		if (match && match[1].length <= headerLevel) {
			endLine = i;
			break;
		}
	}

	return { start: startLine, end: endLine };
}

function replaceLineRange(
	content: string,
	startLine: number,
	endLine: number,
	newContent: string | null,
): string {
	const lines = content.split("\n");
	const before = lines.slice(0, startLine);
	const after = lines.slice(endLine);

	if (newContent === null) {
		// Delete operation
		return [...before, ...after].join("\n");
	}

	return [...before, newContent, ...after].join("\n");
}

export function createEditContentTool(context: ToolContext) {
	return tool({
		description:
			"Edit specific parts of the document content. Use this to modify existing content without rewriting the entire document.",
		inputSchema: z.object({
			selectionMode: z
				.enum(["search", "section", "range"])
				.describe(
					"How to select content: 'search' finds text, 'section' finds by heading, 'range' uses line numbers",
				),
			searchText: z
				.string()
				.optional()
				.describe("Text to search for (required when selectionMode='search')"),
			sectionTitle: z
				.string()
				.optional()
				.describe(
					"Section heading to find (required when selectionMode='section')",
				),
			startLine: z
				.number()
				.optional()
				.describe("Start line number (required when selectionMode='range')"),
			endLine: z
				.number()
				.optional()
				.describe("End line number (required when selectionMode='range')"),
			operation: z
				.enum(["replace", "delete"])
				.describe("What to do with selected content"),
			newContent: z
				.string()
				.optional()
				.describe("New content (required when operation='replace')"),
		}),
		execute: async ({
			selectionMode,
			searchText,
			sectionTitle,
			startLine,
			endLine,
			operation,
			newContent,
		}) => {
			const { userId, documentId } = context;

			try {
				// Validate inputs
				if (selectionMode === "search" && !searchText) {
					return {
						success: false,
						message: "searchText is required when selectionMode='search'",
					};
				}

				if (selectionMode === "section" && !sectionTitle) {
					return {
						success: false,
						message: "sectionTitle is required when selectionMode='section'",
					};
				}

				if (
					selectionMode === "range" &&
					(startLine === undefined || endLine === undefined)
				) {
					return {
						success: false,
						message:
							"startLine and endLine are required when selectionMode='range'",
					};
				}

				if (operation === "replace" && !newContent) {
					return {
						success: false,
						message: "newContent is required when operation='replace'",
					};
				}

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
				let changeDescription = "";

				// Perform the edit based on selection mode
				if (selectionMode === "search" && searchText) {
					// Check if search text exists in document
					if (!updatedContent.includes(searchText)) {
						return {
							success: false,
							message: `Text "${searchText.slice(0, 50)}" not found in document`,
						};
					}

					// Count occurrences for better feedback
					const occurrences = (
						updatedContent.match(
							new RegExp(
								searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
								"g",
							),
						) || []
					).length;

					// Apply changes
					if (operation === "replace" && newContent) {
						// Use diff-match-patch for precise replacement
						const diffs = dmp.diff_main(searchText, newContent);
						const patches = dmp.patch_make(updatedContent, diffs);
						const results = dmp.patch_apply(patches, updatedContent);
						updatedContent = results[0] as string;
						changeDescription = `Replaced ${occurrences} occurrence(s) of "${searchText.slice(0, 50)}"`;
					} else if (operation === "delete") {
						// Use diff-match-patch for precise deletion
						const diffs = dmp.diff_main(searchText, "");
						const patches = dmp.patch_make(updatedContent, diffs);
						const results = dmp.patch_apply(patches, updatedContent);
						updatedContent = results[0] as string;
						changeDescription = `Deleted ${occurrences} occurrence(s) of "${searchText.slice(0, 50)}"`;
					}
				} else if (selectionMode === "section" && sectionTitle) {
					// Find section and replace/delete it
					const bounds = findSectionBoundaries(updatedContent, sectionTitle);
					if (!bounds) {
						return {
							success: false,
							message: `Section "${sectionTitle}" not found in document`,
						};
					}

					updatedContent = replaceLineRange(
						updatedContent,
						bounds.start,
						bounds.end,
						operation === "replace" && newContent ? newContent : null,
					);
					changeDescription = `${operation === "replace" ? "Replaced" : "Deleted"} section "${sectionTitle}"`;
				} else if (
					selectionMode === "range" &&
					startLine !== undefined &&
					endLine !== undefined
				) {
					// Replace/delete line range
					updatedContent = replaceLineRange(
						updatedContent,
						startLine,
						endLine,
						operation === "replace" && newContent ? newContent : null,
					);
					changeDescription = `${operation === "replace" ? "Replaced" : "Deleted"} lines ${startLine}-${endLine}`;
				} else {
					// No valid selection mode was provided
					return {
						success: false,
						message: "Invalid selection mode or missing required parameters",
					};
				}

				// If no change was made, return early
				if (!changeDescription) {
					return {
						success: false,
						message: "No changes were made to the document",
					};
				}

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
					operation,
					selectionMode,
					documentId: updatedDoc.id,
					versionId,
					versionNumber,
					message: `Successfully ${operation === "replace" ? "replaced" : "deleted"} content. ${changeDescription}`,
				};
			} catch (error) {
				console.error("Error in editContent:", error);
				return {
					success: false,
					message: `Failed to edit content: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
