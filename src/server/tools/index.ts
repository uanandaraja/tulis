import { webSearchTool } from "./web-search";

export const tools = {
	webSearch: webSearchTool,
} as const;

export type AvailableTools = typeof tools;
