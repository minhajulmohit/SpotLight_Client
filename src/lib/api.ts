import { authClient } from "@/lib/auth-client";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let syncedEmail: string | null = null;
let syncPromise: Promise<void> | null = null;

/**
 * Exchanges the current Better Auth session for the HTTPOnly JWT cookie that
 * the Express API expects on every protected mutation.
 */
export const ensureJwt = async () => {
  if (typeof window === "undefined") return;

  let session: Awaited<ReturnType<typeof authClient.getSession>>["data"];

  try {
    const result = await authClient.getSession();
    session = result?.data;
  } catch {
    return;
  }

  const email = session?.user?.email;
  if (!email || email === syncedEmail) return;

  if (!syncPromise) {
    syncPromise = fetch(`${API_BASE}/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        name: session?.user?.name ?? "",
      }),
    })
      .then((response) => {
        if (response.ok) syncedEmail = email;
      })
      .catch(() => {
        // The mutation itself will surface a 401 message if this fails.
      })
      .finally(() => {
        syncPromise = null;
      });
  }

  await syncPromise;
};

export const logoutJwt = async () => {
  syncedEmail = null;
  try {
    await fetch(`${API_BASE}/jwt/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Logging out of Better Auth already removed the app session.
  }
};
