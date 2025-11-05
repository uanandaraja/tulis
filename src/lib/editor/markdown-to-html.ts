import { createMarkdownExit } from "markdown-exit";

const md = createMarkdownExit({
	html: true,
	linkify: true,
	typographer: true,
});

export function markdownToHtml(markdown: string): string {
	if (!markdown || markdown.trim() === "") {
		return "<p></p>";
	}
	return md.render(markdown);
}
