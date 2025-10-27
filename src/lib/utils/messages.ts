import type { UIMessage } from "ai";

/**
 * Clean messages to remove undefined values from tool outputs.
 * AI SDK v6 validates tool outputs and rejects objects with undefined values.
 * Also filters out tool parts with undefined outputs, error states, or failed validation.
 */
export function cleanMessages(messages: UIMessage[]): UIMessage[] {
	return messages.map((message) => ({
		...message,
		parts: message.parts
			.filter((part: any) => {
				// Filter out tool parts that have undefined output
				if ("output" in part && part.output === undefined) {
					return false;
				}
				// Filter out tool parts in error state
				if ("state" in part && part.state === "output-error") {
					return false;
				}
				// Filter out tool parts that have errorText (failed validation)
				if ("errorText" in part && part.errorText) {
					return false;
				}
				// Filter out tool parts that have rawInput (invalid/unvalidated input)
				if ("rawInput" in part) {
					return false;
				}
				return true;
			})
			.map((part: any) => {
				// Clean tool parts to remove undefined values from within the output object
				if (
					"output" in part &&
					part.output &&
					typeof part.output === "object"
				) {
					const cleanedOutput: Record<string, unknown> = {};
					for (const [key, value] of Object.entries(part.output)) {
						if (value !== undefined) {
							cleanedOutput[key] = value;
						}
					}
					return { ...part, output: cleanedOutput };
				}
				return part;
			}),
	}));
}
