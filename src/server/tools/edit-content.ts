import { tool } from "ai";
import { z } from "zod";

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
	newContent: string,
): string {
	const lines = content.split("\n");
	const before = lines.slice(0, startLine);
	const after = lines.slice(endLine);

	return [...before, newContent, ...after].join("\n");
}

export const editContentTool = tool({
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
		try {
			// Note: In real implementation, we'd need to get the current document content
			// For now, this returns metadata about what would be changed
			// The frontend will apply these changes

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

			return {
				success: true,
				selectionMode,
				operation,
				searchText,
				sectionTitle,
				startLine,
				endLine,
				newContent,
				message: `Will ${operation} content selected by ${selectionMode}`,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to edit content: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	},
});
