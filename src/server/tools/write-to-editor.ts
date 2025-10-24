import { tool } from "ai";
import { z } from "zod";

export const writeToEditorTool = tool({
	description:
		"Write content directly to the document editor panel. Use for long-form content like articles, essays, blog posts, or reports. Content appears in editor, not chat.",
	inputSchema: z.object({
		action: z
			.enum(["set", "append", "prepend"])
			.describe(
				"How to add content: 'set' replaces all, 'append' adds to end, 'prepend' adds to beginning",
			)
			.default("set"),
		content: z
			.string()
			.describe(
				"Full markdown body content. Start with paragraphs/sections (## for headings). Do NOT include title (separate field). If using citations [1] [2], add '## References' section at end",
			),
		title: z.string().describe("Document title (required)"),
	}),
	execute: async ({ action, content, title }) => {
		return {
			success: true,
			action,
			content,
			title,
			message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor. You MUST now: (1) Call Plan Steps to mark all steps completed, (2) Respond with ONLY "Done."`,
		};
	},
});
