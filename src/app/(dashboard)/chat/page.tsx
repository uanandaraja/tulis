"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message";
import { PromptInput, PromptInputTextarea } from "@/components/ui/prompt-input";

export default function ChatPage() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, error } = useChat({
		api: "/api/chat",
	});

	const isLoading = status === "submitted" || status === "streaming";

	const handleSubmit = () => {
		if (input.trim() && !isLoading) {
			sendMessage({
				role: "user",
				text: input,
			});
			setInput("");
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] px-4 py-8 max-w-4xl mx-auto w-full">
			<div className="flex flex-col flex-1 min-h-0 gap-6">
				<div className="flex-shrink-0">
					<h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
					<p className="text-muted-foreground mt-2">Chat with AI</p>
				</div>

				<ChatContainerRoot
					className="flex-1 border rounded-lg"
					style={{ minHeight: 0 }}
				>
					<ChatContainerContent className="p-4 space-y-4">
						{messages.length === 0 ? (
							<div className="text-center text-muted-foreground py-12">
								Start a conversation by typing a message below
							</div>
						) : (
							messages.map((message: UIMessage) => {
								// Extract text from all text parts
								const content = message.parts
									.filter((part) => part.type === "text")
									.map((part) => ("text" in part ? part.text : ""))
									.join("");

								// Only render if there's content
								if (!content.trim()) return null;

								return (
									<Message key={message.id}>
										<MessageAvatar
											src={
												message.role === "user"
													? "/placeholder.svg"
													: "/logo.svg"
											}
											alt={message.role === "user" ? "You" : "AI"}
											fallback={message.role === "user" ? "U" : "AI"}
										/>
										<MessageContent 
											markdown={message.role === "assistant"}
											className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border"
										>
											{content}
										</MessageContent>
									</Message>
								);
							})
						)}
						{isLoading &&
							messages[messages.length - 1]?.role !== "assistant" && (
								<Message>
									<MessageAvatar src="/logo.svg" alt="AI" fallback="AI" />
									<div className="rounded-lg p-2 text-foreground bg-secondary">
										<Loader variant="typing" size="sm" />
									</div>
								</Message>
							)}
					</ChatContainerContent>
				</ChatContainerRoot>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
						Error: {error.message}
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="relative"
				>
					<PromptInput
						value={input}
						onValueChange={setInput}
						onSubmit={handleSubmit}
						isLoading={isLoading}
					>
						<PromptInputTextarea
							placeholder="Ask me anything..."
							className="pr-14"
						/>
					</PromptInput>
					<Button
						type="submit"
						size="icon"
						disabled={isLoading || !input.trim()}
						className="absolute right-3 bottom-3 rounded-full h-8 w-8"
					>
						<ArrowUp className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
