import { sendMagicLinkEmail } from "./email.service";
import { userExists } from "./user.service";

export async function handleMagicLinkRequest(
	email: string,
	url: string,
): Promise<void> {
	const isNewUser = !(await userExists(email));
	await sendMagicLinkEmail(email, url, isNewUser);
}

import { config } from "@/lib/config";

export function getGoogleOAuthConfig() {
	return config.auth.google;
}
