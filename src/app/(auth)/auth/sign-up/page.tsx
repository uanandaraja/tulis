import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthImage } from "@/components/features/auth/auth-image";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Sign Up",
};

export default async function SignUpPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/chat");
	}

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			<div className="flex items-center justify-center p-8">
				<div className="w-full max-w-sm">
					<SignUpForm />
				</div>
			</div>

			<AuthImage />
		</div>
	);
}
