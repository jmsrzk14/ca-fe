import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authentication middleware.
 * Redirects unauthenticated users to /login for all dashboard pages.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — bypass auth check.
  const publicPaths = ["/login", "/auth/callback"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // const accessToken = request.cookies.get("access_token")?.value;
  // if (!accessToken) {
  //   const loginUrl = new URL("/login", request.url);
  //   loginUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api\\.).*)",
  ],
};
