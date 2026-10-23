"use client";

import { Suspense, useState, type ReactNode } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { AdminDemoGate, type DemoAccount } from "@/features/admin/admin-demo-gate";
import { useSession } from "@/shared/data/use-session";
import { useI18n } from "@/shared/i18n/locale-provider";
import type { AccountRole } from "@/shared/data/mock/catalog";
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
  const { signedInEmail, signIn, signOut } = useSession();

  if (pathname === "/admin") {
    notFound();
  }

  const [collapsed, setCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const { t } = useI18n();

  const handleSignIn = (email: string, role?: AccountRole) => {
    signIn(email, role ?? "admin");
    if (pathname === "/admin/login") {
      router.push("/admin/overview");
    }
  };

  const handleSignOut = () => {
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
    router.replace("/admin/overview");
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
        } transition-[grid-template-columns] duration-300 motion-reduce:transition-none min-h-[calc(100vh-69px)]`}
      >
        <Suspense
          fallback={
            <aside
              aria-hidden="true"
              className={`hidden p-3 h-full md:block ${collapsed ? "md:w-[88px]" : "md:w-[272px]"}`}
            >
              <div className="h-full rounded-[2rem] border border-border bg-card" />
            </aside>
          }
        >
          {sidebar}
        </Suspense>
        <main className="min-h-[70vh] min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
