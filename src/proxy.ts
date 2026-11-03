import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const API_TOKEN_COOKIE = "spotlight_api_token";

const getTokenExpiry = (token: string) => {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const claims = JSON.parse(decoded) as { exp?: unknown };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
};

const proxyApiRequest = async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/api/auth/api-token") {
    if (request.method !== "DELETE") {
      return NextResponse.json({ message: "Method not allowed." }, { status: 405 });
    }

    const response = new NextResponse(null, { status: 204 });
    response.cookies.set(API_TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { message: "The backend URL is not configured." },
      { status: 500 },
    );
  }

  const method = request.method.toUpperCase();
  const isPublicRequest =
    (method === "GET" &&
      (pathname === "/api/studios" ||
        pathname.startsWith("/api/studios/") ||
        pathname === "/api/bookings/availability")) ||
    (method === "POST" && pathname === "/api/newsletter");

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  let token = request.cookies.get(API_TOKEN_COOKIE)?.value;
  let tokenMaxAge: number | undefined;

  if (!isPublicRequest) {
    const sessionCookie = request.headers.get("cookie");
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const tokenExpiresAt = token ? getTokenExpiry(token) : null;
    if (!tokenExpiresAt || tokenExpiresAt <= Date.now() / 1000 + 30) {
      const authUrl = process.env.BETTER_AUTH_URL;
      if (!authUrl) {
        return NextResponse.json(
          { message: "The authentication URL is not configured." },
          { status: 500 },
        );
      }

      let tokenResponse: Response;
      try {
        tokenResponse = await fetch(new URL("/api/auth/token", authUrl), {
          headers: { cookie: sessionCookie },
          cache: "no-store",
        });
      } catch {
        return NextResponse.json(
          { message: "Could not verify the current session." },
          { status: 502 },
        );
      }

      if (tokenResponse.status === 401) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
      }
      if (!tokenResponse.ok) {
        return NextResponse.json(
          { message: "Could not verify the current session." },
          { status: 502 },
        );
      }

      const data = (await tokenResponse.json()) as { token?: unknown };
      if (typeof data.token !== "string" || !data.token) {
        return NextResponse.json(
          { message: "The authentication service did not return a token." },
          { status: 502 },
        );
      }

      token = data.token;
      const expiresAt = getTokenExpiry(token);
      if (!expiresAt) {
        return NextResponse.json(
          { message: "The authentication service returned an invalid token." },
          { status: 502 },
        );
      }
      tokenMaxAge = Math.floor(expiresAt - Date.now() / 1000);
      if (tokenMaxAge <= 0) {
        return NextResponse.json(
          { message: "The authentication token has expired." },
          { status: 401 },
        );
      }
    }

    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    headers.set("authorization", `Bearer ${token}`);
  }

  const target = new URL(`${pathname}${search}`, backendUrl);
  const response = NextResponse.rewrite(target, {
    request: { headers },
  });
  if (token && tokenMaxAge) {
    response.cookies.set(API_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenMaxAge,
    });
  }
  return response;
};

// যেসব Page Login ছাড়া দেখা যাবে না
const protectedRoutes = [
  "/dashboard",
  "/add-studio",
  "/my-listings",
  "/my-bookings",
  "/studios/edit",
];

// যেসব Page শুধু Logout অবস্থায় দেখা যাবে
const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  // বর্তমানে কোন Page-এ আছি
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    return proxyApiRequest(request);
  }

  // URL-এর Query Parameter
  const search = request.nextUrl.search;

  // User-এর Login Session Cookie খুঁজে বের করা
  let sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const cookie = request.cookies.get("better-auth.session_token");

    if (cookie) {
      sessionCookie = cookie.value;
    }
  }

  if (!sessionCookie) {
    const cookie = request.cookies.get("__Secure-better-auth.session_token");

    if (cookie) {
      sessionCookie = cookie.value;
    }
  }

  // Cookie থাকলে User-কে Login করা হিসেবে ধরা হচ্ছে
  let isAuthenticated = false;

  if (sessionCookie) {
    isAuthenticated = true;
  }

  // Page Protected কি না পরীক্ষা
  let isProtected = false;

  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      isProtected = true;

      break;
    }
  }

  // Login না করা User Protected Page-এ গেলে Login Page-এ পাঠানো
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackURL", pathname + search);

    return NextResponse.redirect(loginUrl);
  }

  // Login এবং Register Page পরীক্ষা
  let isAuthRoute = false;

  for (const route of authRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      isAuthRoute = true;

      break;
    }
  }

  // Login করা User Login/Register Page-এ গেলে Dashboard-এ পাঠানো
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// কোন কোন Request-এর ক্ষেত্রে Proxy কাজ করবে
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

export default proxy;
