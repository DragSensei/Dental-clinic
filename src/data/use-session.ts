"use client";

import { useSyncExternalStore } from "react";
import type { AccountRole } from "@/data/mock/catalog";

const SESSION_KEY = "dental-demo-admin-email";
const SESSION_ROLE_KEY = "dental-demo-user-role";
const SESSION_NAME_KEY = "dental-demo-user-name";
const SESSION_GOOGLE_KEY = "dental-demo-google-connected";

export type SessionState = {
  email: string | null;
  role: AccountRole | null;
  name?: string | null;
  googleConnected?: boolean;
};

let memorySession: SessionState = {
  email: null,
  role: null,
  name: null,
  googleConnected: false,
};

const listeners = new Set<() => void>();

function getSessionSnapshot(): SessionState {
  if (typeof window === "undefined") return memorySession;
  try {
    const email = memorySession.email ?? window.sessionStorage.getItem(SESSION_KEY);
    const role = (memorySession.role ?? window.sessionStorage.getItem(SESSION_ROLE_KEY)) as AccountRole | null;
    const name = memorySession.name ?? window.sessionStorage.getItem(SESSION_NAME_KEY);
    const googleStored = window.sessionStorage.getItem(SESSION_GOOGLE_KEY);
    const googleConnected = memorySession.googleConnected ?? (googleStored ? googleStored === "true" : false);

    if (
      memorySession.email !== email ||
      memorySession.role !== role ||
      memorySession.name !== name ||
      memorySession.googleConnected !== googleConnected
    ) {
      memorySession = { email, role, name, googleConnected };
    }
    return memorySession;
  } catch {
    return memorySession;
  }
}

const serverSnapshot: SessionState = { email: null, role: null, name: null, googleConnected: false };

function getServerSnapshot(): SessionState {
  return serverSnapshot;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function updateSession(
  email: string | null,
  role: AccountRole = "admin",
  name?: string | null,
  googleConnected?: boolean
) {
  memorySession = {
    email,
    role: email ? role : null,
    name: email ? (name ?? null) : null,
    googleConnected: email ? Boolean(googleConnected) : false,
  };
  try {
    if (typeof window !== "undefined") {
      if (email) {
        window.sessionStorage.setItem(SESSION_KEY, email);
        window.sessionStorage.setItem(SESSION_ROLE_KEY, role);
        if (name) {
          window.sessionStorage.setItem(SESSION_NAME_KEY, name);
        } else {
          window.sessionStorage.removeItem(SESSION_NAME_KEY);
        }
        if (googleConnected) {
          window.sessionStorage.setItem(SESSION_GOOGLE_KEY, "true");
        } else {
          window.sessionStorage.removeItem(SESSION_GOOGLE_KEY);
        }
      } else {
        window.sessionStorage.removeItem(SESSION_KEY);
        window.sessionStorage.removeItem(SESSION_ROLE_KEY);
        window.sessionStorage.removeItem(SESSION_NAME_KEY);
        window.sessionStorage.removeItem(SESSION_GOOGLE_KEY);
      }
    }
  } catch {}
  listeners.forEach((l) => l());
}

/**
 * Resolves the appropriate dashboard route depending on the user's role.
 * Routes patient to /patient/overview.
 */
export function getDashboardRoute(role?: AccountRole | string | null): string {
  switch (role) {
    case "admin":
      return "/admin/overview";
    case "doctor":
      // Currently directs to clinic overview; ready for future /doctor/dashboard
      return "/admin/overview";
    case "patient":
      return "/patient/overview";
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
    name: session.name ?? null,
    googleConnected: Boolean(session.googleConnected),
    isLoggedIn: Boolean(session.email),
    dashboardRoute,
    signIn: (
      email: string,
      role: AccountRole = "admin",
      name?: string | null,
      googleConnected?: boolean
    ) => updateSession(email, role, name, googleConnected),
    signOut: () => updateSession(null),
  };
}
