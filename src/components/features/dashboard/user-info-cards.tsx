"use client";

import { Item, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/react";

export function UserInfoCards() {
	const { data: user, isLoading } = trpc.users.me.useQuery();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (!user) return null;

	const createdDate = user.createdAt
		? new Date(user.createdAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "N/A";

	return (
		<div className="space-y-2">
			<Item variant="outline">
				<ItemTitle>Name</ItemTitle>
				<ItemDescription>{user.name || "N/A"}</ItemDescription>
			</Item>

			<Item variant="outline">
				<ItemTitle>Email</ItemTitle>
				<ItemDescription>{user.email || "N/A"}</ItemDescription>
			</Item>

			<Item variant="outline">
				<ItemTitle>Member Since</ItemTitle>
				<ItemDescription>{createdDate}</ItemDescription>
			</Item>

			<Item variant="outline">
				<ItemTitle>Email Status</ItemTitle>
				<ItemDescription>
					{user.emailVerified ? "Verified" : "Unverified"}
				</ItemDescription>
			</Item>
		</div>
	);
}
