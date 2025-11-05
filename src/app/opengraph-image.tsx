import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "tulis - vibe writing";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	try {
		const imageData = await readFile(
			join(process.cwd(), "public/opengraph-image.png"),
		);
		const imageSrc = Uint8Array.from(imageData).buffer;

		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
				}}
			>
				<img
					src={imageSrc as unknown as string}
					alt="tulis - vibe writing"
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
			</div>,
			{
				...size,
			},
		);
	} catch (error) {
		console.error("Error loading opengraph image:", error);
		// Fallback to a simple text-based image
		return new ImageResponse(
			<div
				style={{
					fontSize: 64,
					background: "black",
					color: "white",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: "bold",
				}}
			>
				tulis - vibe writing
			</div>,
			{
				...size,
			},
		);
	}
}
