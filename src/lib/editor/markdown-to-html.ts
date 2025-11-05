import MarkdownIt from "markdown-it";
import { markdownItTable } from "markdown-it-table";

const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

// Add table plugin
md.use(markdownItTable);

export function markdownToHtml(markdown: string): string {
	if (!markdown || markdown.trim() === "") {
		return "<p></p>";
	}
	return md.render(markdown);
}
