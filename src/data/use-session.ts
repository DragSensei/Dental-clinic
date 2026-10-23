"use client";

import { useSyncExternalStore } from "react";
import type { AccountRole } from "@/data/mock/catalog";

const SESSION_KEY = "dental-demo-admin-email";
const SESSION_ROLE_KEY = "dental-demo-user-role";

export type SessionState = {
  email: string | null;
  role: AccountRole | null;
};

let memorySession: SessionState = {
  email: null,
  role: null,
};

const listeners = new Set<() => void>();

function getSessionSnapshot(): SessionState {
  if (typeof window === "undefined") return memorySession;
  try {
    const email = memorySession.email ?? window.sessionStorage.getItem(SESSION_KEY);
    const role = (memorySession.role ?? window.sessionStorage.getItem(SESSION_ROLE_KEY)) as AccountRole | null;
    if (memorySession.email !== email || memorySession.role !== role) {
      memorySession = { email, role };
    }
    return memorySession;
  } catch {
    return memorySession;
  }
}

const serverSnapshot: SessionState = { email: null, role: null };

function getServerSnapshot(): SessionState {
  return serverSnapshot;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function updateSession(email: string | null, role: AccountRole = "admin") {
  memorySession = {
    email,
    role: email ? role : null,
  };
  try {
    if (typeof window !== "undefined") {
      if (email) {
        window.sessionStorage.setItem(SESSION_KEY, email);
        window.sessionStorage.setItem(SESSION_ROLE_KEY, role);
      } else {
        window.sessionStorage.removeItem(SESSION_KEY);
        window.sessionStorage.removeItem(SESSION_ROLE_KEY);
      }
    }
  } catch {}
  listeners.forEach((l) => l());
}

/**
 * Resolves the appropriate dashboard route depending on the user's role.
 * Extensible for future role-specific dashboards (e.g. Doctor dashboard, Patient portal).
 */
export function getDashboardRoute(role?: AccountRole | string | null): string {
  switch (role) {
    case "admin":
      return "/admin/overview";
    case "doctor":
      // Currently directs to clinic overview; ready for future /doctor/dashboard
      return "/admin/overview";
    case "patient":
      // Currently directs to clinic overview; ready for future /patient/dashboard
      return "/admin/overview";
    default:
      return "/admin/overview";
  }
}

export function useSession() {
  const session = useSyncExternalStore(subscribe, getSessionSnapshot, getServerSnapshot);
  const dashboardRoute = getDashboardRoute(session.role);

  return {
    signedInEmail: session.email,
    role: session.role,
    isLoggedIn: Boolean(session.email),
    dashboardRoute,
    signIn: (email: string, role: AccountRole = "admin") => updateSession(email, role),
    signOut: () => updateSession(null),
  };
}
