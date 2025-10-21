export function Demo() {
	return (
		<section className="py-12 px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<div className="relative w-full aspect-video rounded-lg border border-border bg-card overflow-hidden ring-4 ring-inset ring-border/50">
					{/* Placeholder content */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center space-y-4">
							<div className="text-6xl">🎥</div>
							<p className="text-muted-foreground text-sm">
								Demo video or screenshot goes here
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
