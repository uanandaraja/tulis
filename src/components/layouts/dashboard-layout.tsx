import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarInset>
			<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
				<SidebarTrigger />
			</header>
			<main className="flex-1 p-4">{children}</main>
		</SidebarInset>
	);
}
