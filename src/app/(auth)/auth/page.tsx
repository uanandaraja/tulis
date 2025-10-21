import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/features/auth/sign-in-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Sign In",
};

export default async function SignInPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			{/* Left: Sign In Form */}
			<div className="flex items-center justify-center p-8">
				<div className="w-full max-w-sm">
					<SignInForm />
				</div>
			</div>

			{/* Right: Image Placeholder */}
			<div className="hidden lg:block relative bg-muted">
				<Image
					src="/placeholder.svg"
					alt="Authentication"
					fill
					className="object-cover"
					priority
				/>
			</div>
		</div>
	);
}
