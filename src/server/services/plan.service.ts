import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { plan, planStep } from "@/lib/db/schema";

export type PlanStatus = "active" | "completed" | "cancelled";
export type StepStatus = "pending" | "in_progress" | "completed";

export interface CreatePlanInput {
	chatId: string;
	steps: Array<{
		title: string;
		description?: string;
		status: StepStatus;
	}>;
}

export interface UpdatePlanInput {
	planId: string;
	steps: Array<{
		title: string;
		description?: string;
		status: StepStatus;
	}>;
	status?: PlanStatus;
}

/**
 * Get the active plan for a chat
 */
export async function getActivePlan(chatId: string) {
	const activePlan = await db.query.plan.findFirst({
		where: and(eq(plan.chatId, chatId), eq(plan.status, "active")),
	});

	if (!activePlan) {
		return null;
	}

	const steps = await db.query.planStep.findMany({
		where: eq(planStep.planId, activePlan.id),
		orderBy: [planStep.stepOrder],
	});

	return {
		...activePlan,
		steps,
	};
}

/**
 * Create a new plan with steps
 */
export async function createPlan(input: CreatePlanInput) {
	const planId = nanoid();

	// Create the plan
	await db.insert(plan).values({
		id: planId,
		chatId: input.chatId,
		status: "active",
	});

	// Create the steps
	if (input.steps.length > 0) {
		await db.insert(planStep).values(
			input.steps.map((step, index) => ({
				id: nanoid(),
				planId,
				title: step.title,
				description: step.description,
				status: step.status,
				stepOrder: index,
				completedAt: step.status === "completed" ? new Date() : null,
			})),
		);
	}

	return getActivePlan(input.chatId);
}

/**
 * Update an existing plan's steps
 */
export async function updatePlan(input: UpdatePlanInput) {
	const { planId, steps, status } = input;

	// Update plan status if provided
	if (status) {
		await db
			.update(plan)
			.set({
				status,
				updatedAt: new Date(),
			})
			.where(eq(plan.id, planId));
	} else {
		await db
			.update(plan)
			.set({
				updatedAt: new Date(),
			})
			.where(eq(plan.id, planId));
	}

	// Delete existing steps and recreate them
	// This is simpler than trying to match and update
	await db.delete(planStep).where(eq(planStep.planId, planId));

	if (steps.length > 0) {
		await db.insert(planStep).values(
			steps.map((step, index) => ({
				id: nanoid(),
				planId,
				title: step.title,
				description: step.description,
				status: step.status,
				stepOrder: index,
				completedAt: step.status === "completed" ? new Date() : null,
			})),
		);
	}

	// Get the updated plan
	const updatedPlan = await db.query.plan.findFirst({
		where: eq(plan.id, planId),
	});

	if (!updatedPlan) {
		return null;
	}

	const updatedSteps = await db.query.planStep.findMany({
		where: eq(planStep.planId, planId),
		orderBy: [planStep.stepOrder],
	});

	return {
		...updatedPlan,
		steps: updatedSteps,
	};
}

/**
 * Upsert a plan - create if doesn't exist, update if exists
 */
export async function upsertPlan(chatId: string, input: CreatePlanInput) {
	const existing = await getActivePlan(chatId);

	if (existing) {
		return updatePlan({
			planId: existing.id,
			steps: input.steps,
		});
	}

	return createPlan(input);
}

/**
 * Mark plan as completed
 */
export async function completePlan(planId: string) {
	await db
		.update(plan)
		.set({
			status: "completed",
			updatedAt: new Date(),
		})
		.where(eq(plan.id, planId));
}

/**
 * Get all plans for a chat (for history)
 */
export async function getPlanHistory(chatId: string) {
	const plans = await db.query.plan.findMany({
		where: eq(plan.chatId, chatId),
		orderBy: [desc(plan.createdAt)],
	});

	// Get steps for each plan
	const plansWithSteps = await Promise.all(
		plans.map(async (p) => {
			const steps = await db.query.planStep.findMany({
				where: eq(planStep.planId, p.id),
				orderBy: [planStep.stepOrder],
			});
			return { ...p, steps };
		}),
	);

	return plansWithSteps;
}
