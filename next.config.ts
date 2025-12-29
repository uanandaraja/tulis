import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.nizzy.fyi",
			},
		],
	},
};

export default nextConfig;
