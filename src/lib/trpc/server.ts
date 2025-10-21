import "server-only";

import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

export const serverClient = async () => {
	const context = await createTRPCContext();
	return appRouter.createCaller(context);
};
