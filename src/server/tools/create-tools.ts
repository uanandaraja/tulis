import type { ToolSet } from "ai";
import { createApplyDiffTool } from "./apply-diff";
import { createGetDocumentStructureTool } from "./get-document-structure";
import {
	createCompletePlanTool,
	createGetActivePlanTool,
	createGetPlanHistoryTool,
	createPlanStepsTool,
} from "./plan-steps";
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
		planSteps: createPlanStepsTool(context),
		getActivePlan: createGetActivePlanTool(context),
		getPlanHistory: createGetPlanHistoryTool(context),
		completePlan: createCompletePlanTool(context),
		writeToEditor: createWriteToEditorTool(context),
		applyDiff: createApplyDiffTool(context),
		getDocumentStructure: createGetDocumentStructureTool(context),
	} as const;
}
