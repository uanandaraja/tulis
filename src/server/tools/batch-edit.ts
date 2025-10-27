import { tool } from "ai";
import { diff_match_patch } from "diff-match-patch";
import { z } from "zod";
import {
	getDocument,
	updateDocument,
} from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

const dmp = new diff_match_patch();

interface EditOperation {
	type: "replace" | "delete" | "insert";
	selectionMode: "search" | "section" | "range";
	searchText?: string;
	sectionTitle?: string;
	startLine?: number;
	endLine?: number;
	newContent?: string;
}

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

function applyEditOperation(
	content: string,
	operation: EditOperation,
): { success: boolean; result: string; error?: string } {
	try {
		let updatedContent = content;

		if (operation.selectionMode === "search" && operation.searchText) {
			if (operation.type === "replace" && operation.newContent) {
				updatedContent = updatedContent.replaceAll(
					operation.searchText,
					operation.newContent,
				);
			} else if (operation.type === "delete") {
				updatedContent = updatedContent.replaceAll(operation.searchText, "");
			} else if (operation.type === "insert" && operation.newContent) {
				// Insert after the search text
				updatedContent = updatedContent.replaceAll(
					operation.searchText,
					operation.searchText + operation.newContent,
				);
			}
		} else if (
			operation.selectionMode === "section" &&
			operation.sectionTitle
		) {
			const bounds = findSectionBoundaries(
				updatedContent,
				operation.sectionTitle,
			);
			if (!bounds) {
				return {
					success: false,
					result: content,
					error: `Section "${operation.sectionTitle}" not found`,
				};
			}

			const lines = updatedContent.split("\n");
			const before = lines.slice(0, bounds.start);
			const after = lines.slice(bounds.end);

			if (operation.type === "replace" && operation.newContent) {
				updatedContent = [...before, operation.newContent, ...after].join("\n");
			} else if (operation.type === "delete") {
				updatedContent = [...before, ...after].join("\n");
			} else if (operation.type === "insert" && operation.newContent) {
				// Insert at the beginning of the section
				updatedContent = [
					...before,
					operation.newContent,
					...lines.slice(bounds.start, bounds.end),
					...after,
				].join("\n");
			}
		} else if (
			operation.selectionMode === "range" &&
			operation.startLine !== undefined &&
			operation.endLine !== undefined
		) {
			const lines = updatedContent.split("\n");
			const before = lines.slice(0, operation.startLine);
			const after = lines.slice(operation.endLine);

			if (operation.type === "replace" && operation.newContent) {
				updatedContent = [...before, operation.newContent, ...after].join("\n");
			} else if (operation.type === "delete") {
				updatedContent = [...before, ...after].join("\n");
			} else if (operation.type === "insert" && operation.newContent) {
				// Insert at the start line position
				updatedContent = [
					...before,
					operation.newContent,
					...lines.slice(operation.startLine),
					...after,
				].join("\n");
			}
		} else {
			return {
				success: false,
				result: content,
				error: "Invalid selection mode or missing required parameters",
			};
		}

		return { success: true, result: updatedContent };
	} catch (error) {
		return {
			success: false,
			result: content,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

function generateDiff(oldText: string, newText: string): string {
	const diffs = dmp.diff_main(oldText, newText);
	dmp.diff_cleanupSemantic(diffs);
	return dmp.diff_prettyHtml(diffs);
}

export function createBatchEditTool(context: ToolContext) {
	return tool({
		description:
			"Apply multiple edits to a document in a single operation. This creates only one version regardless of the number of edits. Use this for complex revisions involving multiple changes.",
		inputSchema: z.object({
			edits: z
				.array(
					z.object({
						type: z
							.enum(["replace", "delete", "insert"])
							.describe("Type of edit operation"),
						selectionMode: z
							.enum(["search", "section", "range"])
							.describe("How to select content"),
						searchText: z
							.string()
							.optional()
							.describe(
								"Text to search for (required when selectionMode='search')",
							),
						sectionTitle: z
							.string()
							.optional()
							.describe(
								"Section heading to find (required when selectionMode='section')",
							),
						startLine: z
							.number()
							.optional()
							.describe(
								"Start line number (required when selectionMode='range')",
							),
						endLine: z
							.number()
							.optional()
							.describe(
								"End line number (required when selectionMode='range')",
							),
						newContent: z
							.string()
							.optional()
							.describe(
								"New content (required for replace and insert operations)",
							),
					}),
				)
				.describe("Array of edit operations to apply in sequence"),
			summary: z
				.string()
				.describe(
					"Brief summary of all changes being made (e.g., 'Added 3 new sections and reorganized the introduction')",
				),
		}),
		execute: async ({ edits, summary }) => {
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
				const appliedEdits: string[] = [];
				const failedEdits: string[] = [];

				// Apply each edit operation in sequence
				for (let i = 0; i < edits.length; i++) {
					const edit = edits[i];
					const result = applyEditOperation(updatedContent, edit);

					if (result.success) {
						updatedContent = result.result;
						appliedEdits.push(
							`${edit.type} (${edit.selectionMode}): ${edit.searchText || edit.sectionTitle || `lines ${edit.startLine}-${edit.endLine}`}`,
						);
					} else {
						failedEdits.push(`Edit ${i + 1}: ${result.error}`);
					}
				}

				// Generate diff for display
				const diff = generateDiff(currentDoc.content, updatedContent);

				// Update document with new content (single version)
				const updatedDoc = await updateDocument(
					documentId,
					userId,
					updatedContent,
					"assistant",
					summary,
					diff,
				);

				return {
					success: true,
					documentId: updatedDoc.id,
					summary,
					appliedEdits,
					failedEdits,
					diff,
					message: `Successfully applied ${appliedEdits.length} edit(s). ${failedEdits.length > 0 ? `${failedEdits.length} edit(s) failed.` : ""}`,
				};
			} catch (error) {
				console.error("Error in batchEdit:", error);
				return {
					success: false,
					message: `Failed to apply batch edits: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
