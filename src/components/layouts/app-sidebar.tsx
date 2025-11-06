"use client";

import { PanelLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "@/components/features/dashboard/user-menu";
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
	useSidebar,
} from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc/react";

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { state, toggleSidebar } = useSidebar();
	const { data: chats, isLoading, refetch } = trpc.chat.list.useQuery();
	const deleteChat = trpc.chat.delete.useMutation({
		onSuccess: (_, variables) => {
			refetch();
			if (pathname === `/chat/${variables.chatId}`) {
				router.push("/chat");
			}
		},
	});

	const handleDeleteChat = (chatId: string) => {
		deleteChat.mutate({ chatId });
	};

	return (
		<>
			<Sidebar>
				<SidebarHeader>
					<div className="flex items-center justify-between px-2 py-1">
						<h1 className="text-xl font-semibold">Tulis</h1>
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleSidebar}
							className="h-8 w-8"
						>
							<PanelLeft className="h-4 w-4" />
						</Button>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<div className="px-2 pb-2">
								<Button
									asChild
									variant="outline"
									className="w-full justify-center"
								>
									<Link href="/chat">
										<Plus className="h-4 w-4" />
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
									chats.map((chat: unknown) => {
										const typedChat = chat as Record<string, unknown>;
										return (
											<SidebarMenuItem key={typedChat.id as string}>
												<div className="group/item relative flex items-center">
													<SidebarMenuButton
														asChild
														isActive={pathname === `/chat/${typedChat.id}`}
														className="flex-1 pr-8"
													>
														<Link href={`/chat/${typedChat.id as string}`}>
															<span className="truncate">
																{typedChat.title as string}
															</span>
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
																<AlertDialogTitle>
																	Delete chat?
																</AlertDialogTitle>
																<AlertDialogDescription>
																	This will permanently delete "
																	{typedChat.title as string}" and all its
																	messages. This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() =>
																		handleDeleteChat(typedChat.id as string)
																	}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</SidebarMenuItem>
										);
									})
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
			{state === "collapsed" && (
				<Button
					variant="outline"
					size="icon"
					onClick={toggleSidebar}
					className="fixed top-4 left-4 z-50 h-10 w-10 shadow-md"
				>
					<PanelLeft className="h-4 w-4" />
				</Button>
			)}
		</>
	);
}
