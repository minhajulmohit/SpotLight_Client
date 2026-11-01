"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { ensureJwt } from "@/lib/api";

/**
 * Keeps the Express HTTPOnly JWT cookie in sync with the Better Auth session,
 * including after a Google OAuth redirect or a full page reload.
 */
const AuthTokenSync = () => {
  const { data: session } = authClient.useSession();
  const email = session?.user?.email;

  useEffect(() => {
    if (email) void ensureJwt();
  }, [email]);

  return null;
};

export default AuthTokenSync;
