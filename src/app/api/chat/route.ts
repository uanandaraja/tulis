import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEFAULT_MODEL } from "@/lib/constants/models";

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
	});
}
