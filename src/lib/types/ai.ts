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

export function toToolPart(toolUIPart: ToolUIPart): ToolPart {
	return {
		type: toolUIPart.type,
		state: toolUIPart.state,
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
