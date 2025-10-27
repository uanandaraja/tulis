import { tool } from "ai";
import { z } from "zod";
import {
	getDocument,
	updateDocument,
} from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

function findSectionLine(content: string, sectionTitle: string): number | null {
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		// Match markdown headers (# Title, ## Title, etc.)
		if (
			line.match(/^#{1,6}\s+/) &&
			line.toLowerCase().includes(sectionTitle.toLowerCase())
		) {
			return i;
		}
	}

	return null;
}

function findSectionEnd(content: string, sectionStartLine: number): number {
	const lines = content.split("\n");
	const startLine = lines[sectionStartLine].trim();
	const headerLevel = startLine.match(/^(#{1,6})/)?.[1].length || 1;

	for (let i = sectionStartLine + 1; i < lines.length; i++) {
		const line = lines[i].trim();
		const match = line.match(/^(#{1,6})\s+/);
		if (match && match[1].length <= headerLevel) {
			return i;
		}
	}

	return lines.length;
}

function insertAtLine(
	content: string,
	lineNumber: number,
	newContent: string,
): string {
	const lines = content.split("\n");
	const before = lines.slice(0, lineNumber);
	const after = lines.slice(lineNumber);
	return [...before, newContent, ...after].join("\n");
}

export function createInsertContentTool(context: ToolContext) {
	return tool({
		description:
			"Insert new content at a specific position in the document. Use this to add content before or after sections, or at specific line numbers.",
		inputSchema: z.object({
			position: z
				.enum(["before-section", "after-section", "at-line"])
				.describe("Where to insert the content"),
			sectionTitle: z
				.string()
				.optional()
				.describe(
					"Section heading to insert before/after (required when position='before-section' or 'after-section')",
				),
			lineNumber: z
				.number()
				.optional()
				.describe(
					"Line number to insert at (required when position='at-line')",
				),
			content: z.string().describe("The content to insert (markdown format)"),
		}),
		execute: async ({ position, sectionTitle, lineNumber, content }) => {
			const { userId, documentId } = context;

			try {
				// Validate inputs
				if (
					(position === "before-section" || position === "after-section") &&
					!sectionTitle
				) {
					return {
						success: false,
						message: `sectionTitle is required when position='${position}'`,
					};
				}

				if (position === "at-line" && lineNumber === undefined) {
					return {
						success: false,
						message: "lineNumber is required when position='at-line'",
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
				let insertLine = 0;

				// Determine where to insert based on position
				if (position === "before-section" && sectionTitle) {
					const sectionLine = findSectionLine(updatedContent, sectionTitle);
					if (sectionLine === null) {
						return {
							success: false,
							message: `Section "${sectionTitle}" not found in document`,
						};
					}
					insertLine = sectionLine;
					changeDescription = `Inserted content before section "${sectionTitle}"`;
				} else if (position === "after-section" && sectionTitle) {
					const sectionLine = findSectionLine(updatedContent, sectionTitle);
					if (sectionLine === null) {
						return {
							success: false,
							message: `Section "${sectionTitle}" not found in document`,
						};
					}
					const sectionEnd = findSectionEnd(updatedContent, sectionLine);
					insertLine = sectionEnd;
					changeDescription = `Inserted content after section "${sectionTitle}"`;
				} else if (position === "at-line" && lineNumber !== undefined) {
					insertLine = lineNumber;
					changeDescription = `Inserted content at line ${lineNumber}`;
				}

				// Insert the content
				updatedContent = insertAtLine(updatedContent, insertLine, content);

				// Update document with new content
				const updatedDoc = await updateDocument(
					documentId,
					userId,
					updatedContent,
					"assistant",
					changeDescription,
				);

				return {
					success: true,
					position,
					documentId: updatedDoc.id,
					message: `Successfully inserted content. ${changeDescription}`,
				};
			} catch (error) {
				console.error("Error in insertContent:", error);
				return {
					success: false,
					message: `Failed to insert content: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
