"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitHubIcon } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export function Hero() {
	const router = useRouter();
	const [isNavigating, setIsNavigating] = useState(false);

	const logos = [
		{
			name: "Next.js",
			src: "/logos/nextjs_icon_dark.svg",
			width: 200,
			height: 80,
		},
		{
			name: "tRPC",
			src: "/logos/trpc.svg",
			width: 200,
			height: 80,
		},
		{
			name: "Drizzle ORM",
			src: "/logos/drizzle-orm_light.svg",
			width: 200,
			height: 80,
		},
		{
			name: "PostgreSQL",
			src: "/logos/postgresql.svg",
			width: 200,
			height: 80,
		},
		{
			name: "Better Auth",
			src: "/logos/better-auth_light.svg",
			width: 200,
			height: 80,
		},
		{
			name: "Bun",
			src: "/logos/bun.svg",
			width: 200,
			height: 80,
		},
	];

	const handleGetStarted = async () => {
		setIsNavigating(true);

		// Check if user is already signed in
		const session = await authClient.getSession();

		if (session?.data?.session) {
			router.push("/dashboard");
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
							Stop configuring. Start building.
						</h1>

						<p className="text-sm md:text-xl text-muted-foreground max-w-xl">
							Full-stack Next.js starter. Actually ready to use.
						</p>

						<TooltipProvider>
							<div className="flex gap-3 items-center pt-4">
								{logos.map((logo) => (
									<Tooltip key={logo.name}>
										<TooltipTrigger asChild>
											<Image
												src={logo.src}
												alt={`${logo.name} logo`}
												width={logo.width}
												height={logo.height}
												className="h-6 w-auto object-contain cursor-pointer"
											/>
										</TooltipTrigger>
										<TooltipContent>
											<p>{logo.name}</p>
										</TooltipContent>
									</Tooltip>
								))}
							</div>
						</TooltipProvider>
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
								"Get started now"
							)}
						</Button>

						<Button
							variant="outline"
							size="lg"
							asChild
							className="hover:ring-[3px] hover:ring-border/50 hover:!bg-background transition-all duration-100"
						>
							<a
								href="https://github.com/uanandaraja/next-starterpack"
								target="_blank"
								rel="noopener noreferrer"
							>
								<GitHubIcon className="mr-2" />
								Github Repo
							</a>
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
