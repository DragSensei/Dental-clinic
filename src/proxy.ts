import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/authz";

// There is no ?next= parameter and no other redirect,
// so no redirect loop and no open-redirect surface.
export type Gate = { kind: "next" } | { kind: "notFound" } | { kind: "redirect"; to: string };

export function decideGate(pathname: string, role: Role | null): Gate {
  if (pathname === "/admin/login") {
    return role
      ? { kind: "redirect", to: role === "patient" ? "/patient/overview" : "/admin/overview" }
      : { kind: "redirect", to: "/login" };
  }
  if (pathname === "/login") {
    return role
      ? { kind: "redirect", to: role === "patient" ? "/patient/overview" : "/admin/overview" }
      : { kind: "next" };
  }
  if (pathname === "/admin") return { kind: "notFound" }; // bare /admin is always 404 (existing contract)
  if (pathname.startsWith("/admin/")) return role === "admin" || role === "doctor" ? { kind: "next" } : { kind: "notFound" };
  if (pathname === "/patient" || pathname.startsWith("/patient/")) return role === "patient" ? { kind: "next" } : { kind: "notFound" };
  return { kind: "next" };
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  const u = session?.user as (Record<string, unknown> | undefined);
  const role = (u?.role as Role) || null;

  const pathname = request.nextUrl.pathname;
  const decision = decideGate(pathname, role);

  if (decision.kind === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }
  if (decision.kind === "notFound") {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/patient", "/patient/:path*", "/login"],
};
