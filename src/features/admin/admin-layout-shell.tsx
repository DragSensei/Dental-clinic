"use client";

import { Suspense, useState, useEffect, type ReactNode } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AdminDemoGate } from "@/features/admin/admin-demo-gate";
import { useSession } from "@/data/use-session";
import { hydrateAppointments } from "@/data/clinic-repository";
import { useI18n } from "@/i18n/locale-provider";
import { AdminSidebarContext } from "./admin-sidebar-context";

export function AdminLayoutShell({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signedInEmail, signOut, role, isPending } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (signedInEmail && (role === "admin" || role === "doctor")) {
      void hydrateAppointments();
    }
  }, [signedInEmail, role]);

  if (pathname === "/admin") {
    notFound();
  }

  // While checking session, render a neutral loading skeleton instead of notFound()
  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground animate-pulse">
          {t.admin.layout.loading}
        </p>
      </div>
    );
  }

  if (!signedInEmail) {
    if (pathname === "/admin/login") {
      return <AdminDemoGate />;
    }
    notFound();
  }

  // Defence in depth: only admin or doctor can access admin areas
  if (role !== "admin" && role !== "doctor") {
    notFound();
  }

  if (pathname === "/admin/login") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch {}
    await signOut();
    router.push("/");
  };

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
