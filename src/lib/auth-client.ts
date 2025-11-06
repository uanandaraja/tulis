import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { config } from "./config";

export const authClient = createAuthClient({
	baseURL: config.auth.publicUrl,
	plugins: [magicLinkClient()],
});
