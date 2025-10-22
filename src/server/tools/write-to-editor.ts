import { tool } from "ai";
import { z } from "zod";

export const writeToEditorTool = tool({
	description:
		"Write content DIRECTLY to the document editor. Use this when the user asks you to write, draft, or create long-form content like articles, essays, documents, reports, or any substantial written content. IMPORTANT: Do NOT write the content in your response - ONLY use this tool. After calling this tool, say something brief like 'Done' or 'Written to editor'.",
	inputSchema: z.object({
		action: z
			.enum(["set", "append", "prepend"])
			.describe(
				"How to add content: 'set' replaces all content, 'append' adds to end, 'prepend' adds to beginning",
			)
			.default("set"),
		content: z
			.string()
			.describe(
				"The body content ONLY. DO NOT include the title here - it goes in the 'title' field.",
			),
		title: z
			.string()
			.describe(
				"The title for the document. REQUIRED. This will be displayed as the heading.",
			),
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
