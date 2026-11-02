import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_URL =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const proxyRequest = async (request: NextRequest, context: RouteContext) => {
  const { path } = await context.params;
  const target = new URL(path.map(encodeURIComponent).join("/"), `${BACKEND_URL}/`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const sessionCookie = request.headers.get("cookie");
  if (sessionCookie) {
    let tokenResponse: Response;
    try {
      tokenResponse = await fetch(new URL("/api/auth/token", AUTH_URL), {
        headers: { cookie: sessionCookie },
        cache: "no-store",
      });
    } catch {
      return Response.json(
        { message: "Could not verify the current session." },
        { status: 502 },
      );
    }

    if (tokenResponse.ok) {
      const data = (await tokenResponse.json()) as { token?: string };
      if (!data.token) {
        return Response.json(
          { message: "The session service did not return an API token." },
          { status: 502 },
        );
      }
      headers.set("authorization", `Bearer ${data.token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "The backend service is unavailable." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const responseType = response.headers.get("content-type");
  if (responseType) responseHeaders.set("content-type", responseType);
  responseHeaders.set("cache-control", "no-store");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
