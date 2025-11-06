import { defineConfig } from "drizzle-kit";
import { config } from "./src/lib/config";

export default defineConfig({
	schema: "./src/lib/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: config.database.url,
	},
});
