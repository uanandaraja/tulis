import { router } from "../trpc";
import { authRouter } from "./auth";
import { healthRouter } from "./health";
import { usersRouter } from "./users";

export const appRouter = router({
	health: healthRouter,
	users: usersRouter,
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
