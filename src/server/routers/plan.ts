import { z } from "zod";
import { getActivePlan, getPlanHistory } from "@/server/services/plan.service";
import { protectedProcedure, router } from "@/server/trpc";

export const planRouter = router({
	getActive: protectedProcedure
		.input(z.object({ chatId: z.string() }))
		.query(async ({ input }) => {
			return getActivePlan(input.chatId);
		}),

	getHistory: protectedProcedure
		.input(z.object({ chatId: z.string() }))
		.query(async ({ input }) => {
			return getPlanHistory(input.chatId);
		}),
});
