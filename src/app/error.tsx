"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Root error:", error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="max-w-md space-y-4 text-center">
				<h2 className="text-2xl font-semibold">Something went wrong</h2>
				<p className="text-sm text-muted-foreground">
					{error.message || "An unexpected error occurred"}
				</p>
				<Button onClick={reset}>Try again</Button>
			</div>
		</div>
	);
}
