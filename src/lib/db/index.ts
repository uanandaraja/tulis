import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config";
import * as schema from "./schema";

const client = postgres(config.database.url, {
	prepare: false,
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	transform: postgres.camel,
});

export const db = drizzle(client, { schema });
