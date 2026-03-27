import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE, ONBOARDED_COOKIE } from "@/lib/auth";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/onboarding", "/dashboard", "/default"];

function hasPrefix(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((route) => hasPrefix(pathname, route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => hasPrefix(pathname, route));

  const isLoggedIn = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const onboarded = request.cookies.get(ONBOARDED_COOKIE)?.value === "1";

  if (isAuthRoute && isLoggedIn) {
    const nextPath = onboarded ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/dashboard" && isLoggedIn && !onboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding" && isLoggedIn && onboarded) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/register/:path*", "/onboarding/:path*", "/dashboard/:path*", "/default/:path*"],
};
