import { tool } from "ai";
import { z } from "zod";
import { getDocument } from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

interface Section {
	level: number;
	title: string;
	lineStart: number;
	lineEnd: number;
	content?: string;
}

function parseDocumentStructure(
	content: string,
	includeContent: boolean,
): {
	sections: Section[];
	wordCount: number;
	title?: string;
} {
	const lines = content.split("\n");
	const sections: Section[] = [];
	let title: string | undefined;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		const match = line.match(/^(#{1,6})\s+(.+)$/);

		if (match) {
			const level = match[1].length;
			const sectionTitle = match[2];

			// First level-1 heading is the document title
			if (level === 1 && !title) {
				title = sectionTitle;
			}

			// Find where this section ends
			let lineEnd = lines.length;
			for (let j = i + 1; j < lines.length; j++) {
				const nextLine = lines[j].trim();
				const nextMatch = nextLine.match(/^(#{1,6})\s+/);
				if (nextMatch && nextMatch[1].length <= level) {
					lineEnd = j;
					break;
				}
			}

			const section: Section = {
				level,
				title: sectionTitle,
				lineStart: i,
				lineEnd,
			};

			if (includeContent) {
				section.content = lines.slice(i, lineEnd).join("\n");
			}

			sections.push(section);
		}
	}

	const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

	return { sections, wordCount, title };
}

export function createGetDocumentStructureTool(context: ToolContext) {
	return tool({
		description:
			"Get the structure of the current document including sections, headings, and word count. Useful for understanding document layout before making edits.",
		inputSchema: z.object({
			includeContent: z
				.boolean()
				.optional()
				.default(false)
				.describe(
					"Whether to include the full content of each section in the response",
				),
		}),
		execute: async ({ includeContent }) => {
			const { userId, documentId } = context;

			try {
				// Need document to analyze
				if (!documentId) {
					return {
						success: false,
						message:
							"No document found in current chat. Please create a document first using writeToEditor.",
						sections: [],
						wordCount: 0,
					};
				}

				// Get current document
				const currentDoc = await getDocument(documentId, userId);
				if (!currentDoc) {
					return {
						success: false,
						message: "Document not found",
						sections: [],
						wordCount: 0,
					};
				}

				// Parse the document structure
				const structure = parseDocumentStructure(
					currentDoc.content,
					includeContent || false,
				);

				return {
					success: true,
					title: structure.title,
					sections: structure.sections,
					wordCount: structure.wordCount,
					message: `Document has ${structure.sections.length} sections and ${structure.wordCount} words`,
				};
			} catch (error) {
				console.error("Error in getDocumentStructure:", error);
				return {
					success: false,
					message: `Failed to get document structure: ${error instanceof Error ? error.message : "Unknown error"}`,
					sections: [],
					wordCount: 0,
				};
			}
		},
	});
}
