import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear authentication cookies
  response.cookies.set("authToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("userId", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("tenantId", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("role", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
