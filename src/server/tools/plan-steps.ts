import { tool } from "ai";
import { z } from "zod";

export const planStepsTool = tool({
	description:
		"Create or update a plan with steps for completing a complex task. Use this when you need to break down a task into multiple steps (like writing an article, essay, or research piece). You can update the plan as you progress through the steps. Each step should have a clear title and description.",
	inputSchema: z.object({
		steps: z
			.array(
				z.object({
					title: z.string().describe("Short title for this step"),
					description: z
						.string()
						.describe("Brief description of what this step involves"),
					status: z
						.enum(["pending", "in_progress", "completed"])
						.describe("Current status of this step"),
				}),
			)
			.describe("List of steps in the plan"),
	}),
	execute: async ({ steps }) => {
		return {
			success: true,
			steps,
			message: `Plan updated with ${steps.length} steps`,
		};
	},
});
