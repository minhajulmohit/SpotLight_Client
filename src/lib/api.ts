export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!path.startsWith("/api/")) {
    throw new Error("API requests must use a /api/ path.");
  }

  return fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
}
