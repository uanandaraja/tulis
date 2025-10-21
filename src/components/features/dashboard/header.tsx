import { UserMenu } from "./user-menu";

export function DashboardHeader() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-semibold">Nizzy</h1>
				</div>
				<UserMenu />
			</div>
		</header>
	);
}
