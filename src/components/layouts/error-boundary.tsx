"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-4">
					<div className="max-w-md space-y-4 text-center">
						<h2 className="text-2xl font-semibold">Something went wrong</h2>
						<p className="text-sm text-muted-foreground">
							{this.state.error?.message || "An unexpected error occurred"}
						</p>
						<Button onClick={() => this.setState({ hasError: false })}>
							Try again
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
