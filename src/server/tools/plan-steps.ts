import { tool } from "ai";
import { z } from "zod";

export const planStepsTool = tool({
	description:
		"Create or update a work plan for complex tasks. Call multiple times to update progress as steps are completed.",
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
		const pending = steps.filter((s) => s.status === "pending").length;
		const inProgress = steps.filter((s) => s.status === "in_progress").length;
		const completed = steps.filter((s) => s.status === "completed").length;

		const allComplete = completed === steps.length;
		const reminder = allComplete
			? "All steps complete. If you called Write to Editor, respond with ONLY 'Done.'"
			: "Remember to update this plan after completing each step.";

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
