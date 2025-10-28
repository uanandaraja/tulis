"use client";

import { useParams } from "next/navigation";
import { ChatInterface } from "@/components/features/chat/chat-interface";
import { Loader } from "@/components/ui/loader";
import { DEFAULT_MODEL } from "@/lib/constants/models";
import { trpc } from "@/lib/trpc/react";

export default function ChatPage() {
	const params = useParams();
	const chatId = params.id as string;

	const initialDataRaw =
		typeof window !== "undefined"
			? sessionStorage.getItem(`chat-${chatId}-initial`)
			: null;
	const initialData = initialDataRaw ? JSON.parse(initialDataRaw) : null;

	const isNewChat = !!initialData;

	const { data: savedMessages, isLoading: isLoadingSavedMessages } =
		trpc.chat.get.useQuery({ chatId }, { enabled: !isNewChat });

	const isLoadingExistingChat = !isNewChat && isLoadingSavedMessages;

	if (isLoadingExistingChat) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<Loader variant="circular" size="lg" />
			</div>
		);
	}

	const initialMessages = isNewChat ? [] : savedMessages || [];

	return (
		<ChatInterface
			chatId={chatId}
			initialMessages={initialMessages}
			initialModel={initialData?.model || DEFAULT_MODEL}
			initialReasoning={initialData?.reasoning || false}
			isNewChat={isNewChat}
			initialPrompt={initialData?.prompt}
		/>
	);
}
