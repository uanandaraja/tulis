import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

export const firecrawl = firecrawlApiKey 
	? new FirecrawlApp({
			apiKey: firecrawlApiKey,
		})
	: null;
