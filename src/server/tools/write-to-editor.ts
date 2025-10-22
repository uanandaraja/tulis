import { tool } from "ai";
import { z } from "zod";

export const writeToEditorTool = tool({
	description:
		"Write content DIRECTLY to the document editor. Use this when the user asks you to write, draft, or create long-form content like articles, essays, documents, reports, or any substantial written content. IMPORTANT: Do NOT write the content in your response - ONLY use this tool. The content will appear in a rich-text editor. After calling this tool, simply acknowledge that you've written to the editor.",
	inputSchema: z.object({
		action: z
			.enum(["set", "append", "prepend"])
			.describe(
				"How to add content: 'set' replaces all content, 'append' adds to end, 'prepend' adds to beginning",
			)
			.default("set"),
		content: z.string().describe("The content to write (use markdown format)"),
		title: z
			.string()
			.optional()
			.describe("Optional title or heading for the content"),
	}),
	execute: async ({ action, content, title }) => {
		return {
			success: true,
			action,
			content,
			title,
			message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor`,
		};
	},
});
