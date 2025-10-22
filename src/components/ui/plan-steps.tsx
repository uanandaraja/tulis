"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import {
	Steps,
	StepsContent,
	StepsItem,
	StepsTrigger,
} from "@/components/ui/steps";
import type { PlanStepsToolOutput } from "@/lib/types/ai";

export type PlanStepsProps = {
	output: PlanStepsToolOutput;
	className?: string;
};

export const PlanSteps = ({ output, className }: PlanStepsProps) => {
	const getStatusIcon = (status: "pending" | "in_progress" | "completed") => {
		switch (status) {
			case "completed":
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case "in_progress":
				return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
			case "pending":
			default:
				return <Circle className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const completedCount = output.steps.filter((s) => s.status === "completed").length;
	const totalCount = output.steps.length;
	const allCompleted = completedCount === totalCount;
	const hasInProgress = output.steps.some((s) => s.status === "in_progress");
	
	const overallStatus = allCompleted ? "completed" : hasInProgress ? "in_progress" : "pending";

	return (
		<Steps defaultOpen={true} className={cn("mt-3", className)}>
			<StepsTrigger leftIcon={getStatusIcon(overallStatus)}>
				Plan ({completedCount}/{totalCount} completed)
			</StepsTrigger>
			<StepsContent>
				{output.steps.map((step, index) => (
					<StepsItem key={index} className="flex items-start gap-2">
						<span className="flex-shrink-0 mt-0.5">
							{getStatusIcon(step.status)}
						</span>
						<div className="flex-1">
							<div className="font-medium text-foreground">{step.title}</div>
							<div className="text-muted-foreground text-xs mt-0.5">
								{step.description}
							</div>
						</div>
					</StepsItem>
				))}
			</StepsContent>
		</Steps>
	);
};
