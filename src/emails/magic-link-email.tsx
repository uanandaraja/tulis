interface MagicLinkEmailProps {
	magicLink: string;
	isNewUser?: boolean;
}

export function MagicLinkEmail({
	magicLink,
	isNewUser = false,
}: MagicLinkEmailProps) {
	const title = isNewUser
		? "Welcome! Complete your sign up"
		: "Sign in to your account";
	const description = isNewUser
		? "Click the link below to complete your account creation:"
		: "Click the link below to sign in to your account:";

	return (
		<div>
			<h1>{title}</h1>
			<p>{description}</p>
			<p>
				<a href={magicLink}>{magicLink}</a>
			</p>
			<p>This link will expire in 5 minutes.</p>
			<p>If you didn't request this email, you can safely ignore it.</p>
		</div>
	);
}
