"use client";

import { ArrowUp, Brain } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { PromptInput, PromptInputTextarea } from "@/components/ui/prompt-input";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AI_MODELS,
	DEFAULT_MODEL,
	modelSupportsReasoning,
} from "@/lib/constants/models";

export default function NewChatPage() {
	const router = useRouter();
	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [enableReasoning, setEnableReasoning] = useState(false);

	const supportsReasoning = modelSupportsReasoning(selectedModel);

	const handleSubmit = () => {
		if (input.trim()) {
			const newChatId = uuidv4();

			sessionStorage.setItem(
				`chat-${newChatId}-initial`,
				JSON.stringify({
					prompt: input,
					model: selectedModel,
					reasoning: enableReasoning && supportsReasoning,
				}),
			);

			router.push(`/chat/${newChatId}`);
		}
	};

	return (
		<div className="flex flex-col justify-center h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4">
			<div className="text-left mb-12">
				<h1 className="text-2xl font-semibold mb-2">
					What would you like to write today?
				</h1>
				<p className="text-muted-foreground text-sm">
					I'll research, plan, and write high-quality content for you.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				className="w-full max-w-2xl relative"
			>
				<PromptInput
					value={input}
					onValueChange={setInput}
					onSubmit={handleSubmit}
					isLoading={false}
				>
					<PromptInputTextarea
						placeholder="Write an article about..."
						className="pr-14 min-h-[120px]"
						autoFocus
					/>
					<div className="flex items-center gap-3 px-2">
						<Select value={selectedModel} onValueChange={setSelectedModel}>
							<SelectTrigger
								className="min-w-[200px] w-auto border-0 shadow-none focus:ring-0"
								suppressHydrationWarning
							>
								<SelectValue placeholder="Select model">
									{(() => {
										const selected = AI_MODELS.find(
											(m) => m.value === selectedModel,
										);
										return selected ? (
											<div className="flex items-center gap-2 whitespace-nowrap">
												<Image
													src={selected.logo}
													alt={selected.label}
													width={16}
													height={16}
													className="shrink-0"
												/>
												<span>{selected.label}</span>
											</div>
										) : null;
									})()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{AI_MODELS.map((model) => (
									<SelectItem key={model.value} value={model.value}>
										<div className="flex items-center gap-2">
											<Image
												src={model.logo}
												alt={model.label}
												width={16}
												height={16}
												className="shrink-0"
											/>
											<span>{model.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{supportsReasoning && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											onClick={() => setEnableReasoning(!enableReasoning)}
											aria-label="Toggle reasoning"
											className="p-2 rounded-md hover:bg-muted transition-colors"
										>
											<Brain
												className={`h-4 w-4 transition-colors ${
													enableReasoning
														? "text-blue-500"
														: "text-muted-foreground"
												}`}
											/>
										</button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Show reasoning</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				</PromptInput>
				<Button
					type="submit"
					size="icon"
					disabled={!input.trim()}
					className="absolute right-3 bottom-3 rounded-full h-8 w-8"
				>
					<ArrowUp className="h-4 w-4" />
				</Button>
			</form>

			<div className="mt-12 flex flex-wrap gap-2 justify-start w-full max-w-2xl">
				<PromptSuggestion
					onClick={() =>
						setInput("Write a comprehensive guide about AI safety")
					}
				>
					Write a guide about AI safety
				</PromptSuggestion>
				<PromptSuggestion
					onClick={() =>
						setInput("Write a blog post about the future of remote work")
					}
				>
					Blog post: future of remote work
				</PromptSuggestion>
				<PromptSuggestion
					onClick={() =>
						setInput("Write an essay exploring the impact of social media")
					}
				>
					Essay on social media impact
				</PromptSuggestion>
				<PromptSuggestion
					onClick={() =>
						setInput(
							"Research and write about the latest trends in quantum computing",
						)
					}
				>
					Quantum computing trends
				</PromptSuggestion>
				<PromptSuggestion
					onClick={() =>
						setInput("Write a product comparison between top note-taking apps")
					}
				>
					Compare note-taking apps
				</PromptSuggestion>
			</div>
		</div>
	);
}
