import { Resend } from "resend";
import { config } from "./config";

interface SendEmailOptions {
	to: string;
	subject: string;
	react: React.ReactElement;
}

function getResendClient() {
	if (!config.email) {
		throw new Error(
			"Email service is not configured. Please set RESEND_API_KEY environment variable.",
		);
	}
	return new Resend(config.email!.apiKey);
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
	const resend = getResendClient();

	try {
		const { data, error } = await resend.emails.send({
			from: "no-reply@nizzy.xyz",
			to,
			subject,
			react,
		});

		if (error) {
			console.error("Failed to send email:", error);
			throw new Error(`Email sending failed: ${error.message}`);
		}

		return data;
	} catch (error) {
		console.error("Email service error:", error);
		throw error;
	}
}
