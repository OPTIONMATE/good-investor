import { NextResponse } from "next/server";
import { verifyToken } from "./app/lib/jwt";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/", "/dashboard"];

  if (protectedPaths.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      verifyToken(token);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard"],
};
