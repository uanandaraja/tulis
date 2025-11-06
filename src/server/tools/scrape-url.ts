import { tool } from "ai";
import { z } from "zod";
import { firecrawl } from "@/lib/firecrawl";

export const scrapeUrlTool = tool({
	description:
		"Extract full content from a specific URL including articles, documentation, and text-based content.",
	inputSchema: z.object({
		url: z.string().url().describe("The URL to scrape"),
	}),
	execute: async ({ url }) => {
		if (!firecrawl) {
			return {
				success: false,
				error: "Firecrawl is not configured. Please set FIRECRAWL_API_KEY environment variable.",
				url,
			};
		}

		try {
			const response = await firecrawl.scrape(url, {
				formats: ["markdown"],
				timeout: 30000,
			});

			return {
				success: true,
				url,
				content: response.markdown || "",
				metadata: {
					title: response.metadata?.title,
					description: response.metadata?.description,
					language: response.metadata?.language,
				},
			};
		} catch (error) {
			console.error("URL scrape error:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? `Scrape failed: ${error.message}`
						: "An unknown error occurred during scraping",
				url,
			};
		}
	},
});
