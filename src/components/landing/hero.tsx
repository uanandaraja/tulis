"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function Hero() {
	const router = useRouter();
	const [isNavigating, setIsNavigating] = useState(false);


	const handleGetStarted = async () => {
		setIsNavigating(true);

		// Check if user is already signed in
		const session = await authClient.getSession();

		if (session?.data?.session) {
			router.push("/chat");
		} else {
			router.push("/auth");
		}
	};

	return (
		<main className="pt-24 pb-12 flex flex-col justify-center px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<div className="space-y-4">
					<div className="space-y-4">
						<h1 className="text-2xl md:text-4xl font-semibold text-foreground max-w-3xl">
							write better, faster
						</h1>

						<p className="text-sm md:text-xl text-muted-foreground max-w-xl">
							research, write, and edit in one flow. less thinking, more writing.
						</p>
					</div>
					<div className="flex flex-row flex-nowrap gap-4 pt-4">
						<Button
							variant="default"
							size="lg"
							onClick={handleGetStarted}
							disabled={isNavigating}
							className="focus-visible:!ring-0 focus-visible:!ring-ring/0 hover:!ring-[3px] hover:!ring-border transition-all duration-100"
						>
							{isNavigating ? (
								<>
									<Spinner className="size-5 mr-2" />
									Loading...
								</>
							) : (
								"start writing"
							)}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
