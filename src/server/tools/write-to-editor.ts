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
				"Full markdown content including title and body. Include title as h1 heading (# Title) at the top, followed by body content. If using citations [1] [2], add '## References' section at end",
			),
	}),
	execute: async ({ action, content }) => {
		// For now, just return the content. The frontend will handle document persistence
		// via the chat save mechanism, which we'll enhance later
		return {
			success: true,
			action,
			content,
			message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor. You MUST now: (1) Call Plan Steps to mark all steps completed, (2) Respond with ONLY "Done.",`,
		};
	},
});
