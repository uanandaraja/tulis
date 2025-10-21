import { sendMagicLinkEmail } from "./email.service";
import { userExists } from "./user.service";

export async function handleMagicLinkRequest(
	email: string,
	url: string,
): Promise<void> {
	const isNewUser = !(await userExists(email));
	await sendMagicLinkEmail(email, url, isNewUser);
}

export function getGoogleOAuthConfig() {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error(
			"Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
		);
	}

	return {
		clientId,
		clientSecret,
	};
}
