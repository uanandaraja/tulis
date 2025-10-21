"use client";

import { ChevronUp, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";

export function UserMenu() {
	const router = useRouter();
	const { data: user, isLoading } = trpc.users.me.useQuery();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/");
					},
				},
			});
		} finally {
			setIsSigningOut(false);
		}
	};

	if (isLoading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex items-center gap-2 px-2 py-1.5">
						<Spinner className="size-4" />
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (!user) return null;

	const initials =
		user.name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "U";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<Popover>
					<PopoverTrigger asChild>
						<SidebarMenuButton size="lg">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={user.image || undefined}
									alt={user.name || ""}
								/>
								<AvatarFallback className="rounded-lg">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronUp className="ml-auto size-4" />
						</SidebarMenuButton>
					</PopoverTrigger>
					<PopoverContent className="w-56 p-2" align="end" side="top">
						<button
							type="button"
							onClick={handleSignOut}
							disabled={isSigningOut}
							className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
						>
							{isSigningOut ? (
								<>
									<Spinner className="size-4" />
									<span>Signing out...</span>
								</>
							) : (
								<>
									<LogOut className="size-4" />
									<span>Sign out</span>
								</>
							)}
						</button>
					</PopoverContent>
				</Popover>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
