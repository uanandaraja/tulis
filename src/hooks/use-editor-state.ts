import { isToolUIPart, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { WriteToEditorToolOutput } from "@/lib/types/ai";

export function useEditorState(
	messages: UIMessage[],
	documentId?: string | null,
) {
	const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
		null,
	);
	const [isOpen, setIsOpen] = useState(false);

	// Fetch current document content when documentId is available
	const { data: currentDocument } = trpc.document.get.useQuery(
		{ documentId: documentId! },
		{
			enabled: !!documentId && !selectedVersionId, // Only fetch if not viewing a specific version
			staleTime: 0, // Always fetch fresh data
		},
	);

	// Fetch specific version when selected
	const { data: selectedVersion } = trpc.document.getVersion.useQuery(
		{ versionId: selectedVersionId! },
		{
			enabled: !!selectedVersionId,
			staleTime: 0,
		},
	);

	// Fetch latest version for comparison when viewing an older version
	const { data: latestVersion } = trpc.document.get.useQuery(
		{ documentId: documentId! },
		{
			enabled: !!documentId && !!selectedVersionId, // Only fetch when viewing a specific version
			staleTime: 0,
		},
	);

	const editorContent = useMemo(() => {
		// If viewing a specific version, use that
		if (selectedVersion?.content) {
			return selectedVersion.content;
		}

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
	}, [messages, currentDocument, selectedVersion]);

	const hasContent = editorContent !== null;

	// Only auto-open when new content appears (not when closing)
	useEffect(() => {
		if (hasContent && !isOpen) {
			setIsOpen(true);
		}
	}, [hasContent]);

	// Reset selected version when documentId changes
	useEffect(() => {
		setSelectedVersionId(null);
	}, [documentId]);

	return {
		editorContent,
		hasContent,
		isOpen,
		selectedVersionId,
		currentVersionNumber: selectedVersion?.versionNumber,
		latestVersionContent: latestVersion?.content,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
		showVersion: (versionId: string) => {
			setSelectedVersionId(versionId);
			setIsOpen(true);
		},
		showLatest: () => {
			setSelectedVersionId(null);
			setIsOpen(true);
		},
	};
}
