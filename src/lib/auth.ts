import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import {
	getGoogleOAuthConfig,
	handleMagicLinkRequest,
} from "@/server/services/auth.service";
import { config } from "./config";
import { db } from "./db";
import { schema } from "./db/schema";

export const auth = betterAuth({
	baseURL: config.auth.url,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	socialProviders: {
		...(getGoogleOAuthConfig() && { google: getGoogleOAuthConfig() }),
	},
	plugins: [
		magicLink({
			sendMagicLink: ({ email, url }) => handleMagicLinkRequest(email, url),
			expiresIn: 300,
		}),
		nextCookies(),
	],
});
