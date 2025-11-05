"use client";

import { useForm } from "@tanstack/react-form";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { GoogleIcon } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { useGoogleSignin } from "@/hooks/auth/use-google-signin";
import { useMagicLinkSignin } from "@/hooks/auth/use-magic-link-signin";
import { signInSchema } from "@/lib/validators/auth";

export function SignInForm() {
	const [error, setError] = useState("");
	const searchParams = useSearchParams();
	const emailFromUrl = searchParams.get("email") || "";

	const {
		signIn: magicLinkSignIn,
		loading: magicLinkLoading,
		error: magicLinkError,
		sent: magicLinkSent,
	} = useMagicLinkSignin({ isSignUp: false });

	const {
		signIn: googleSignIn,
		loading: googleLoading,
		error: googleError,
	} = useGoogleSignin();

	const loading = magicLinkLoading || googleLoading;

	const form = useForm({
		defaultValues: {
			email: emailFromUrl,
		},
		onSubmit: async ({ value }) => {
			await magicLinkSignIn(value.email);
			if (magicLinkError) {
				setError(magicLinkError);
			}
		},
	});

	const handleGoogleSignIn = async () => {
		await googleSignIn();
		if (googleError) {
			setError(googleError);
		}
	};

	return (
		<div className="w-full">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
					<p className="text-muted-foreground">
						Sign in to your account to continue
					</p>
				</div>

				{error && (
					<div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm flex items-start">
						<AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{magicLinkSent && (
					<Item className="bg-primary/10">
						<ItemMedia className="text-primary">
							<Mail className="h-5 w-5" />
						</ItemMedia>
						<ItemContent>
							<ItemDescription className="text-primary">
								Check your email! We sent you a magic link to sign in.
							</ItemDescription>
						</ItemContent>
					</Item>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="email"
						validators={{
							onBlur: ({ value }) => {
								const result = signInSchema.shape.email.safeParse(value);
								if (!result.success) {
									return result.error.issues[0]?.message;
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={loading}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<Button
						type="submit"
						className="w-full"
						disabled={loading || !form.state.canSubmit}
					>
						{magicLinkLoading ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
								Sending...
							</>
						) : (
							<>
								<Mail className="h-5 w-5 mr-2" />
								Send magic link
							</>
						)}
					</Button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>

				<Button
					className="w-full flex items-center justify-center gap-2"
					onClick={handleGoogleSignIn}
					disabled={loading}
					variant="outline"
				>
					{googleLoading ? (
						<Loader2 className="h-5 w-5 animate-spin mr-1" />
					) : (
						<GoogleIcon className="h-5 w-5 mr-1" />
					)}
					{googleLoading ? "Signing in..." : "Sign in with Google"}
				</Button>

				<div className="text-center text-sm">
					<span className="text-muted-foreground">Don't have an account? </span>
					<Link
						href="/auth/sign-up"
						className="text-primary hover:underline font-medium"
					>
						Sign up
					</Link>
				</div>

				<p className="text-xs text-muted-foreground">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
}
