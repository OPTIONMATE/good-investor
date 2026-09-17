import { NextResponse } from "next/server";
import { clearCookie } from "@/app/lib/apiHelpers";

export async function POST() {
  const res = NextResponse.json({ success: true });
  
  // ✅ SECURITY: Use clearCookie utility for production-safe cookie handling
  clearCookie(res, "token");
  
  return res;
}
