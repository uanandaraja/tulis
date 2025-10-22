import { scrapeUrlTool } from "./scrape-url";
import { webSearchTool } from "./web-search";

export const tools = {
	webSearch: webSearchTool,
	scrapeUrl: scrapeUrlTool,
} as const;

export type AvailableTools = typeof tools;
