import { isToolUIPart, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
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
	const prevDocumentIdRef = useRef(documentId);

	// Get the latest content from messages first
	const messageBasedContent = useMemo(() => {
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
	}, [messages]);

	// Fetch current document content when documentId is available and no specific version is selected
	const { data: currentDocument, isLoading: isLoadingCurrentDocument } =
		trpc.document.get.useQuery(
			{ documentId: documentId! },
			{
				enabled: !!documentId && !selectedVersionId, // Always fetch latest version when not viewing specific version
				staleTime: 0, // Always fetch fresh data
			},
		);

	// Fetch specific version when selected
	const { data: selectedVersion, isLoading: isLoadingSelectedVersion } =
		trpc.document.getVersion.useQuery(
			{ versionId: selectedVersionId! },
			{
				enabled: !!selectedVersionId,
				staleTime: 0,
			},
		);

	// Fetch latest version for comparison when viewing an older version
	const { data: latestVersion, isLoading: isLoadingLatestVersion } =
		trpc.document.get.useQuery(
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

		// When loading latest version from database, wait for it instead of showing stale message content
		if (!selectedVersionId && documentId && isLoadingCurrentDocument) {
			return null; // Show loading state instead of stale content
		}

		// Prioritize current document from database (latest saved version)
		if (currentDocument?.content) {
			return currentDocument.content;
		}

		// Use message-based content as fallback (only when no documentId or not loading)
		if (messageBasedContent) {
			return messageBasedContent;
		}

		return null;
	}, [
		messageBasedContent,
		currentDocument,
		selectedVersion,
		selectedVersionId,
		documentId,
		isLoadingCurrentDocument,
	]);

	const hasContent = editorContent !== null;

	// Determine if we're still loading content
	const isLoading = selectedVersionId
		? isLoadingSelectedVersion || isLoadingLatestVersion
		: messageBasedContent
			? false
			: isLoadingCurrentDocument;

	// Only auto-open when new content appears (not when closing)
	useEffect(() => {
		if (hasContent && !isOpen) {
			setIsOpen(true);
		}
	}, [hasContent, isOpen]);

	// Reset selected version when documentId changes
	useEffect(() => {
		if (prevDocumentIdRef.current !== documentId) {
			setSelectedVersionId(null);
			prevDocumentIdRef.current = documentId;
		}
	});

	return {
		editorContent,
		hasContent,
		isOpen,
		isLoading,
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
