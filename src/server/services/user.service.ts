import { db } from "@/lib/db";

export async function findUserByEmail(email: string) {
	return db.query.user.findFirst({
		where: (user, { eq }) => eq(user.email, email),
	});
}

export async function userExists(email: string): Promise<boolean> {
	const user = await findUserByEmail(email);
	return !!user;
}
