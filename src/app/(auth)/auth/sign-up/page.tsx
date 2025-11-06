import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthImage } from "@/components/features/auth/auth-image";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "sign up",
};

export default async function SignUpPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/chat");
	}

	return (
		<div className="min-h-screen relative">
			<div className="absolute inset-0">
				<AuthImage />
			</div>
			<div className="relative min-h-screen flex items-center justify-center p-8">
				<div className="w-full max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-8">
					<SignUpForm />
				</div>
			</div>
		</div>
	);
}
