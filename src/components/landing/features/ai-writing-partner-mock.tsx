import { Search, ChevronDown } from "lucide-react";

const mockMessages = [
	{
		id: "1",
		role: "user" as const,
		content: "Write about remote work benefits",
	},
	{
		id: "2",
		role: "assistant" as const,
		content:
			"I'll help you write about remote work benefits. Let me research this topic first to gather the latest insights and data, then create a comprehensive article for you.",
	},
];

const mockWebSearchResults = [
	{
		id: "1",
		title:
			"The Benefits of Remote Work for Companies - Harvard Business Review",
		url: "https://hbr.org/2023/remote-work-benefits",
	},
	{
		id: "2",
		title: "How Remote Work Increases Productivity - Stanford Study",
		url: "https://stanford.edu/news/remote-work-productivity",
	},
];

export function AIWritingPartnerMock() {
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

								{/* Web Search Mock */}
								<div className="mt-3">
									<div className="flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground">
										<Search className="size-4" />
										<p className="text-sm">Searching the web</p>
										<ChevronDown className="size-4" />
									</div>
									<div className="mt-4 space-y-2 border-muted border-l-2 pl-4">
										{mockWebSearchResults.map((result) => {
											const url = new URL(result.url);
											const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
											return (
												<div
													key={result.id}
													className="text-muted-foreground text-sm"
												>
													<div className="flex items-start gap-2">
														<img
															src={faviconUrl}
															alt=""
															className="w-4 h-4 mt-0.5 flex-shrink-0"
														/>
														<div className="flex flex-col gap-0.5 min-w-0 flex-1">
															<div className="text-foreground hover:underline font-medium text-sm truncate block">
																{result.title}
															</div>
															<div className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[200px]">
																{result.url}
															</div>
														</div>
													</div>
												</div>
											);
										})}
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
