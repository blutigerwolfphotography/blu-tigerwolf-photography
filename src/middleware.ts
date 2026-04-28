import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/gallery-session/constants";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/gallery")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gallery/:path*"],
};
