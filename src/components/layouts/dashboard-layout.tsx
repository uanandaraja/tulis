import { SidebarInset } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarInset>
			<main className="flex-1">{children}</main>
		</SidebarInset>
	);
}
