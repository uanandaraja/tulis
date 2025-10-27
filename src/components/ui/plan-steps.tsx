"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import {
	Queue,
	QueueSection,
	QueueSectionTrigger,
	QueueSectionLabel,
	QueueSectionContent,
	QueueList,
	QueueItem,
	QueueItemIndicator,
	QueueItemContent,
	QueueItemDescription,
} from "@/components/ai-elements/queue";
import type { PlanStepsToolOutput } from "@/lib/types/ai";

export type PlanStepsProps = {
	output: PlanStepsToolOutput;
	className?: string;
};

export const PlanSteps = ({ output, className }: PlanStepsProps) => {
	const completedCount = output.steps.filter((s) => s.status === "completed").length;
	const totalCount = output.steps.length;
	const allCompleted = completedCount === totalCount;

	const getStatusIcon = () => {
		if (allCompleted) {
			return <CheckCircle2 className="h-4 w-4 text-green-500" />;
		}
		const hasInProgress = output.steps.some((s) => s.status === "in_progress");
		if (hasInProgress) {
			return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
		}
		return <Circle className="h-4 w-4 text-muted-foreground" />;
	};

	return (
		<Queue className={cn("mt-3", className)}>
			<QueueSection defaultOpen={false}>
				<QueueSectionTrigger>
					<QueueSectionLabel
						icon={getStatusIcon()}
						count={completedCount}
						label={`/ ${totalCount} Plan Steps`}
					/>
				</QueueSectionTrigger>
				<QueueSectionContent>
					<QueueList>
						{output.steps.map((step, index) => {
							const isCompleted = step.status === "completed";
							return (
								<QueueItem key={index}>
									<div className="flex items-start gap-3">
										<QueueItemIndicator completed={isCompleted} />
										<div className="flex-1 min-w-0">
											<QueueItemContent completed={isCompleted}>
												{step.title}
											</QueueItemContent>
											{step.description && (
												<QueueItemDescription completed={isCompleted}>
													{step.description}
												</QueueItemDescription>
											)}
										</div>
									</div>
								</QueueItem>
							);
						})}
					</QueueList>
				</QueueSectionContent>
			</QueueSection>
		</Queue>
	);
};
