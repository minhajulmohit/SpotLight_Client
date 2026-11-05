import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/add-studio",
  "/my-listings",
  "/my-bookings",
  "/studios/edit",
];

// যেসব পেজে লগইন থাকলে যাওয়া যাবে না
const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Auth সংক্রান্ত API সরাসরি পাস করে দেওয়া
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // ব্যাকএন্ড API প্রক্সি হ্যান্ডলিং (/api/...)
  if (pathname.startsWith("/api/")) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Backend URL is not configured." },
        { status: 500 },
      );
    }

    const method = request.method.toUpperCase();
    const isPublic =
      (method === "GET" &&
        (pathname === "/api/studios" ||
          pathname.startsWith("/api/studios/") ||
          pathname === "/api/bookings/availability")) ||
      (method === "POST" && pathname === "/api/newsletter");

    // পাবলিক API না হলে এবং টোকেন না থাকলে 401 Unauthorized
    let token: string | undefined;
    if (!isPublic) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
      }

      const apiToken = await auth.api.getToken({ headers: request.headers });
      token = apiToken?.token;
      if (!token) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
      }
    }

    // ব্যাকএন্ড রিকোয়েস্টে হেডার সেট করা
    const requestHeaders = new Headers(request.headers);
    if (token) {
      requestHeaders.set("authorization", `Bearer ${token}`);
    }

    // ব্যাকএন্ডে রিকোয়েস্ট ফরোয়ার্ড করা
    const targetUrl = new URL(`${pathname}${search}`, backendUrl);

    return NextResponse.rewrite(targetUrl, {
      request: { headers: requestHeaders },
    });
  }

  // লগইন না থাকলে Protected পেজ থেকে লগইন পেজে রিডাইরেক্ট
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // লগইন থাকলে Login/Register পেজ থেকে ড্যাশবোর্ডে রিডাইরেক্ট
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  let token: string | undefined;
  if (isProtected || isAuthRoute) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session) {
      const apiToken = await auth.api.getToken({ headers: request.headers });
      token = apiToken?.token;
    }
  }

  const isAuthenticated = !!token;

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackURL", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// কোন কোন পাথে প্রক্সি রান হবে

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
