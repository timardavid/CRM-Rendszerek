import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const isPublic = PUBLIC_ROUTES.some((route) => req.nextUrl.pathname.startsWith(route));
  const isAuthed = !!req.auth;

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
