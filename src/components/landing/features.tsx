export function Features() {
	const features = [
		{
			title: "ai writes",
			description: "research and draft in one flow",
		},
		{
			title: "ai edits",
			description: "refines and improves on its own",
		},
		{
			title: "you edit",
			description: "fine-tune with a proper editor",
		},
		{
			title: "version control",
			description: "track changes and restore anytime",
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
