import { publicProcedure, router } from "../trpc";

export const healthRouter = router({
	check: publicProcedure.query(() => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			version: process.env.npm_package_version || "1.0.0",
		};
	}),
});
