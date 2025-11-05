import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

interface UseMagicLinkSigninOptions {
	isSignUp?: boolean;
}

export function useMagicLinkSignin(options: UseMagicLinkSigninOptions = {}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [sent, setSent] = useState(false);
	const router = useRouter();

	const signIn = async (email: string, name?: string) => {
		setLoading(true);
		setError("");
		setSent(false);

		try {
			// Check if user exists
			const { exists } = await trpc.auth.checkUserExists.query({ email });

			// Redirect if user state doesn't match expected flow
			if (options.isSignUp && exists) {
				router.push(`/auth?email=${encodeURIComponent(email)}`);
				return;
			}

			if (!options.isSignUp && !exists) {
				router.push(`/auth/sign-up?email=${encodeURIComponent(email)}`);
				return;
			}

			// Send magic link
			const { error: authError } = await authClient.signIn.magicLink({
				email,
				name,
				callbackURL: "/chat",
			});

			if (authError) {
				setError(authError.message || "Failed to send magic link");
			} else {
				setSent(true);
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return { signIn, loading, error, sent };
}
