import { isToolUIPart, type UIMessage } from "ai";
import { useMemo } from "react";
import type { PlanStepsToolOutput } from "@/lib/types/ai";

export function usePlanStepsState(messages: UIMessage[]) {
	const allPlanSteps = useMemo(() => {
		const plans: Array<{
			messageId: string;
			toolCallId: string;
			output: PlanStepsToolOutput;
		}> = [];

		for (const message of messages) {
			if (message.role !== "assistant") continue;

			for (const part of message.parts) {
				if (
					isToolUIPart(part) &&
					part.type === "tool-planSteps" &&
					part.state === "output-available"
				) {
					plans.push({
						messageId: message.id,
						toolCallId: part.toolCallId,
						output: part.output as PlanStepsToolOutput,
					});
				}
			}
		}

		return plans;
	}, [messages]);

	const latestPlanSteps = useMemo(() => {
		if (allPlanSteps.length === 0) return null;
		return allPlanSteps[allPlanSteps.length - 1].output;
	}, [allPlanSteps]);

	return {
		latestPlanSteps,
		allPlanSteps,
	};
}
