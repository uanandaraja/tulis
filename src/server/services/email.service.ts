import { MagicLinkEmail } from "@/emails/magic-link-email";
import { sendEmail } from "@/lib/email";

export async function sendMagicLinkEmail(
	email: string,
	url: string,
	isNewUser: boolean,
): Promise<void> {
	const subject = isNewUser
		? "Welcome! Complete your sign up"
		: "Sign in to Nizzy's Starter Kit";

	await sendEmail({
		to: email,
		subject,
		react: MagicLinkEmail({ magicLink: url, isNewUser }),
	});
}
