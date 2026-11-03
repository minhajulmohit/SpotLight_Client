import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

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
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

export default proxy;
