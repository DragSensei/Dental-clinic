"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useSession } from "@/data/use-session";
import { hydrateAppointments, hydratePatientData } from "@/data/clinic-repository";
import { useI18n } from "@/i18n/locale-provider";
import { PatientSidebarContext } from "./patient-sidebar-context";

export function PatientLayoutShell({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signedInEmail, name, role, isPending, signOut } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (signedInEmail && role === "patient") {
      void hydrateAppointments();
      void hydratePatientData(signedInEmail);
    }
  }, [signedInEmail, role]);

  if (pathname === "/patient") {
    notFound();
  }

  // While checking session, render a neutral loading skeleton instead of notFound()
  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground animate-pulse">
          {t.system.loading}...
        </p>
      </div>
    );
  }

  if (!signedInEmail || role !== "patient") {
    notFound();
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <PatientSidebarContext.Provider
      value={{
        collapsed,
        onToggle: () => setCollapsed((v) => !v),
        signedInEmail,
        userDisplayName: name ?? signedInEmail,
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
              <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground animate-pulse">
                {t.system.loading}...
              </p>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </PatientSidebarContext.Provider>
  );
}

export default PatientLayoutShell;
