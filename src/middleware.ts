import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary fail-closed route gate.
 * UI-only logins were not authentication: all data-bearing admin and employee
 * routes are disabled until Firebase Auth + server-verified role checks and
 * Firestore security rules have been deployed and audited.
 * This middleware does NOT replace Firestore rules: direct SDK requests still
 * depend on rules configured in the Firebase console.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminProtected = pathname.startsWith("/admin/") && pathname !== "/admin/login";
  const employeeProtected = pathname.startsWith("/portal/") && pathname !== "/portal/login";

  if (adminProtected || employeeProtected) {
    const target = request.nextUrl.clone();
    target.pathname = adminProtected ? "/admin/login" : "/portal/login";
    target.search = "";
    return NextResponse.redirect(target);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
