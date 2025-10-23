import { tool } from "ai";
import { z } from "zod";

export const writeToEditorTool = tool({
	description:
		"Write content DIRECTLY to the document editor panel (separate from chat). Use this when the user asks you to write, draft, or create long-form content like articles, essays, blog posts, documents, reports, or any substantial written content. CRITICAL: Do NOT write the content in your chat response - this wastes tokens by duplicating output. Put content ONLY in this tool call. After calling this tool, respond in chat with ONLY 'Done.' - the user will see your writing in the editor panel, not in chat.",
	inputSchema: z.object({
		action: z
			.enum(["set", "append", "prepend"])
			.describe(
				"How to add content: 'set' replaces all editor content, 'append' adds to end of existing content, 'prepend' adds to beginning of existing content. Default: 'set'",
			)
			.default("set"),
		content: z
			.string()
			.describe(
				"The full body content in markdown format. DO NOT include the title here (it goes in 'title' field). DO NOT start with # Title. Start directly with your content paragraphs and sections. Use markdown: ## for sections, **bold**, - lists, etc.",
			),
		title: z
			.string()
			.describe(
				"The document title. REQUIRED. This will be displayed as the main heading in the editor.",
			),
	}),
	execute: async ({ action, content, title }) => {
		return {
			success: true,
			action,
			content,
			title,
			message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor. Respond with 'Done.' in chat.`,
		};
	},
});
