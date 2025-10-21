"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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
		return <Spinner className="size-5" />;
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
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar className="h-10 w-10">
						<AvatarImage src={user.image || undefined} alt={user.name || ""} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64" align="end">
				<div className="flex flex-col space-y-4">
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={user.image || undefined}
								alt={user.name || ""}
							/>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col space-y-1 flex-1 min-w-0">
							<p className="text-sm font-medium leading-none truncate">
								{user.name}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</div>
					<Separator />
					<Button
						variant="outline"
						className="w-full"
						onClick={handleSignOut}
						disabled={isSigningOut}
					>
						{isSigningOut ? (
							<>
								<Spinner className="size-4 mr-2" />
								Signing out...
							</>
						) : (
							"Sign out"
						)}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
