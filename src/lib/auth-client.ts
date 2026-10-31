import { createAuthClient } from "better-auth/react";

// Better Auth is served from this app's own /api/auth route, so the client
// defaults to the current origin. No public URL or secret is required here.
export const authClient = createAuthClient();
