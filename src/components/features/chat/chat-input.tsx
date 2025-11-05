import { ArrowUp, Brain, CheckCircle2, Circle, Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@/components/ai-elements/task";
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
import type { PlanStepsToolOutput } from "@/lib/types/ai";

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
	planSteps?: PlanStepsToolOutput | null;
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
	planSteps,
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

	const getStatusIcon = React.useCallback(() => {
		if (!planSteps) return null;
		const completedCount = planSteps.steps.filter(
			(s) => s.status === "completed",
		).length;
		const totalCount = planSteps.steps.length;
		const allCompleted = completedCount === totalCount;

		if (allCompleted) {
			return <CheckCircle2 className="h-4 w-4 text-green-500" />;
		}
		const hasInProgress = planSteps.steps.some(
			(s) => s.status === "in_progress",
		);
		if (hasInProgress) {
			return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
		}
		return <Circle className="h-4 w-4 text-muted-foreground" />;
	}, [planSteps]);

	return (
		<TooltipProvider>
			<div className="pb-4">
				{planSteps && planSteps.steps.length > 0 && (
					<div
						className="mb-0 mx-auto rounded-t-md border-x border-t border-input bg-background px-3 py-2 shadow-xs relative z-0"
						style={{ width: "calc(100% - 32px)" }}
					>
						<Task defaultOpen={false} className="mt-0">
							<TaskTrigger title="Plan Steps" icon={getStatusIcon()} />
							<TaskContent>
								{planSteps.steps.map((step, index) => {
									const isCompleted = step.status === "completed";
									return (
										<TaskItem key={`${step.title}-${index}`}>
											<div className="flex items-start gap-2">
												{isCompleted ? (
													<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
												) : step.status === "in_progress" ? (
													<Loader2 className="h-4 w-4 text-blue-500 animate-spin mt-0.5 flex-shrink-0" />
												) : (
													<Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
												)}
												<div className="flex-1 min-w-0">
													<div
														className={
															isCompleted
																? "text-muted-foreground line-through"
																: ""
														}
													>
														{step.title}
													</div>
													{step.description && (
														<div
															className={`text-xs text-muted-foreground mt-1 ${
																isCompleted ? "line-through" : ""
															}`}
														>
															{step.description}
														</div>
													)}
												</div>
											</div>
										</TaskItem>
									);
								})}
							</TaskContent>
						</Task>
					</div>
				)}
				<form onSubmit={handleSubmit} className="relative z-10">
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
									<SelectTrigger className="min-w-[200px] w-auto border-0 shadow-none focus:ring-0">
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
			</div>
		</TooltipProvider>
	);
});
