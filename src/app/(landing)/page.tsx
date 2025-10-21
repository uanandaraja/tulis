import { Demo } from "@/components/landing/demo";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground">
			<Header />
			<Hero />
			<Demo />
			<Features />
			<Footer />
		</div>
	);
}
