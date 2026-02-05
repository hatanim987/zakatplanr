import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || password === appPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("zp-auth", appPassword || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
