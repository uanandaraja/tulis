"use client";

import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";
import { useState } from "react";

export default function ChatPage() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, error } = useChat({
		api: "/api/chat",
	});

	const isLoading = status === "submitted" || status === "streaming";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage({ text: input });
			setInput("");
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] px-4 py-8">
			<div className="space-y-6 flex-1 flex flex-col">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
					<p className="text-muted-foreground mt-2">Chat with AI</p>
				</div>

				<div className="flex-1 overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/30">
					{messages.length === 0 ? (
						<div className="text-center text-muted-foreground py-12">
							Start a conversation by typing a message below
						</div>
					) : (
						messages.map((message: Message) => (
							<div
								key={message.id}
								className={`flex ${
									message.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-[80%] rounded-lg px-4 py-2 ${
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									<div className="text-sm font-medium mb-1">
										{message.role === "user" ? "You" : "AI"}
									</div>
									<div className="whitespace-pre-wrap">
										{message.parts.map((part, index) => {
											if (part.type === "text") {
												return <span key={index}>{part.text}</span>;
											}
											return null;
										})}
									</div>
								</div>
							</div>
						))
					)}
					{isLoading && (
						<div className="flex justify-start">
							<div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
								<div className="text-sm font-medium mb-1">AI</div>
								<div className="flex space-x-1">
									<div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
									<div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
									<div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
								</div>
							</div>
						</div>
					)}
				</div>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
						Error: {error.message}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type your message..."
						disabled={isLoading}
						className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed bg-background"
					/>
					<button
						type="submit"
						disabled={isLoading || !input.trim()}
						className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
}
