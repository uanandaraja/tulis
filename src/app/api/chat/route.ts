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

	const systemPrompt = `You are a helpful assistant. When you use the web search tool to find information, you MUST cite your sources.

IMPORTANT CITATION FORMAT: Place citations AFTER periods at the end of sentences. Use separate square brackets for each citation like [1] [2] [3], NOT comma-separated like [1, 2, 3].

CORRECT FORMAT: "The company announced new features. [1] They plan to expand next year. [2] [3]"
INCORRECT FORMAT: "The company announced new features [1, 2]. They plan to expand next year [3]."

This ensures sources display correctly inline in the user interface.`;

	const result = streamText({
		model: openrouter(model),
		messages: convertToModelMessages(messages),
		system: systemPrompt,
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
