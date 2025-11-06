export interface DatabaseConfig {
	url: string;
}

export interface AuthConfig {
	secret: string;
	url?: string;
	publicUrl?: string;
	google?: {
		clientId: string;
		clientSecret: string;
	};
}

export interface EmailConfig {
	apiKey: string;
}

export interface AIConfig {
	apiKey: string;
	model?: string;
}

export interface ExaConfig {
	apiKey: string;
}

export interface FirecrawlConfig {
	apiKey: string;
}

export interface StorageConfig {
	accessKeyId: string;
	secretAccessKey: string;
	endpoint?: string;
	bucket: string;
	region: string;
}

export interface AppConfig {
	database: DatabaseConfig;
	auth: AuthConfig;
	email?: EmailConfig;
	ai?: AIConfig;
	exa?: ExaConfig;
	firecrawl?: FirecrawlConfig;
	storage?: StorageConfig;
}
