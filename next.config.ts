import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.nizzy.xyz",
			},
		],
	},
};

export default nextConfig;
