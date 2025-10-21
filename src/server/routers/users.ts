import { protectedProcedure, router } from "../trpc";

export const usersRouter = router({
	me: protectedProcedure.query(({ ctx }) => {
		// Session already contains user data from Better Auth
		// No need to query the database again
		return {
			id: ctx.user.id,
			name: ctx.user.name,
			email: ctx.user.email,
			emailVerified: ctx.user.emailVerified,
			image: ctx.user.image,
			createdAt: ctx.user.createdAt,
			updatedAt: ctx.user.updatedAt,
		};
	}),
});
