import { tool } from "ai";
import { z } from "zod";

export const writeToEditorTool = tool({
	description:
		"Write content DIRECTLY to the document editor panel (separate from chat). Use this when the user asks you to write, draft, or create long-form content like articles, essays, blog posts, documents, reports, or any substantial written content. CRITICAL: Do NOT write the content in your chat response - this wastes tokens by duplicating output. Put content ONLY in this tool call. After calling this tool, respond in chat with ONLY 'Done.' - the user will see your writing in the editor panel, not in chat. IMPORTANT: If you use inline citations like [1] [2] [3] in the content, you MUST include a '## References' section at the END of the content with full source details (title and URL) for each cited number.",
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
				"The full body content in markdown format. DO NOT include the title here (it goes in 'title' field). DO NOT start with # Title. Start directly with your content paragraphs and sections. Use markdown: ## for sections, **bold**, - lists, etc. CRITICAL: If you use inline citations [1] [2], you MUST end the content with a '## References' section listing all sources with format: [1] \"Title\" - URL",
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
