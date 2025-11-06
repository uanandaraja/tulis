import { Provider } from "@ai-sdk-tools/store";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "chat",
};

export default async function ChatGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth");
	}

	return (
		<Provider>
			<SidebarProvider>
				<AppSidebar />
				<DashboardLayout>{children}</DashboardLayout>
			</SidebarProvider>
		</Provider>
	);
}
