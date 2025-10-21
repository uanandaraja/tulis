"use client";

import { TRPCProvider } from "@/lib/trpc/react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return <TRPCProvider>{children}</TRPCProvider>;
}
