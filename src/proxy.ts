import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get("zp-auth")?.value;
  const appPassword = process.env.APP_PASSWORD;

  // If no password is set, allow access (dev mode)
  if (!appPassword) {
    return NextResponse.next();
  }

  // Allow access to login page and API login route
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/api/auth/login"
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  if (authCookie !== appPassword) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
