import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
	"your vibe writing place - let AI help you research, write, and edit all in one place";
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
					alt="your vibe writing place - let AI help you research, write, and edit all in one place"
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
			</div>,
			{
				...size,
			},
		);
	} catch (error) {
		console.error("Error loading opengraph image:", error);
		// Fallback to a simple text-based image that matches hero styling
		return new ImageResponse(
			<div
				style={{
					background: "oklch(0.98 0.005 95)",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					color: "oklch(0.25 0.015 265)",
					padding: "40px",
					textAlign: "center",
				}}
			>
				<div
					style={{
						fontSize: 72,
						fontWeight: 600,
						marginBottom: "20px",
						lineHeight: 1.2,
					}}
				>
					your vibe writing place
				</div>
				<div
					style={{
						fontSize: 32,
						fontWeight: 400,
						color: "oklch(0.5 0.02 265)",
						maxWidth: "800px",
						lineHeight: 1.4,
					}}
				>
					let AI help you research, write, and edit all in one place
				</div>
			</div>,
			{
				...size,
			},
		);
	}
}
