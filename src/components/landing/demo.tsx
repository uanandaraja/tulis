import Image from "next/image";

export function Demo() {
	return (
		<section className="py-12 px-8 md:px-16">
			<div className="w-full max-w-5xl mx-auto">
				<div className="relative w-full aspect-video rounded-lg border border-border bg-card overflow-hidden ring-4 ring-inset ring-border/50">
					<Image
						src="https://storage.nizzy.xyz/tulis/tulis-demo.webp"
						alt="Tulis demo"
						fill
						className="object-cover"
						priority
					/>
				</div>
			</div>
		</section>
	);
}
