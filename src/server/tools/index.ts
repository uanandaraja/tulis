import { editContentTool } from "./edit-content";
import { getDocumentStructureTool } from "./get-document-structure";
import { insertContentTool } from "./insert-content";
import { planStepsTool } from "./plan-steps";
import { scrapeUrlTool } from "./scrape-url";
import { webSearchTool } from "./web-search";
import { writeToEditorTool } from "./write-to-editor";

export const tools = {
	webSearch: webSearchTool,
	scrapeUrl: scrapeUrlTool,
	writeToEditor: writeToEditorTool,
	editContent: editContentTool,
	insertContent: insertContentTool,
	getDocumentStructure: getDocumentStructureTool,
	planSteps: planStepsTool,
} as const;

export type AvailableTools = typeof tools;
