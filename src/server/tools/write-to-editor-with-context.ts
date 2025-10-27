import { tool } from "ai";
import { z } from "zod";
import type { DocumentWithContent } from "@/lib/types/document";
import {
	createDocument,
	getDocument,
	updateDocument,
} from "@/server/services/document.service";
import type { ToolContext } from "./create-tools";

export function createWriteToEditorTool(context: ToolContext) {
	return tool({
		description:
			"Write content directly to the document editor panel. Use for long-form content like articles, essays, blog posts, or reports. Content appears in editor, not chat. This creates or updates a persistent document with version history.",
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
			title: z
				.string()
				.describe(
					"Document title (required) - this will be displayed separately from the content",
				),
		}),
		execute: async ({ action, content }) => {
			const { userId, chatId, documentId } = context;

			try {
				// Extract title from first h1 heading in content
				let title = "Untitled Document";
				let finalContent = content;

				const titleMatch = content.match(/^#\s+(.+)$/m);
				if (titleMatch) {
					title = titleMatch[1].trim();
				}

				let document: DocumentWithContent;
				let changeDescription = `${action === "set" ? "Created" : action === "append" ? "Appended to" : "Prepended to"} document`;

				// If documentId exists, we're updating an existing document
				if (documentId) {
					const existingDoc = await getDocument(documentId, userId);

					if (existingDoc) {
						// Handle append/prepend
						if (action === "append") {
							finalContent = `${existingDoc.content}\n\n${content}`;
							changeDescription = "Appended content";
						} else if (action === "prepend") {
							finalContent = `${content}\n\n${existingDoc.content}`;
							changeDescription = "Prepended content";
						} else {
							changeDescription = "Replaced content";
						}

						document = await updateDocument(
							documentId,
							userId,
							finalContent,
							"assistant",
							changeDescription,
						);
					} else {
						// Document not found, create new one
						document = await createDocument(
							userId,
							title,
							finalContent,
							chatId || undefined,
							"assistant",
							changeDescription,
						);
					}
				} else {
					// Create new document
					document = await createDocument(
						userId,
						title,
						finalContent,
						chatId || undefined,
						"assistant",
						changeDescription,
					);
				}

				return {
					success: true,
					action,
					content: finalContent,
					documentId: document.id,
					message: `Content ${action === "set" ? "written" : action === "append" ? "appended" : "prepended"} to editor. Document saved with version history. You MUST now: (1) Call Plan Steps to mark all steps completed, (2) Respond with ONLY "Done.",`,
				};
			} catch (error) {
				console.error("Error in writeToEditor:", error);
				return {
					success: false,
					action,
					content,
					message: `Failed to save document: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
