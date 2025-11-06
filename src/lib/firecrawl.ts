import FirecrawlApp from "@mendable/firecrawl-js";
import { config } from "./config";

export const firecrawl = config.firecrawl
	? new FirecrawlApp({
			apiKey: config.firecrawl!.apiKey,
		})
	: null;
