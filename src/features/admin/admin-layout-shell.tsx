"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AdminDemoGate, type DemoAccount } from "@/features/admin/admin-demo-gate";
import { useSession, getDashboardRoute } from "@/data/use-session";
import { useI18n } from "@/i18n/locale-provider";
import type { AccountRole } from "@/data/mock/catalog";
import { AdminSidebarContext } from "./admin-sidebar-context";

const initialDemoAccounts: DemoAccount[] = [
  {
    email: "admin@bluehaven.example",
    password: "clinic-demo-123",
    name: "Dr. Administrator",
    role: "admin",
  },
  {
    email: "mariam.a@example.com",
    password: "clinic-demo-123",
    name: "Mariam Ahmed",
    role: "patient",
  },
  {
    email: "youssef.m@example.com",
    password: "clinic-demo-123",
    name: "Youssef Mahmoud",
    role: "patient",
  },
  {
    email: "salma.k@example.com",
    password: "clinic-demo-123",
    name: "Salma Khalil",
    role: "patient",
  },
];

export function AdminLayoutShell({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signedInEmail, signIn, signOut, role } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>(initialDemoAccounts);
  const { t } = useI18n();

  useEffect(() => {
    if (typeof window !== "undefined" && pathname === "/admin/login") {
      const params = new URLSearchParams(window.location.search);
      const google = params.get("google");
      const googleEmail = params.get("google_email");
      const googleName = params.get("google_name");
      if (google === "demo_fallback" || googleEmail) {
        signIn(googleEmail || "mariam.a@example.com", "patient", googleName || "Mariam Ahmed", true);
        router.replace("/patient/overview");
        return;
      }
    }
    if (signedInEmail && pathname === "/admin/login") {
      router.replace(getDashboardRoute(role));
    }
  }, [pathname, router, signedInEmail, role, signIn]);

  useEffect(() => {
    if (signedInEmail && role === "patient" && pathname.startsWith("/admin") && pathname !== "/admin/login") {
      router.replace("/patient/overview");
    }
  }, [pathname, router, signedInEmail, role]);

  if (pathname === "/admin") {
    notFound();
  }

  const handleSignIn = (email: string, targetRole?: AccountRole) => {
    const finalRole = targetRole ?? "admin";
    signIn(email, finalRole);
    if (pathname === "/admin/login") {
      router.push(getDashboardRoute(finalRole));
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch {}
    signOut();
    router.push("/");
  };

  if (!signedInEmail) {
    if (pathname === "/admin/login") {
      return (
        <AdminDemoGate
          accounts={accounts}
          onSignUp={(account) => {
            setAccounts((current) => [...current, account]);
            handleSignIn(account.email, account.role ?? "admin");
          }}
          onSignIn={handleSignIn}
        />
      );
    }
    notFound();
  }

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <AdminSidebarContext.Provider
      value={{
        collapsed,
        onToggle: () => setCollapsed((v) => !v),
        signedInEmail,
        onSignOut: handleSignOut,
      }}
    >
      <div
        className={`w-full flex-1 md:grid ${
          collapsed ? "md:grid-cols-[88px_minmax(0,1fr)]" : "md:grid-cols-[272px_minmax(0,1fr)]"
        } transition-[grid-template-columns] duration-300 motion-reduce:transition-none min-h-[calc(100vh-3.5rem)]`}
      >
        <Suspense
          fallback={
            <aside
              aria-hidden="true"
              className={`hidden self-start p-3 transition-[width] duration-300 motion-reduce:transition-none md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] ${
                collapsed ? "md:w-[88px]" : "md:w-[272px]"
              }`}
            >
              <div className="h-full rounded-[2rem] border border-border bg-card" />
            </aside>
          }
        >
          {sidebar}
        </Suspense>
        <main className="min-h-[70vh] min-w-0 px-4 pt-8 pb-24 sm:px-6 sm:pt-10 md:py-10 lg:px-8">
          <Suspense
            fallback={
              <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                {t.admin.layout.loading}
              </p>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </AdminSidebarContext.Provider>
  );
}
