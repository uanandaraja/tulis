import { isToolUIPart, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";
import type { WriteToEditorToolOutput } from "@/lib/types/ai";

export function useEditorState(messages: UIMessage[]) {
	const editorContent = useMemo(() => {
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
					let fullContent = output.content;
					if (output.title) {
						fullContent = `# ${output.title}\n\n${output.content}`;
					}
					return fullContent;
				}
			}
		}
		return null;
	}, [messages]);

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setIsOpen(editorContent !== null);
	}, [editorContent]);

	return {
		editorContent,
		hasContent: editorContent !== null,
		isOpen,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
	};
}
