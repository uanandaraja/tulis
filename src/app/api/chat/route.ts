import { createAgentUIStreamResponse, convertToModelMessages } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEFAULT_MODEL } from "@/lib/constants/models";
import { createWritingAgent } from "@/server/agents/writing-agent";

export async function POST(req: Request) {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { messages, selectedModel, enableReasoning } = await req.json();

	const model = selectedModel || DEFAULT_MODEL;
	const agent = createWritingAgent(model, enableReasoning);

	return createAgentUIStreamResponse({
		agent,
		messages: convertToModelMessages(messages),
	});
}
