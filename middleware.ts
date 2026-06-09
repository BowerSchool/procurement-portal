import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/api", "/finance", "/founder", "/settings"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const response = NextResponse.next();
  response.headers.set("x-rbac-enforced", "true");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/finance/:path*", "/founder/:path*", "/settings/:path*"]
};
