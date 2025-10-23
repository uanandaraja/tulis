"use client";

import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/features/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc/react";

export function AppSidebar() {
	const pathname = usePathname();
	const { data: chats, isLoading } = trpc.chat.list.useQuery();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center justify-between px-2 py-1">
					<h1 className="text-xl font-semibold">Tulis</h1>
					<Button asChild size="icon" variant="ghost" className="h-8 w-8">
						<Link href="/chat">
							<Plus className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{isLoading ? (
								<div className="px-2 py-1 text-sm text-muted-foreground">
									Loading...
								</div>
							) : chats && chats.length > 0 ? (
								chats.map((chat) => (
									<SidebarMenuItem key={chat.id}>
										<SidebarMenuButton
											asChild
											isActive={pathname === `/chat/${chat.id}`}
										>
											<Link href={`/chat/${chat.id}`}>
												<MessageSquare className="h-4 w-4" />
												<span className="truncate">{chat.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))
							) : (
								<div className="px-2 py-1 text-sm text-muted-foreground">
									No chats yet
								</div>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
