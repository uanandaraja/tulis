import { router } from "../trpc";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { healthRouter } from "./health";
import { usersRouter } from "./users";

export const appRouter = router({
	health: healthRouter,
	users: usersRouter,
	auth: authRouter,
	chat: chatRouter,
});

export type AppRouter = typeof appRouter;
