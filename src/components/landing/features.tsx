import { AIWritingPartnerMock } from "./features/ai-writing-partner-mock";
import { SmartEditingMock } from "./features/smart-editing-mock";
import { RichTextEditorMock } from "./features/rich-text-editor-mock";

export function Features() {
	const features = [
		{
			title: "ai writing partner",
			description: "researches, plans, then drafts your content automatically",
			mockup: <AIWritingPartnerMock />,
		},
		{
			title: "smart editing",
			description: "makes intelligent improvements and refinements on its own",
			mockup: <SmartEditingMock />,
		},
		{
			title: "rich text editor",
			description: "full editor with formatting, tables, and clean interface",
			mockup: <RichTextEditorMock />,
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
								className="group p-6 bg-muted rounded-lg transition-all duration-100 hover:!ring-[3px] hover:!ring-border"
							>
								<h3 className="text-lg font-semibold mb-2 text-foreground">
									{feature.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed mb-4">
									{feature.description}
								</p>
								{feature.mockup && (
									<div className="mt-4 p-4 bg-background rounded-lg border border-border">
										{feature.mockup}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
