import type { ToolUIPart } from "ai";
import type { ToolPart } from "@/components/ui/tool";

export type WebSearchToolUIPart = ToolUIPart & {
	type: "tool-webSearch";
};

export type WebSearchToolOutput = {
	success: boolean;
	query?: string;
	results: Array<{
		id: number;
		title: string;
		url: string;
		snippet: string;
		publishedDate?: string | null;
	}>;
	citationFormat?: string;
	message?: string;
	totalResults?: number;
};

export type ScrapeUrlToolOutput = {
	success: boolean;
	url: string;
	content?: string;
	error?: string;
	metadata?: {
		title?: string;
		description?: string;
		language?: string;
	};
};

export type WriteToEditorToolOutput = {
	success: boolean;
	action: "set" | "append" | "prepend";
	content: string;
	documentId?: string;
	message: string;
};

export type PlanStepsToolOutput = {
	success: boolean;
	steps: Array<{
		title: string;
		description: string;
		status: "pending" | "in_progress" | "completed";
	}>;
	message: string;
};

export interface ToolConfig {
	displayName: string;
	iconName?: "globe" | "fileText" | string;
	iconColor?: string;
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
	"tool-webSearch": {
		displayName: "Searching the web",
		iconName: "globe",
		iconColor: "text-blue-500",
	},
	"tool-scrapeUrl": {
		displayName: "Scraping URL",
		iconName: "fileText",
		iconColor: "text-amber-500",
	},
	"tool-writeToEditor": {
		displayName: "Writing to editor",
		iconName: "fileEdit",
		iconColor: "text-purple-500",
	},
	"tool-planSteps": {
		displayName: "Planning steps",
		iconName: "listChecks",
		iconColor: "text-green-500",
	},
};

export function getToolConfig(toolType: string): ToolConfig {
	return (
		TOOL_CONFIGS[toolType] || {
			displayName: toolType.replace(/^tool-/, ""),
		}
	);
}

export function toToolPart(toolUIPart: ToolUIPart): ToolPart {
	const state = toolUIPart.state;
	const mappedState =
		state === "approval-requested" ||
		state === "approval-responded" ||
		state === "output-denied"
			? "input-available"
			: state;

	return {
		type: toolUIPart.type,
		state: mappedState,
		input: toolUIPart.input as Record<string, unknown>,
		output: toolUIPart.output as Record<string, unknown>,
		toolCallId: toolUIPart.toolCallId,
		errorText: toolUIPart.errorText,
	};
}

export function isWebSearchToolOutput(
	output: unknown,
): output is WebSearchToolOutput {
	if (!output || typeof output !== "object") return false;
	const obj = output as Record<string, unknown>;
	return (
		typeof obj.success === "boolean" &&
		Array.isArray(obj.results) &&
		obj.results.every(
			(result: unknown) =>
				typeof result === "object" &&
				result !== null &&
				typeof (result as Record<string, unknown>).id === "number" &&
				typeof (result as Record<string, unknown>).url === "string" &&
				typeof (result as Record<string, unknown>).title === "string",
		)
	);
}
