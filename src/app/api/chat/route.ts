import { createAgentUIStreamResponse } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEFAULT_MODEL } from "@/lib/constants/models";
import { cleanMessages } from "@/lib/utils/messages";
import { createWritingAgent } from "@/server/agents/writing-agent";

export async function POST(req: Request) {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { messages, selectedModel, enableReasoning, chatId, documentId } =
		await req.json();

	const model = selectedModel || DEFAULT_MODEL;
	const agent = createWritingAgent(model, enableReasoning, {
		userId: session.user.id,
		chatId: chatId || null,
		documentId: documentId || null,
	});

	try {
		// Clean messages to remove undefined values that cause validation errors
		const cleanedMessages = cleanMessages(messages);

		const response = await createAgentUIStreamResponse({
			agent,
			messages: cleanedMessages,
			sendReasoning: true, // Forward reasoning tokens to the client
		});
		return response;
	} catch (error) {
		console.error("[Chat API] Error:", error);
		throw error;
	}
}
