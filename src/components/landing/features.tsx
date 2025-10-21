import { Database, Lock, Palette, Zap } from "lucide-react";

export function Features() {
	const features = [
		{
			icon: Lock,
			title: "Authentication Ready",
			description:
				"Google OAuth and passwordless magic links. Session management and protected routes included.",
		},
		{
			icon: Zap,
			title: "Type-Safe APIs",
			description:
				"tRPC for end-to-end type safety. No code generation, no API contracts. Just write functions and call them from the client.",
		},
		{
			icon: Database,
			title: "Database Included",
			description:
				"Drizzle ORM with PostgreSQL. Migrations, schema management, and connection pooling already set up.",
		},
		{
			icon: Palette,
			title: "Beautiful UI Components",
			description:
				"shadcn/ui components with Tailwind CSS. Accessible, customizable, and ready to use.",
		},
	];

	return (
		<section className="pt-12 pb-24 px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<h2 className="text-2xl font-semibold mb-12 text-foreground">
					What's included
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="group p-6 bg-card border border-border rounded-lg transition-all duration-100 ring-4 ring-inset ring-border/50 outline outline-0 outline-border/50 hover:outline-[3px] hover:border-ring/50"
							>
								<div className="p-2 rounded-md bg-primary/10 text-primary w-fit mb-4">
									<Icon className="w-5 h-5" />
								</div>
								<h3 className="text-lg font-semibold mb-2 text-foreground">
									{feature.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
