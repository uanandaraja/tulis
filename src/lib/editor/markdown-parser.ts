import type { YooptaContentValue } from "@yoopta/editor";

type TextChild = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	code?: boolean;
	underline?: boolean;
	strike?: boolean;
};

export function parseInlineMarkdown(text: string): TextChild[] {
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

	const children: TextChild[] = [];

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
}

export function parseMarkdownToYoopta(markdown: string): YooptaContentValue {
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
							children: TextChild[];
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
		} else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
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
}
