import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

if (!firecrawlApiKey) {
	throw new Error("FIRECRAWL_API_KEY environment variable is not set");
}

export const firecrawl = new FirecrawlApp({
	apiKey: firecrawlApiKey,
});
