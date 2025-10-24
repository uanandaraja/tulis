"use client";

import ActionMenuList, {
	DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Code from "@yoopta/code";
import YooptaEditor, {
	createYooptaEditor,
	type YooptaContentValue,
} from "@yoopta/editor";
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
	// @ts-expect-error - Table plugin has type incompatibility with other plugins
	Table,
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
		const [wordCount, setWordCount] = useState(0);
		const [isMounted, setIsMounted] = useState(false);

		const parseInlineMarkdown = useCallback((text: string) => {
			if (!text || typeof text !== "string") {
				return [{ text: "" }];
			}

			let processedText = text;
			let headingBold = false;

			if (processedText.startsWith("### ")) {
				processedText = processedText.replace(/^### /, "");
				headingBold = true;
			} else if (processedText.startsWith("## ")) {
				processedText = processedText.replace(/^## /, "");
				headingBold = true;
			} else if (processedText.startsWith("# ")) {
				processedText = processedText.replace(/^# /, "");
				headingBold = true;
			}

			const children: Array<{
				text: string;
				bold?: boolean;
				italic?: boolean;
				code?: boolean;
				underline?: boolean;
				strike?: boolean;
			}> = [];

			const patterns: Array<{
				regex: RegExp;
				marks: Record<string, boolean>;
				captureGroup: number;
			}> = [
				{
					regex: /\*\*\*(.+?)\*\*\*/g,
					marks: { bold: true, italic: true },
					captureGroup: 1,
				},
				{ regex: /\*\*(.+?)\*\*/g, marks: { bold: true }, captureGroup: 1 },
				{ regex: /\*(.+?)\*/g, marks: { italic: true }, captureGroup: 1 },
				{ regex: /_(.+?)_/g, marks: { italic: true }, captureGroup: 1 },
				{ regex: /`(.+?)`/g, marks: { code: true }, captureGroup: 1 },
			];

			const matches: Array<{
				start: number;
				end: number;
				text: string;
				marks: Record<string, boolean>;
			}> = [];

			for (const pattern of patterns) {
				const regex = new RegExp(pattern.regex.source, "g");
				let match: RegExpExecArray | null;
				while (true) {
					match = regex.exec(processedText);
					if (match === null) break;
					matches.push({
						start: match.index,
						end: match.index + match[0].length,
						text: match[pattern.captureGroup],
						marks: pattern.marks,
					});
				}
			}

			matches.sort((a, b) => {
				if (a.start !== b.start) return a.start - b.start;
				return b.end - b.start - (a.end - a.start);
			});

			const filtered: typeof matches = [];
			for (const match of matches) {
				let overlaps = false;
				for (const kept of filtered) {
					if (match.start < kept.end && match.end > kept.start) {
						overlaps = true;
						break;
					}
				}
				if (!overlaps) {
					filtered.push(match);
				}
			}

			let buildIndex = 0;
			for (const match of filtered) {
				if (match.start > buildIndex) {
					const textSegment = processedText.slice(buildIndex, match.start);
					children.push({
						text: textSegment,
						...(headingBold ? { bold: true } : {}),
					});
				}
				children.push({
					text: match.text,
					...match.marks,
				});
				buildIndex = match.end;
			}

			if (buildIndex < processedText.length) {
				const textSegment = processedText.slice(buildIndex);
				children.push({
					text: textSegment,
					...(headingBold ? { bold: true } : {}),
				});
			}

			if (children.length === 0 && headingBold) {
				children.push({ text: processedText, bold: true });
			}

			return children.length > 0 ? children : [{ text: "" }];
		}, []);

		const parseMarkdownToYoopta = useCallback(
			(markdown: string): YooptaContentValue => {
				const lines = markdown.split("\n");
				const blocks: YooptaContentValue = {};
				let order = 0;
				let i = 0;

				while (i < lines.length) {
					const line = lines[i];

					if (!line.trim()) {
						i++;
						continue;
					}

					if (line.includes("|")) {
						const tableLines: string[] = [];
						let j = i;

						while (j < lines.length && lines[j].includes("|")) {
							tableLines.push(lines[j]);
							j++;
						}

						if (tableLines.length >= 2) {
							const blockId = crypto.randomUUID();
							const rows: Array<{
								id: string;
								type: string;
								children: Array<{
									id: string;
									type: string;
									children: Array<{
										id: string;
										type: string;
										children: Array<{
											text: string;
											bold?: boolean;
											italic?: boolean;
											code?: boolean;
											underline?: boolean;
											strike?: boolean;
										}>;
									}>;
								}>;
							}> = [];

							for (let k = 0; k < tableLines.length; k++) {
								const tableLine = tableLines[k];

								if (k === 1 && /^\|[\s\-:|]+\|$/.test(tableLine.trim())) {
									continue;
								}

								const cells = tableLine
									.split("|")
									.slice(1, -1)
									.map((cell) => cell.trim());

								if (cells.length === 0) {
									continue;
								}

								const rowId = crypto.randomUUID();
								const dataCells: (typeof rows)[0]["children"] = [];

								for (const cellText of cells) {
									const cellId = crypto.randomUUID();
									const children = parseInlineMarkdown(cellText || "");

									dataCells.push({
										id: cellId,
										type: "table-data-cell",
										children: [
											{
												id: crypto.randomUUID(),
												type: "paragraph",
												children,
											},
										],
									});
								}

								if (dataCells.length > 0) {
									rows.push({
										id: rowId,
										type: "table-row",
										children: dataCells,
									});
								}
							}

							if (rows.length > 0) {
								blocks[blockId] = {
									id: blockId,
									type: "Table",
									value: [
										{
											id: crypto.randomUUID(),
											type: "table",
											children: rows,
										},
									],
									meta: {
										order: order++,
										depth: 0,
									},
								};
							}

							i = j;
							continue;
						}
					}

					const blockId = crypto.randomUUID();
					let blockType = "Paragraph";
					let elementType = "paragraph";
					let text = line;
					let depth = 0;

					const indentMatch = line.match(/^(\s+)/);
					if (indentMatch) {
						const spaces = indentMatch[1].length;
						depth = Math.floor(spaces / 4);
					}

					if (line.trim().startsWith("### ")) {
						blockType = "HeadingThree";
						elementType = "heading-three";
						text = line.trim().replace(/^### /, "");
						depth = 0;
					} else if (line.trim().startsWith("## ")) {
						blockType = "HeadingTwo";
						elementType = "heading-two";
						text = line.trim().replace(/^## /, "");
						depth = 0;
					} else if (line.trim().startsWith("# ")) {
						blockType = "HeadingOne";
						elementType = "heading-one";
						text = line.trim().replace(/^# /, "");
						depth = 0;
					} else if (line.trim().startsWith("> ")) {
						blockType = "Blockquote";
						elementType = "blockquote";
						text = line.trim().replace(/^> /, "");
						depth = 0;
					} else if (line.trim().match(/^\d+\.\s+/)) {
						blockType = "NumberedList";
						elementType = "numbered-list";
						text = line.trim().replace(/^\d+\.\s+/, "");
					} else if (
						line.trim().startsWith("- ") ||
						line.trim().startsWith("* ")
					) {
						blockType = "BulletedList";
						elementType = "bulleted-list";
						text = line.trim().replace(/^[-*]\s+/, "");
					} else {
						depth = 0;
					}

					const children = parseInlineMarkdown(text || "");

					if (
						children &&
						children.length > 0 &&
						children.some((child) => child.text !== "")
					) {
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
							meta: { order: order++, depth },
						};
					}

					i++;
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

		const calculateWordCount = useCallback(() => {
			const value = editor.getEditorValue();
			let totalWords = 0;

			for (const blockId in value) {
				const block = value[blockId];
				if (block.value && Array.isArray(block.value)) {
					for (const element of block.value) {
						if ("children" in element && Array.isArray(element.children)) {
							for (const child of element.children) {
								if ("text" in child && typeof child.text === "string") {
									const words = child.text.trim().split(/\s+/).filter(Boolean);
									totalWords += words.length;
								}
							}
						}
					}
				}
			}

			setWordCount(totalWords);
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
							calculateWordCount();
						}
					} catch (error) {
						console.error("Error parsing markdown:", error);
					}
				}, 100);
			}
		}, [
			initialContent,
			editor,
			parseMarkdownToYoopta,
			calculateWordCount,
			isMounted,
		]);

		useEffect(() => {
			const handleChange = () => {
				calculateWordCount();
			};

			editor.on("change", handleChange);

			return () => {
				editor.off("change", handleChange);
			};
		}, [editor, calculateWordCount]);

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
