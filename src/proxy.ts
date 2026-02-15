import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname === "/login";

  if (isAuthRoute) return;

  if (!req.auth) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
