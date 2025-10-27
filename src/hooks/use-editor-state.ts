import { isToolUIPart, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { WriteToEditorToolOutput } from "@/lib/types/ai";

export function useEditorState(
	messages: UIMessage[],
	documentId?: string | null,
) {
	// Fetch current document content when documentId is available
	const { data: currentDocument } = trpc.document.get.useQuery(
		{ documentId: documentId! },
		{
			enabled: !!documentId,
			staleTime: 0, // Always fetch fresh data
		},
	);

	const editorContent = useMemo(() => {
		// If we have a current document from the database, use its content
		if (currentDocument?.content) {
			return currentDocument.content;
		}

		// Otherwise, fall back to the last writeToEditor tool result
		for (const message of [...messages].reverse()) {
			if (message.role !== "assistant") continue;

			const writeToEditorParts = message.parts.filter(
				(part) =>
					isToolUIPart(part) &&
					part.type === "tool-writeToEditor" &&
					part.state === "output-available",
			);

			for (const part of writeToEditorParts) {
				if (!isToolUIPart(part)) continue;
				const output = part.output as WriteToEditorToolOutput;

				if (output.success) {
					return output.content;
				}
			}
		}
		return null;
	}, [messages, currentDocument]);

	const hasContent = editorContent !== null;
	const [isOpen, setIsOpen] = useState(hasContent);

	// Only auto-open when new content appears (not when closing)
	useEffect(() => {
		if (hasContent && !isOpen) {
			setIsOpen(true);
		}
	}, [hasContent]);

	return {
		editorContent,
		hasContent,
		isOpen,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
	};
}
