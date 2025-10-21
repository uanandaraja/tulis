import { UserInfoCards } from "@/components/features/dashboard/user-info-cards";

export default function DashboardPage() {
	return (
		<div className="px-4 py-8">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground mt-2">
						Welcome to your dashboard. This is a protected route.
					</p>
				</div>
				<UserInfoCards />
			</div>
		</div>
	);
}
