import type { ToolSet } from "ai";
import { editContentTool } from "./edit-content";
import { getDocumentStructureTool } from "./get-document-structure";
import { insertContentTool } from "./insert-content";
import { planStepsTool } from "./plan-steps";
import { scrapeUrlTool } from "./scrape-url";
import { webSearchTool } from "./web-search";
import { createWriteToEditorTool } from "./write-to-editor-with-context";

export interface ToolContext {
	userId: string;
	chatId?: string | null;
	documentId?: string | null;
}

export function createToolsWithContext(context: ToolContext): ToolSet {
	return {
		webSearch: webSearchTool,
		scrapeUrl: scrapeUrlTool,
		writeToEditor: createWriteToEditorTool(context),
		editContent: editContentTool,
		insertContent: insertContentTool,
		getDocumentStructure: getDocumentStructureTool,
		planSteps: planStepsTool,
	} as const;
}
