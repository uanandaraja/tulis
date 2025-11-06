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
		</div>
	);
}
