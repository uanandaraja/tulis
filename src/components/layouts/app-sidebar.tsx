"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "@/components/features/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
	const router = useRouter();
	const { data: chats, isLoading, refetch } = trpc.chat.list.useQuery();
	const deleteChat = trpc.chat.delete.useMutation({
		onSuccess: () => {
			refetch();
			// Redirect to chat list if currently viewing deleted chat
			if (pathname.startsWith("/chat/") && pathname !== "/chat") {
				router.push("/chat");
			}
		},
	});

	const handleDeleteChat = (chatId: string) => {
		deleteChat.mutate({ chatId });
	};

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="px-2 py-1">
					<h1 className="text-xl font-semibold">Tulis</h1>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<div className="px-2 pb-2">
							<Button
								asChild
								variant="outline"
								className="w-full justify-start"
							>
								<Link href="/chat">
									<Plus className="h-4 w-4 mr-2" />
									New Chat
								</Link>
							</Button>
						</div>
						<SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
						<SidebarMenu>
							{isLoading ? (
								<div className="px-2 py-1 text-sm text-muted-foreground">
									Loading...
								</div>
							) : chats && chats.length > 0 ? (
								chats.map((chat) => (
									<SidebarMenuItem key={chat.id}>
										<div className="group/item relative flex items-center">
											<SidebarMenuButton
												asChild
												isActive={pathname === `/chat/${chat.id}`}
												className="flex-1 pr-8"
											>
												<Link href={`/chat/${chat.id}`}>
													<span className="truncate">{chat.title}</span>
												</Link>
											</SidebarMenuButton>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="absolute right-1 h-6 w-6 opacity-0 group-hover/item:opacity-60 hover:!opacity-100 transition-opacity"
													>
														<Trash2 className="h-3 w-3" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete chat?</AlertDialogTitle>
														<AlertDialogDescription>
															This will permanently delete "{chat.title}" and
															all its messages. This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteChat(chat.id)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
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
