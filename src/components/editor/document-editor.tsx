"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Code,
	Italic,
	Link as LinkIcon,
	Strikethrough,
	X,
} from "lucide-react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
	({ className, placeholder = "Start writing...", initialContent }, ref) => {
		const [wordCount, setWordCount] = useState(0);
		const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
		const [linkUrl, setLinkUrl] = useState("");
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
					class:
						"prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
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

		// Update link URL when selection changes to show current link
		useEffect(() => {
			if (!editor) return;

			const updateLinkUrl = () => {
				const attrs = editor.getAttributes("link");
				if (attrs.href && editor.isActive("link")) {
					setLinkUrl(attrs.href);
				} else if (!linkPopoverOpen) {
					// Only reset if popover is closed
					setLinkUrl("");
				}
			};

			editor.on("selectionUpdate", updateLinkUrl);
			return () => {
				editor.off("selectionUpdate", updateLinkUrl);
			};
		}, [editor, linkPopoverOpen]);

		const handleLinkSubmit = useCallback(() => {
			if (!editor) return;

			const url = linkUrl.trim();
			if (url) {
				// Add protocol if missing
				const formattedUrl =
					url.startsWith("http://") || url.startsWith("https://")
						? url
						: `https://${url}`;

				editor
					.chain()
					.focus()
					.extendMarkRange("link")
					.setLink({ href: formattedUrl })
					.run();
			} else if (editor.isActive("link")) {
				editor.chain().focus().unsetLink().run();
			}
			setLinkPopoverOpen(false);
		}, [editor, linkUrl]);

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
				<BubbleMenu
					editor={editor}
					options={{
						placement: "top",
					}}
				>
					<div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg">
						<Button
							variant={editor.isActive("bold") ? "secondary" : "ghost"}
							size="icon-sm"
							onClick={() => editor.chain().focus().toggleBold().run()}
							className="h-8 w-8"
						>
							<Bold className="h-4 w-4" />
						</Button>
						<Button
							variant={editor.isActive("italic") ? "secondary" : "ghost"}
							size="icon-sm"
							onClick={() => editor.chain().focus().toggleItalic().run()}
							className="h-8 w-8"
						>
							<Italic className="h-4 w-4" />
						</Button>
						<Button
							variant={editor.isActive("strike") ? "secondary" : "ghost"}
							size="icon-sm"
							onClick={() => editor.chain().focus().toggleStrike().run()}
							className="h-8 w-8"
						>
							<Strikethrough className="h-4 w-4" />
						</Button>
						<Button
							variant={editor.isActive("code") ? "secondary" : "ghost"}
							size="icon-sm"
							onClick={() => editor.chain().focus().toggleCode().run()}
							className="h-8 w-8"
						>
							<Code className="h-4 w-4" />
						</Button>
						<Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									variant={editor.isActive("link") ? "secondary" : "ghost"}
									size="icon-sm"
									onClick={() => {
										const attrs = editor.getAttributes("link");
										if (attrs.href) {
											setLinkUrl(attrs.href);
										} else {
											setLinkUrl("");
										}
									}}
									className="h-8 w-8"
								>
									<LinkIcon className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-80"
								onOpenAutoFocus={(e) => {
									e.preventDefault();
									// Focus the input when popover opens
									setTimeout(() => {
										const input = document.getElementById(
											"link-url",
										) as HTMLInputElement;
										if (input) {
											input.focus();
											input.select();
										}
									}, 0);
								}}
							>
								<div className="space-y-3">
									<div className="space-y-2">
										<Label htmlFor="link-url">URL</Label>
										<Input
											id="link-url"
											placeholder="https://example.com"
											value={linkUrl}
											onChange={(e) => setLinkUrl(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleLinkSubmit();
												}
												if (e.key === "Escape") {
													setLinkPopoverOpen(false);
												}
											}}
										/>
									</div>
									<div className="flex items-center gap-2">
										<Button
											size="sm"
											onClick={handleLinkSubmit}
											className="flex-1"
										>
											{editor.isActive("link") ? "Update" : "Add"} Link
										</Button>
										{editor.isActive("link") && (
											<Button
												size="sm"
												variant="destructive"
												onClick={() => {
													editor.chain().focus().unsetLink().run();
													setLinkPopoverOpen(false);
													setLinkUrl("");
												}}
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</BubbleMenu>
				<div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground z-10">
					{wordCount} {wordCount === 1 ? "word" : "words"}
				</div>
			</div>
		);
	},
);

DocumentEditor.displayName = "DocumentEditor";
