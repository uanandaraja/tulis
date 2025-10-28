import { ArrowUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
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
import { AI_MODELS } from "@/lib/constants/models";
import React from "react";

interface ChatInputProps {
	input: string;
	onInputChange: (value: string) => void;
	onSubmit: () => void;
	isLoading: boolean;
	selectedModel: string;
	onModelChange: (model: string) => void;
	enableReasoning: boolean;
	onReasoningToggle: () => void;
	supportsReasoning: boolean;
}

export const ChatInput = React.memo(function ChatInput({
	input,
	onInputChange,
	onSubmit,
	isLoading,
	selectedModel,
	onModelChange,
	enableReasoning,
	onReasoningToggle,
	supportsReasoning,
}: ChatInputProps) {
	const handleSubmit = React.useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			onSubmit();
		},
		[onSubmit],
	);

	const handleReasoningToggle = React.useCallback(() => {
		onReasoningToggle();
	}, [onReasoningToggle]);

	return (
		<TooltipProvider>
			<form onSubmit={handleSubmit} className="pb-4">
				<PromptInput
					value={input}
					onValueChange={onInputChange}
					onSubmit={onSubmit}
					isLoading={isLoading}
				>
					<PromptInputTextarea placeholder="Ask me anything..." />
					<PromptInputActions className="justify-between">
						<div className="flex items-center gap-2">
							<Select value={selectedModel} onValueChange={onModelChange}>
								<SelectTrigger className="w-[200px] border-0 shadow-none focus:ring-0">
									<SelectValue placeholder="Select model" />
								</SelectTrigger>
								<SelectContent>
									{AI_MODELS.map((model) => (
										<SelectItem key={model.value} value={model.value}>
											{model.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{supportsReasoning && (
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											onClick={handleReasoningToggle}
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
							)}
						</div>
						<Button
							type="submit"
							size="icon"
							disabled={isLoading || !input.trim()}
							className="rounded-full h-8 w-8"
						>
							<ArrowUp className="h-4 w-4" />
						</Button>
					</PromptInputActions>
				</PromptInput>
			</form>
		</TooltipProvider>
	);
});
