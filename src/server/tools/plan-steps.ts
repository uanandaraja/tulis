import { tool } from "ai";
import { z } from "zod";
import {
	completePlan,
	getActivePlan,
	getPlanHistory,
	upsertPlan,
} from "@/server/services/plan.service";
import type { ToolContext } from "./create-tools";

export function createPlanStepsTool(context: ToolContext) {
	return tool({
		description:
			"Create or update a work plan for complex tasks. Call multiple times to update progress as steps are completed. The plan is saved to the database and persists across sessions.",
		inputSchema: z.object({
			steps: z
				.array(
					z.object({
						title: z
							.string()
							.describe(
								"Short, clear title for this step (e.g., 'Research sources', 'Write introduction')",
							),
						description: z
							.string()
							.describe(
								"Brief description of what this step involves (1 sentence)",
							),
						status: z
							.enum(["pending", "in_progress", "completed"])
							.describe(
								"Current status: 'pending' (not started), 'in_progress' (currently working on), 'completed' (finished)",
							),
					}),
				)
				.describe(
					"Complete list of ALL steps in the plan. Include all steps every time you call this tool, updating only the status fields to reflect current progress.",
				),
		}),
		execute: async ({ steps }) => {
			const { chatId } = context;

			// Calculate stats
			const pending = steps.filter((s) => s.status === "pending").length;
			const inProgress = steps.filter((s) => s.status === "in_progress").length;
			const completed = steps.filter((s) => s.status === "completed").length;

			const allComplete = completed === steps.length;
			const reminder = allComplete
				? "All steps complete. If you called Write to Editor, respond with ONLY 'Done.'"
				: "Remember to update this plan after completing each step.";

			// Only persist to DB if we have a chatId
			if (chatId) {
				try {
					await upsertPlan(chatId, {
						chatId,
						steps,
					});
				} catch (error) {
					console.error("Failed to persist plan to database:", error);
					// Continue anyway - plan will still be in context
				}
			}

			return {
				success: true,
				steps,
				summary: {
					total: steps.length,
					pending,
					inProgress,
					completed,
				},
				message: `Plan updated: ${completed}/${steps.length} steps completed${inProgress > 0 ? `, ${inProgress} in progress` : ""}. ${reminder}`,
			};
		},
	});
}

export function createGetActivePlanTool(context: ToolContext) {
	return tool({
		description:
			"Get the current active plan for this chat. Use this to check what steps are already planned and their current status before making updates.",
		inputSchema: z.object({}),
		execute: async () => {
			const { chatId } = context;

			if (!chatId) {
				return {
					success: false,
					message: "No chat context available to retrieve plan",
					plan: null,
				};
			}

			try {
				const plan = await getActivePlan(chatId);

				if (!plan) {
					return {
						success: true,
						message: "No active plan found for this chat",
						plan: null,
					};
				}

				const pending = plan.steps.filter((s) => s.status === "pending").length;
				const inProgress = plan.steps.filter(
					(s) => s.status === "in_progress",
				).length;
				const completed = plan.steps.filter(
					(s) => s.status === "completed",
				).length;

				return {
					success: true,
					message: `Found active plan with ${plan.steps.length} steps: ${completed} completed, ${inProgress} in progress, ${pending} pending`,
					plan: {
						id: plan.id,
						status: plan.status,
						createdAt: plan.createdAt,
						updatedAt: plan.updatedAt,
						steps: plan.steps,
						summary: {
							total: plan.steps.length,
							pending,
							inProgress,
							completed,
						},
					},
				};
			} catch (error) {
				console.error("Error in getActivePlan:", error);
				return {
					success: false,
					message: `Failed to retrieve plan: ${error instanceof Error ? error.message : "Unknown error"}`,
					plan: null,
				};
			}
		},
	});
}

export function createGetPlanHistoryTool(context: ToolContext) {
	return tool({
		description:
			"Get the history of all plans for this chat. Use this to see previous planning sessions and their outcomes.",
		inputSchema: z.object({
			limit: z
				.number()
				.optional()
				.default(10)
				.describe("Maximum number of plans to return"),
		}),
		execute: async ({ limit }) => {
			const { chatId } = context;

			if (!chatId) {
				return {
					success: false,
					message: "No chat context available to retrieve plan history",
					plans: [],
				};
			}

			try {
				const plans = await getPlanHistory(chatId);

				const limitedPlans = plans.slice(0, limit);

				return {
					success: true,
					message: `Found ${limitedPlans.length} plans in history`,
					plans: limitedPlans.map((plan) => ({
						id: plan.id,
						status: plan.status,
						createdAt: plan.createdAt,
						updatedAt: plan.updatedAt,
						steps: plan.steps,
						summary: {
							total: plan.steps.length,
							completed: plan.steps.filter((s) => s.status === "completed")
								.length,
						},
					})),
				};
			} catch (error) {
				console.error("Error in getPlanHistory:", error);
				return {
					success: false,
					message: `Failed to retrieve plan history: ${error instanceof Error ? error.message : "Unknown error"}`,
					plans: [],
				};
			}
		},
	});
}

export function createCompletePlanTool(context: ToolContext) {
	return tool({
		description:
			"Mark the current active plan as completed. Use this when all steps are finished and the task is complete.",
		inputSchema: z.object({}),
		execute: async () => {
			const { chatId } = context;

			if (!chatId) {
				return {
					success: false,
					message: "No chat context available to complete plan",
				};
			}

			try {
				const activePlan = await getActivePlan(chatId);

				if (!activePlan) {
					return {
						success: false,
						message: "No active plan found to complete",
					};
				}

				await completePlan(activePlan.id);

				return {
					success: true,
					message: "Plan marked as completed successfully",
					planId: activePlan.id,
				};
			} catch (error) {
				console.error("Error in completePlan:", error);
				return {
					success: false,
					message: `Failed to complete plan: ${error instanceof Error ? error.message : "Unknown error"}`,
				};
			}
		},
	});
}
