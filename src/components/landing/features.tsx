export function Features() {
	const features = [
		{
			title: "ai writing partner",
			description: "researches, plans, then drafts your content automatically",
		},
		{
			title: "smart editing",
			description: "makes intelligent improvements and refinements on its own",
		},
		{
			title: "rich text editor",
			description: "full editor with formatting, tables, and clean interface",
		},
		{
			title: "version tracking",
			description: "every change saved, compare versions, restore anytime",
		},
	];

	return (
		<section className="pt-12 pb-24 px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{features.map((feature) => {
						return (
							<div
								key={feature.title}
								className="group p-6 bg-card border border-border rounded-lg transition-all duration-100 ring-4 ring-inset ring-border/50 outline outline-0 outline-border/50 hover:outline-[3px] hover:border-ring/50"
							>
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
