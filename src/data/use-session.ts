"use client";

import type { AccountRole } from "@/data/mock/catalog";
import { authClient } from "@/lib/auth-client";

export type SessionState = {
  email: string | null;
  role: AccountRole | null;
  name?: string | null;
  isPending?: boolean;
};

/**
 * Resolves the appropriate dashboard route depending on the user's role.
 * Routes patient to /patient/overview.
 */
export function getDashboardRoute(role?: AccountRole | string | null): string {
  switch (role) {
    case "admin":
      return "/admin/overview";
    case "doctor":
      return "/admin/overview";
    case "patient":
      return "/patient/overview";
    default:
      return "/admin/overview";
  }
}

/**
 * @deprecated Legacy session update retained for backwards compatibility with legacy callers.
 * Does not mutate storage; session state is managed via Better Auth.
 */
export function updateSession(
  email: string | null,
  role?: AccountRole,
  name?: string | null
) {
  // No-op: Better Auth cookies and server-side state are the single source of truth.
  void email;
  void role;
  void name;
}

export function useSession() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user as (Record<string, unknown> | undefined);

  const email = (user?.email as string) || null;
  const role = (user?.role as AccountRole) || (email ? "patient" : null);
  const name = (user?.name as string) || null;
  const dashboardRoute = getDashboardRoute(role);

  return {
    signedInEmail: email,
    email,
    role,
    name,
    isPending,
    isLoggedIn: Boolean(email),
    dashboardRoute,
    signIn: async (
      emailOrOpts: string | { email: string; password?: string },
      passwordOrRole?: string | AccountRole
    ) => {
      if (typeof emailOrOpts === "object") {
        return await authClient.signIn.email({
          email: emailOrOpts.email,
          password: emailOrOpts.password || "",
        });
      }
      return await authClient.signIn.email({
        email: emailOrOpts,
        password: typeof passwordOrRole === "string" ? passwordOrRole : "",
      });
    },
    signOut: async () => {
      await authClient.signOut();
    },
  };
}
