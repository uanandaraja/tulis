import Image from "next/image";

export function AuthImage() {
	return (
		<div className="hidden lg:block relative bg-muted">
			<Image
				src="https://storage.nizzy.xyz/josephine_and_mercie.jpg"
				alt="Authentication"
				fill
				className="object-cover"
				priority
			/>
			<div className="absolute bottom-0 right-0 p-4 text-white/90 text-sm text-right">
				<div className="font-medium">Josephine and Mercie (1908)</div>
				<div>Edmund Tarbell</div>
			</div>
		</div>
	);
}
