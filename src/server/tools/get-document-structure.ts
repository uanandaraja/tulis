import { tool } from "ai";
import { z } from "zod";

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

export const getDocumentStructureTool = tool({
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
		try {
			// Note: In real implementation, we'd get the actual document content
			// For now, return a placeholder structure
			// The frontend will provide the actual document content

			return {
				success: true,
				message:
					"Document structure request received. Frontend will provide actual structure.",
				includeContent,
				// Placeholder data
				sections: [],
				wordCount: 0,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to get document structure: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	},
});
