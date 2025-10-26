import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import {
	createToolsWithContext,
	type ToolContext,
} from "@/server/tools/create-tools";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export function createWritingAgent(
	model: string,
	enableReasoning?: boolean,
	context?: ToolContext,
) {
	return new ToolLoopAgent({
		model: openrouter.chat(model),
		instructions: SYSTEM_PROMPT,
		tools: context ? createToolsWithContext(context) : {},
		stopWhen: stepCountIs(20),
		providerOptions: enableReasoning
			? {
					openrouter: {
						reasoning: {
							max_tokens: 5000,
						},
					},
				}
			: undefined,
	});
}

export const defaultWritingAgent = createWritingAgent(
	"google/gemini-2.5-flash-lite-preview-09-2025",
);

export type WritingAgentUIMessage = InferAgentUIMessage<
	typeof defaultWritingAgent
>;
