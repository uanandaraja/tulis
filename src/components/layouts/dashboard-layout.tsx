import { DashboardHeader } from "@/components/features/dashboard/header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<DashboardHeader />
			<main className="mx-auto max-w-5xl">{children}</main>
		</div>
	);
}
