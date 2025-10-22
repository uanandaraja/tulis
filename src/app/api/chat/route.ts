import { openrouter } from "@openrouter/ai-sdk-provider";
import {
	convertToModelMessages,
	stepCountIs,
	streamText,
	type UIMessage,
} from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEFAULT_MODEL } from "@/lib/constants/models";
import { tools } from "@/server/tools";

export async function POST(req: Request) {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const {
		messages,
		selectedModel,
		enableReasoning,
	}: {
		messages: UIMessage[];
		selectedModel?: string;
		enableReasoning?: boolean;
	} = await req.json();

	const model = selectedModel || DEFAULT_MODEL;

	const result = streamText({
		model: openrouter(model),
		messages: convertToModelMessages(messages),
		tools,
		stopWhen: stepCountIs(10),
		providerOptions: enableReasoning
			? {
					openrouter: {
						reasoning: {
							max_tokens: 5000,
						},
					},
				}
			: undefined,
		onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
			console.log("Step finished:", {
				text: text?.slice(0, 100),
				toolCalls: toolCalls?.map((tc) => tc.toolName),
				toolResults: toolResults?.length,
				finishReason,
				usage,
			});
		},
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		sendReasoning: true,
		onError: (error) => {
			console.error("Chat error:", error);
			return error instanceof Error ? error.message : "An error occurred";
		},
	});
}
