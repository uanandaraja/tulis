import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default async function DashboardGroupLayout({
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

	return <DashboardLayout>{children}</DashboardLayout>;
}
