import { z } from "zod";
import { userExists } from "../services/user.service";
import { publicProcedure, router } from "../trpc";

export const authRouter = router({
	checkUserExists: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.query(async ({ input }) => {
			const exists = await userExists(input.email);
			return { exists };
		}),
});
