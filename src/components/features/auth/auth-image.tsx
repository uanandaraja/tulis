import Image from "next/image";

export function AuthImage() {
	return (
		<div className="relative w-full h-full overflow-hidden">
			<div className="absolute inset-0">
				<Image
					src="https://storage.nizzy.xyz/josephine_and_mercie.jpg"
					alt="Authentication"
					fill
					className="object-cover blur-xs"
					priority
					style={{ transform: "scale(1.05)" }}
				/>
			</div>
			<div className="absolute bottom-0 right-0 p-4 text-white/90 text-sm text-right z-10">
				<div className="font-medium">Josephine and Mercie (1908)</div>
				<div>Edmund Tarbell</div>
			</div>
		</div>
	);
}
