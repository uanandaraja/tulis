import type {
	AIConfig,
	AppConfig,
	AuthConfig,
	DatabaseConfig,
	EmailConfig,
	ExaConfig,
	FirecrawlConfig,
	StorageConfig,
} from "./types";

let cachedConfig: AppConfig | null = null;

function createConfig(): AppConfig {
	// Return cached config if already created
	if (cachedConfig) {
		return cachedConfig;
	}

	// Skip validation during Next.js build time
	if (process.env.NEXT_PHASE === "phase-production-build") {
		// Return dummy config for build time
		cachedConfig = {
			database: { url: "" },
			auth: { secret: "" },
		} as AppConfig;
		return cachedConfig;
	}

	// If we're in browser/client context, return dummy config
	// This shouldn't happen with proper "use server" directives, but it's a safety net
	if (typeof window !== "undefined") {
		return {
			database: { url: "" },
			auth: { secret: "" },
		} as AppConfig;
	}

	// Validate required environment variables only on server at runtime
	const requiredVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
	const missing = requiredVars.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}

	// Build configuration object
	const config: AppConfig = {
		database: {
			url: process.env.DATABASE_URL!,
		},
		auth: {
			secret: process.env.BETTER_AUTH_SECRET!,
			...(process.env.BETTER_AUTH_URL && { url: process.env.BETTER_AUTH_URL }),
			...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL && {
				publicUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
			}),
		},
	};

	// Optional: Google OAuth
	if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
		config.auth.google = {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		};
	}

	// Optional: Email service
	if (process.env.RESEND_API_KEY) {
		config.email = {
			apiKey: process.env.RESEND_API_KEY,
		};
	}

	// Optional: AI service
	if (process.env.OPENROUTER_API_KEY) {
		config.ai = {
			apiKey: process.env.OPENROUTER_API_KEY,
			...(process.env.NEXT_PUBLIC_OPENROUTER_MODEL && {
				model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
			}),
		};
	}

	// Optional: Exa search
	if (process.env.EXA_API_KEY) {
		config.exa = {
			apiKey: process.env.EXA_API_KEY,
		};
	}

	// Optional: Firecrawl
	if (process.env.FIRECRAWL_API_KEY) {
		config.firecrawl = {
			apiKey: process.env.FIRECRAWL_API_KEY,
		};
	}

	// Optional: Storage
	if (
		process.env.S3_ACCESS_KEY_ID &&
		process.env.S3_SECRET_ACCESS_KEY &&
		process.env.S3_BUCKET
	) {
		config.storage = {
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
			bucket: process.env.S3_BUCKET,
			region: process.env.S3_REGION || "auto",
		};
	}

	cachedConfig = config;
	return config;
}

export const config = createConfig();
export type {
	AppConfig,
	DatabaseConfig,
	AuthConfig,
	EmailConfig,
	AIConfig,
	ExaConfig,
	FirecrawlConfig,
	StorageConfig,
};
