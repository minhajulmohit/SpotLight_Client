const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const tokenResponse = await fetch("/api/auth/token", {
    credentials: "same-origin",
    cache: "no-store",
  });

  let token: string | undefined;
  if (tokenResponse.ok) {
    const data = (await tokenResponse.json()) as { token?: unknown };
    if (typeof data.token !== "string" || !data.token) {
      throw new Error("The session service did not return an API token.");
    }
    token = data.token;
  } else if (tokenResponse.status !== 401) {
    throw new Error(
      `Could not verify the current session (status ${tokenResponse.status}).`,
    );
  }

  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const target = new URL(path.replace(/^\/+/, ""), `${BACKEND_URL}/`);
  return fetch(target, {
    ...init,
    headers,
    credentials: "omit",
    cache: "no-store",
  });
}
