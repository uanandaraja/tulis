import { tool } from "ai";
import { z } from "zod";

export const insertContentTool = tool({
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
			.describe("Line number to insert at (required when position='at-line')"),
		content: z.string().describe("The content to insert (markdown format)"),
	}),
	execute: async ({ position, sectionTitle, lineNumber, content }) => {
		try {
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

			// Return metadata about the insertion
			// Frontend will handle the actual insertion
			return {
				success: true,
				position,
				sectionTitle,
				lineNumber,
				content,
				message: `Will insert content ${position}${sectionTitle ? ` "${sectionTitle}"` : ""}${lineNumber !== undefined ? ` line ${lineNumber}` : ""}`,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to insert content: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	},
});
