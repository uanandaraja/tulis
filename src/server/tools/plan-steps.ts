import { tool } from "ai";
import { z } from "zod";

export const planStepsTool = tool({
	description:
		"Create or update your work plan with steps for completing a complex task. MANDATORY for long-form writing tasks (articles, essays, reports). Call this tool MULTIPLE times to show progress: (1) Create initial plan with all steps 'pending', (2) Before starting each step, update it to 'in_progress', (3) After completing each step, update it to 'completed', (4) After final Write to Editor call, update ALL steps to 'completed'. This is how users track your real-time progress. Typical writing workflow: Research → Outline → Write Draft → Finalize.",
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

		return {
			success: true,
			steps,
			summary: {
				total: steps.length,
				pending,
				inProgress,
				completed,
			},
			message: `Plan updated: ${completed}/${steps.length} steps completed${inProgress > 0 ? `, ${inProgress} in progress` : ""}`,
		};
	},
});
