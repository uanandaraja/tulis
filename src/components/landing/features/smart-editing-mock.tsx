const mockMessages = [
	{
		id: "1",
		role: "user" as const,
		content:
			"Can you improve the introduction in my article? Make it more engaging.",
	},
	{
		id: "2",
		role: "assistant" as const,
		content:
			"I'll help you improve the introduction to make it more engaging. Let me enhance the opening to better capture your readers' attention.",
	},
];

export function SmartEditingMock() {
	return (
		<div className="space-y-3 h-64 overflow-y-auto">
			{mockMessages.map((message) => (
				<div key={message.id}>
					{message.role === "user" ? (
						<div className="flex justify-end">
							<div className="rounded-lg p-2 text-sm text-foreground bg-secondary max-w-xs">
								{message.content}
							</div>
						</div>
					) : (
						<div className="flex justify-start">
							<div className="space-y-3 w-full">
								<div className="rounded-lg p-2 text-sm text-foreground">
									{message.content}
								</div>

								{/* Editor Artifact Mock */}
								<div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/50">
									<div className="p-3">
										<div className="flex flex-col">
											<span className="text-sm font-medium text-foreground">
												Remote Work Article
											</span>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>Written to editor</span>
												<span>•</span>
												<span className="bg-muted px-1.5 py-0.5 rounded font-medium">
													v2
												</span>
												<span>•</span>
												<span className="font-mono bg-muted px-1.5 py-0.5 rounded">
													doc_abc123
												</span>
											</div>
										</div>
										<div className="mt-3 flex justify-start">
											<button
												type="button"
												className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
											>
												Show Version 2
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
