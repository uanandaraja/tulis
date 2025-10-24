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
				"Full markdown body content. START IMMEDIATELY with first paragraph - NO title, NO heading that repeats title, NO introduction that mentions title. First sentence should be compelling hook, not title repetition. If using citations [1] [2], add '## References' section at end",
			)
			.refine(
				(content) => {
					// Check if content starts with title-like patterns
					const titleLikePatterns = [
						/^#\s+/, // Starts with # heading
						/^##\s+/, // Starts with ## heading
						/^The\s+\w+.*?:/, // Starts with "The [Word]:"
						/^[A-Z][^.]{10,}:/, // Starts with long capitalized phrase ending in colon
					];
					return !titleLikePatterns.some((pattern) =>
						pattern.test(content.trim()),
					);
				},
				{
					message:
						"Content must NOT start with title, headings, or title-like phrases. Start directly with first paragraph.",
				},
			),
		title: z
			.string()
			.describe(
				"Document title (required) - this will be displayed separately, do NOT include in content",
			),
	}),
	execute: async ({ action, content, title }) => {
		return {
			success: true,
			action,
			content,
			title,
			message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor. You MUST now: (1) Call Plan Steps to mark all steps completed, (2) Respond with ONLY "Done.",`,
		};
	},
});
