"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { htmlToMarkdown } from "@/lib/editor/markdown-serializer";
import { markdownToHtml } from "@/lib/editor/markdown-to-html";
import { cn } from "@/lib/utils";

export interface EditorHandle {
	setContent: (content: string) => void;
	appendContent: (content: string) => void;
	prependContent: (content: string) => void;
	getContent: () => string;
	clear: () => void;
}

export interface DocumentEditorProps {
	className?: string;
	placeholder?: string;
	initialContent?: string;
}

export const DocumentEditor = forwardRef<EditorHandle, DocumentEditorProps>(
	(
		{ className, placeholder = "Start writing...", initialContent },
		ref,
	) => {
		const [wordCount, setWordCount] = useState(0);
		const isInitialized = useRef(false);

		const editor = useEditor({
			immediatelyRender: false,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3],
					},
				}),
				Placeholder.configure({
					placeholder,
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: "text-primary underline",
					},
				}),
				Table.configure({
					resizable: true,
					HTMLAttributes: {
						class: "border-collapse table-auto w-full my-4",
					},
				}),
				TableRow.configure({
					HTMLAttributes: {
						class: "border-b border-border",
					},
				}),
				TableCell.configure({
					HTMLAttributes: {
						class: "px-4 py-2",
					},
				}),
				TableHeader.configure({
					HTMLAttributes: {
						class: "px-4 py-2 font-semibold",
					},
				}),
			],
			content: initialContent ? markdownToHtml(initialContent) : "",
			onUpdate: ({ editor }) => {
				const text = editor.getText();
				const words = text.trim().split(/\s+/).filter(Boolean);
				setWordCount(words.length);
			},
			editorProps: {
				attributes: {
					class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
				},
			},
		});

		// Initialize content
		useEffect(() => {
			if (editor && initialContent && !isInitialized.current) {
				editor.commands.setContent(markdownToHtml(initialContent));
				isInitialized.current = true;
				// Calculate initial word count
				const text = editor.getText();
				const words = text.trim().split(/\s+/).filter(Boolean);
				setWordCount(words.length);
			}
		}, [editor, initialContent]);

		// Update content when it changes externally
		useEffect(() => {
			if (editor && initialContent && isInitialized.current) {
				// Only update if content actually changed to avoid infinite loops
				const currentMarkdown = htmlToMarkdown(editor.getHTML());
				if (currentMarkdown.trim() !== initialContent.trim()) {
					editor.commands.setContent(markdownToHtml(initialContent));
					const text = editor.getText();
					const words = text.trim().split(/\s+/).filter(Boolean);
					setWordCount(words.length);
				}
			} else if (editor && !initialContent && isInitialized.current) {
				editor.commands.clearContent();
				setWordCount(0);
			}
		}, [editor, initialContent]);

		useImperativeHandle(ref, () => ({
			setContent: (content: string) => {
				if (editor) {
					// Content is expected to be markdown
					editor.commands.setContent(markdownToHtml(content));
					const text = editor.getText();
					const words = text.trim().split(/\s+/).filter(Boolean);
					setWordCount(words.length);
				}
			},
			appendContent: (content: string) => {
				if (editor) {
					// Content is expected to be markdown
					editor.commands.insertContent(markdownToHtml(content));
					const text = editor.getText();
					const words = text.trim().split(/\s+/).filter(Boolean);
					setWordCount(words.length);
				}
			},
			prependContent: (content: string) => {
				if (editor) {
					// Content is expected to be markdown
					editor.commands.insertContentAt(0, markdownToHtml(content));
					const text = editor.getText();
					const words = text.trim().split(/\s+/).filter(Boolean);
					setWordCount(words.length);
				}
			},
			getContent: () => {
				if (!editor) return "";
				// Return markdown format
				return htmlToMarkdown(editor.getHTML());
			},
			clear: () => {
				if (editor) {
					editor.commands.clearContent();
					setWordCount(0);
				}
			},
		}));

		if (!editor) {
			return null;
		}

		return (
			<div
				className={cn(
					"flex flex-col h-full w-full overflow-hidden bg-background relative",
					className,
				)}
			>
				<div className="flex-1 w-full overflow-y-auto px-16 py-12">
					<div className="max-w-3xl mx-auto px-8">
						<EditorContent editor={editor} />
					</div>
				</div>
				<div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground z-10">
					{wordCount} {wordCount === 1 ? "word" : "words"}
				</div>
			</div>
		);
	},
);

DocumentEditor.displayName = "DocumentEditor";
