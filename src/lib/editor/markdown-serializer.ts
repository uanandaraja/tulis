import TurndownService from "turndown";

const turndownService = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	bulletListMarker: "-",
});

// Configure turndown to handle code blocks properly
turndownService.addRule("codeBlock", {
	filter: (node: Node) => {
		return node.nodeName === "PRE" && node.firstChild?.nodeName === "CODE";
	},
	replacement: (_content: string, node: Node) => {
		const code = node as HTMLElement;
		const codeElement = code.querySelector("code");
		const language =
			codeElement?.className?.replace(/^language-/, "")?.trim() || "";
		const codeContent = codeElement?.textContent || "";
		return `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n`;
	},
});

export function htmlToMarkdown(html: string): string {
	if (!html || html.trim() === "") {
		return "";
	}
	try {
		return turndownService.turndown(html);
	} catch (error) {
		console.error("Error converting HTML to markdown:", error);
		return "";
	}
}
