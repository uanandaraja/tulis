import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useGoogleSignin() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const signIn = async () => {
		setLoading(true);
		setError("");

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/chat",
			});
		} catch {
			setError("An unexpected error occurred");
			setLoading(false);
		}
	};

	return { signIn, loading, error };
}

