"use client";

import ActionMenuList, {
	DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Code from "@yoopta/code";
import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import { BulletedList, NumberedList } from "@yoopta/lists";
import { Bold, Italic, Strike, Underline } from "@yoopta/marks";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { parseMarkdownToYoopta } from "@/lib/editor/markdown-parser";
import { calculateWordCount } from "@/lib/editor/word-count";
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

const plugins = [
	Paragraph,
	HeadingOne,
	HeadingTwo,
	HeadingThree,
	Blockquote,
	Code,
	Table,
	NumberedList,
	BulletedList,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

const marks = [Bold, Italic, Strike, Underline];

export const DocumentEditor = forwardRef<EditorHandle, DocumentEditorProps>(
	(
		{ className, placeholder = "Type '/' for commands...", initialContent },
		ref,
	) => {
		const editor = useMemo(() => createYooptaEditor(), []);
		const selectionRef = useRef(null);
		const isInitialized = useRef(false);
		const [wordCount, setWordCount] = useState(0);
		const [isMounted, setIsMounted] = useState(false);

		useImperativeHandle(ref, () => ({
			setContent: (_content: string) => {
				const value = parseMarkdownToYoopta(_content);
				editor.setEditorValue(value);
			},
			appendContent: (_content: string) => {
				console.log("Append not yet implemented for Yoopta");
			},
			prependContent: (_content: string) => {
				console.log("Prepend not yet implemented for Yoopta");
			},
			getContent: () => {
				return JSON.stringify(editor.getEditorValue());
			},
			clear: () => {
				editor.setEditorValue({});
			},
		}));

		const updateWordCount = useCallback(() => {
			const value = editor.getEditorValue();
			const count = calculateWordCount(value);
			setWordCount(count);
		}, [editor]);

		useEffect(() => {
			setIsMounted(true);
		}, []);

		useEffect(() => {
			if (initialContent && !isInitialized.current && isMounted) {
				setTimeout(() => {
					try {
						const value = parseMarkdownToYoopta(initialContent);
						if (value && Object.keys(value).length > 0) {
							editor.setEditorValue(value);
							isInitialized.current = true;
							updateWordCount();
						}
					} catch (error) {
						console.error("Error parsing markdown:", error);
					}
				}, 100);
			}
		}, [initialContent, editor, updateWordCount, isMounted]);

		useEffect(() => {
			const handleChange = () => {
				updateWordCount();
			};

			editor.on("change", handleChange);

			return () => {
				editor.off("change", handleChange);
			};
		}, [editor, updateWordCount]);

		if (!isMounted) {
			return null;
		}

		return (
			<div
				className={cn(
					"flex flex-col h-full w-full overflow-hidden bg-background relative",
					className,
				)}
				ref={selectionRef}
			>
				<div className="flex-1 w-full overflow-y-auto px-16 py-12">
					<div className="max-w-3xl mx-auto px-8">
						<YooptaEditor
							editor={editor}
							className="w-full max-w-none"
							style={{ width: "100%" }}
							plugins={plugins}
							marks={marks}
							tools={{
								ActionMenu: {
									render: DefaultActionMenuRender,
									tool: ActionMenuList,
								},
								Toolbar: {
									render: DefaultToolbarRender,
									tool: Toolbar,
								},
								LinkTool: {
									render: DefaultLinkToolRender,
									tool: LinkTool,
								},
							}}
							placeholder={placeholder}
							selectionBoxRoot={selectionRef}
						/>
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
