import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { messages }: { messages: UIMessage[] } = await req.json();

	const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o";

	const result = streamText({
		model: openrouter(model),
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
	});
}
