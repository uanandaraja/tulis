import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="w-full flex justify-center px-8 md:px-16 py-6">
			<div className="w-full max-w-5xl flex justify-between items-center">
				<div className="flex items-center gap-2">
					<span className="text-foreground font-semibold">tulis</span>
				</div>

				<Button
					variant="outline"
					asChild
					className="hover:ring-[3px] hover:ring-border/50 hover:!bg-background transition-all duration-100"
				>
					<Link href="/auth">Get in</Link>
				</Button>
			</div>
		</header>
	);
}
