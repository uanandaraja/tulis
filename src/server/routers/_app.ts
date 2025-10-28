import { router } from "../trpc";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { documentRouter } from "./document";
import { healthRouter } from "./health";
import { planRouter } from "./plan";
import { usersRouter } from "./users";

export const appRouter = router({
	auth: authRouter,
	chat: chatRouter,
	document: documentRouter,
	health: healthRouter,
	plan: planRouter,
	users: usersRouter,
});

export type AppRouter = typeof appRouter;
