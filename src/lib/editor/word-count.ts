import type { YooptaContentValue } from "@yoopta/editor";

export function calculateWordCount(editorValue: YooptaContentValue): number {
	let totalWords = 0;

	for (const blockId in editorValue) {
		const block = editorValue[blockId];
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

	return totalWords;
}
