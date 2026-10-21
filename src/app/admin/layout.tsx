"use client";

import { Suspense, useState, type ReactNode } from "react";
import { AdminNavigation } from "@/features/admin/admin-navigation";
import { AdminDemoGate, type DemoAccount } from "@/features/admin/admin-demo-gate";
import { interpolate } from "@/shared/i18n/format";
import { useI18n } from "@/shared/i18n/locale-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const { t } = useI18n();

  if (!signedInEmail) {
    return <AdminDemoGate accounts={accounts} onSignUp={(account) => { setAccounts((current) => [...current, account]); setSignedInEmail(account.email); }} onSignIn={setSignedInEmail} />;
  }

  return (
    <div className={`w-full md:grid ${collapsed ? "md:grid-cols-[88px_minmax(0,1fr)]" : "md:grid-cols-[272px_minmax(0,1fr)]"} transition-[grid-template-columns] duration-300 motion-reduce:transition-none`}>
      <Suspense fallback={<div aria-hidden="true" className={`h-14 border-b border-border bg-card md:h-auto md:min-h-[calc(100vh-6rem)] md:border-0 ${collapsed ? "md:w-[64px]" : "md:w-[248px]"}`}/> }><AdminNavigation collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} /></Suspense>
      <main className="min-h-[70vh] min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{interpolate(t.admin.layout.demoSession, { email: signedInEmail })}</p><button type="button" onClick={() => setSignedInEmail(null)} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{t.admin.layout.signOut}</button></div><Suspense fallback={<p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t.admin.layout.loading}</p>}>{children}</Suspense></main>
    </div>
  );
}
