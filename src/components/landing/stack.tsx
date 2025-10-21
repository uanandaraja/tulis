import Image from "next/image";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function Stack() {
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

	return (
		<section className="py-24 px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<h2 className="text-xl font-semibold mb-12 text-foreground">
					Built on top of these technologies
				</h2>
				<TooltipProvider>
					<div className="grid grid-cols-6 gap-1 items-center">
						{logos.map((logo) => (
							<div key={logo.name} className="flex items-center">
								<Tooltip>
									<TooltipTrigger asChild>
										<Image
											src={logo.src}
											alt={`${logo.name} logo`}
											width={logo.width}
											height={logo.height}
											className="h-6 sm:h-8 md:h-12 w-auto object-contain cursor-pointer"
										/>
									</TooltipTrigger>
									<TooltipContent>
										<p>{logo.name}</p>
									</TooltipContent>
								</Tooltip>
							</div>
						))}
					</div>
				</TooltipProvider>
			</div>
		</section>
	);
}
