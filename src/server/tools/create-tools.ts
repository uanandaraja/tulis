import type { ToolSet } from "ai";
import { createBatchEditTool } from "./batch-edit";
import { createEditContentTool } from "./edit-content";
import { createGetDocumentStructureTool } from "./get-document-structure";
import { createInsertContentTool } from "./insert-content";
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
		batchEdit: createBatchEditTool(context),
		editContent: createEditContentTool(context),
		insertContent: createInsertContentTool(context),
		getDocumentStructure: createGetDocumentStructureTool(context),
		planSteps: planStepsTool,
	} as const;
}
