import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";
import { auth } from "@/lib/auth";

export const createTRPCContext = async () => {
	const start = performance.now();
	const headersList = await headers();

	const cookieHeader = headersList.get("cookie");
	const hasSessionData = cookieHeader?.includes("better-auth.session_data");
	console.log(`[tRPC] Has session_data cookie: ${hasSessionData}`);

	const session = await auth.api.getSession({
		headers: headersList,
	});
	console.log(
		`[tRPC] Session lookup took ${(performance.now() - start).toFixed(0)}ms`,
	);

	return {
		session,
		user: session?.user ?? null,
	};
};

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			session: ctx.session,
			user: ctx.user,
		},
	});
});
