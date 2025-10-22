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
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
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
	NumberedList,
	BulletedList,
];

const marks = [Bold, Italic, Strike, Underline];

export const DocumentEditor = forwardRef<EditorHandle, DocumentEditorProps>(
	(
		{ className, placeholder = "Type '/' for commands...", initialContent },
		ref,
	) => {
		const editor = useMemo(() => createYooptaEditor(), []);
		const selectionRef = useRef(null);
		const isInitialized = useRef(false);

		const parseInlineMarkdown = useCallback((text: string) => {
			const children: Array<{ text: string; marks?: Record<string, boolean> }> =
				[];

			// Simple regex-based parsing for bold, italic, code
			const patterns: Array<{
				regex: RegExp;
				marks: Record<string, boolean>;
			}> = [
				{ regex: /\*\*(.+?)\*\*\*/g, marks: { bold: true, italic: true } },
				{ regex: /\*\*(.+?)\*\*/g, marks: { bold: true } },
				{ regex: /\*(.+?)\*/g, marks: { italic: true } },
				{ regex: /_(.+?)_/g, marks: { italic: true } },
				{ regex: /`(.+?)`/g, marks: { code: true } },
			];

			const matchIndex = 0;
			const matches: Array<{
				start: number;
				end: number;
				text: string;
				marks: Record<string, boolean>;
			}> = [];

			// Find all matches
			for (const pattern of patterns) {
				const regex = new RegExp(pattern.regex.source, "g");
				let match: RegExpExecArray | null;
				while (true) {
					match = regex.exec(text);
					if (match === null) break;
					matches.push({
						start: match.index,
						end: match.index + match[0].length,
						text: match[1],
						marks: pattern.marks,
					});
				}
			}

			// Sort by start position and remove overlaps
			matches.sort((a, b) => a.start - b.start);
			const filtered = matches.filter((match, i) => {
				if (i === 0) return true;
				return match.start >= matches[i - 1].end;
			});

			// Build children array
			let buildIndex = 0;
			for (const match of filtered) {
				if (match.start > buildIndex) {
					children.push({
						text: text.slice(buildIndex, match.start),
					});
				}
				children.push({
					text: match.text,
					marks: match.marks,
				});
				buildIndex = match.end;
			}

			if (buildIndex < text.length) {
				children.push({
					text: text.slice(buildIndex),
				});
			}

			return children.length > 0 ? children : [{ text }];
		}, []);

		const parseMarkdownToYoopta = useCallback(
			(markdown: string): any => {
				const lines = markdown.split("\n");
				const blocks: any = {};
				let order = 0;

				for (const line of lines) {
					if (!line.trim()) continue;

					const blockId = crypto.randomUUID();
					let blockType = "Paragraph";
					let elementType = "paragraph";
					let text = line;

					// Parse markdown syntax
					if (line.startsWith("### ")) {
						blockType = "HeadingThree";
						elementType = "heading-three";
						text = line.replace(/^### /, "");
					} else if (line.startsWith("## ")) {
						blockType = "HeadingTwo";
						elementType = "heading-two";
						text = line.replace(/^## /, "");
					} else if (line.startsWith("# ")) {
						blockType = "HeadingOne";
						elementType = "heading-one";
						text = line.replace(/^# /, "");
					} else if (line.startsWith("> ")) {
						blockType = "Blockquote";
						elementType = "blockquote";
						text = line.replace(/^> /, "");
					} else if (line.match(/^\d+\. /)) {
						blockType = "NumberedList";
						elementType = "numbered-list";
						text = line.replace(/^\d+\. /, "");
					} else if (line.startsWith("- ") || line.startsWith("* ")) {
						blockType = "BulletedList";
						elementType = "bulleted-list";
						text = line.replace(/^[-*] /, "");
					}

					// Parse inline markdown
					const children = parseInlineMarkdown(text);

					blocks[blockId] = {
						id: blockId,
						type: blockType,
						value: [
							{
								id: crypto.randomUUID(),
								type: elementType,
								children,
							},
						],
						meta: { order: order++, depth: 0 },
					};
				}

				return blocks;
			},
			[parseInlineMarkdown],
		);

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

		useEffect(() => {
			if (initialContent && !isInitialized.current) {
				const value = parseMarkdownToYoopta(initialContent);
				editor.setEditorValue(value);
				isInitialized.current = true;
			}
		}, [initialContent, editor, parseMarkdownToYoopta]);

		return (
			<div
				className={cn(
					"flex flex-col h-full w-full overflow-hidden bg-background",
					className,
				)}
				ref={selectionRef}
			>
				<div className="flex-1 w-full overflow-y-auto px-16 py-12">
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
		);
	},
);

DocumentEditor.displayName = "DocumentEditor";
