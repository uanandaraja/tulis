"use client";

import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import { useState } from "react";

export function RichTextEditorMock() {
	const [showBubbleMenu, setShowBubbleMenu] = useState(false);
	const [bubbleMenuPosition, setBubbleMenuPosition] = useState({
		top: 0,
		left: 0,
	});

	const handleTextSelection = () => {
		const selection = window.getSelection();
		if (selection && selection.toString().trim().length > 0) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			setBubbleMenuPosition({
				top: rect.top - 50, // Position above selection
				left: rect.left + rect.width / 2 - 100, // Center horizontally
			});
			setShowBubbleMenu(true);
		} else {
			setShowBubbleMenu(false);
		}
	};

	const handleMouseUp = () => {
		setTimeout(handleTextSelection, 10); // Small delay to ensure selection is updated
	};

	return (
		<div
			role="application"
			className="relative h-64 w-full overflow-hidden bg-background border border-border rounded-lg"
			onMouseUp={handleMouseUp}
		>
			{/* Editor Content Area */}
			<div className="h-full w-full overflow-y-auto px-4 py-3">
				<div className="max-w-none prose prose-sm dark:prose-invert">
					<h1 className="text-xl font-semibold mb-3">
						Remote Work: The Future of Business
					</h1>
					<p className="mb-3">
						The landscape of work has undergone a{" "}
						<strong>dramatic transformation</strong> in recent years. What was
						once considered a perk has now become a <em>strategic advantage</em>{" "}
						for forward-thinking companies.
					</p>
					<p className="mb-3">
						Remote work isn't just about flexibility—it's about reimagining how
						businesses operate in digital age. Companies that embrace
						distributed teams are seeing remarkable improvements in
						productivity, employee satisfaction, and operational efficiency.
					</p>
					<h2 className="text-lg font-medium mb-2">Key Benefits</h2>
					<ul className="list-disc pl-6 mb-3">
						<li>Increased productivity and focus</li>
						<li>Access to global talent pool</li>
						<li>Significant cost savings</li>
						<li>Improved employee retention</li>
					</ul>
					<p>
						To learn more about implementing remote work strategies, check out
						our{" "}
						<a href="/guide" className="text-primary underline">
							comprehensive guide
						</a>
						.
					</p>
				</div>
			</div>

			{/* Bubble Menu */}
			{showBubbleMenu && (
				<div
					className="fixed z-50"
					style={{
						top: `${bubbleMenuPosition.top}px`,
						left: `${bubbleMenuPosition.left}px`,
					}}
				>
					<div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg">
						<button
							type="button"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
						>
							<Bold className="h-4 w-4" />
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
						>
							<Italic className="h-4 w-4" />
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
						>
							<Strikethrough className="h-4 w-4" />
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
						>
							<Code className="h-4 w-4" />
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
						>
							<Link2 className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* Word Count */}
			<div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground">
				47 words
			</div>
		</div>
	);
}
