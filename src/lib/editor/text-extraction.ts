import type { YooptaContentValue } from "@yoopta/editor";

export function extractPlainText(value: YooptaContentValue): string {
	const blocks = Object.values(value).sort(
		(a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0),
	);
	const texts: string[] = [];

	for (const block of blocks) {
		if (block.value && Array.isArray(block.value)) {
			for (const element of block.value) {
				if ("children" in element && Array.isArray(element.children)) {
					const extractTextFromChildren = (
						children: Array<{ text?: string; children?: unknown[] }>,
					): string => {
						return children
							.map((child) => {
								if ("text" in child && typeof child.text === "string") {
									return child.text;
								}
								if ("children" in child && Array.isArray(child.children)) {
									return extractTextFromChildren(
										child.children as Array<{
											text?: string;
											children?: unknown[];
										}>,
									);
								}
								return "";
							})
							.join("");
					};

					const text = extractTextFromChildren(
						element.children as Array<{ text?: string; children?: unknown[] }>,
					);
					if (text.trim()) {
						texts.push(text);
					}
				}
			}
		}
	}

	return texts.join("\n");
}

