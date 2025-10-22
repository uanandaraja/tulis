import { tool } from "ai";
import Exa from "exa-js";
import { z } from "zod";

const exaApiKey = process.env.EXA_API_KEY;

if (!exaApiKey) {
	throw new Error("EXA_API_KEY environment variable is not set");
}

const exa = new Exa(exaApiKey);

export const webSearchTool = tool({
	description:
		"Search the web for current information, news, articles, and research. Use this when you need up-to-date information that may not be in your training data.",
	inputSchema: z.object({
		query: z.string().describe("The search query to find relevant web content"),
		numResults: z
			.number()
			.min(1)
			.max(10)
			.default(5)
			.describe("Number of results to return (1-10)"),
	}),
	execute: async ({ query, numResults }) => {
		try {
			const searchResponse = await exa.searchAndContents(query, {
				numResults,
				type: "auto",
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

			const formattedResults = searchResponse.results.map((result) => ({
				title: result.title,
				url: result.url,
				snippet: result.text || "",
				publishedDate: result.publishedDate || null,
			}));

			return {
				success: true,
				query,
				results: formattedResults,
				totalResults: formattedResults.length,
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
