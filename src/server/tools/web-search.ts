import { tool } from "ai";
import { z } from "zod";
import { exa } from "@/lib/exa";

export const webSearchTool = tool({
	description:
		"Search the web for current information, news, articles, and research. Use this when you need up-to-date information that may not be in your training data.",
	inputSchema: z.object({
		query: z.string().describe("The search query to find relevant web content"),
	}),
	execute: async ({ query }) => {
		const numResults = 10;
		try {
			const searchResponse = await exa.searchAndContents(query, {
				numResults,
				type: "auto",
				useAutoprompt: true,
				text: {
					maxCharacters: 1000,
				},
			});

			if (!searchResponse.results || searchResponse.results.length === 0) {
				return {
					success: false,
					message: "No results found for the search query.",
					results: [],
				};
			}

			const formattedResults = searchResponse.results.map((result, index) => ({
				id: index + 1,
				title: result.title,
				url: result.url,
				snippet: result.text || "",
				publishedDate: result.publishedDate || null,
			}));

			const citationFormat = formattedResults
				.map(
					(result) =>
						`[${result.id}] "${result.title}" (${result.url})\n${result.snippet}\n`,
				)
				.join("\n");

			return {
				success: true,
				query,
				results: formattedResults,
				totalResults: formattedResults.length,
				citationFormat: `Use these sources and cite them by ID in your response:\n\n${citationFormat}`,
			};
		} catch (error) {
			console.error("Web search error:", error);
			return {
				success: false,
				message:
					error instanceof Error
						? `Search failed: ${error.message}`
						: "An unknown error occurred during search",
				results: [],
			};
		}
	},
});
