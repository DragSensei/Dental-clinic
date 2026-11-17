import { Suspense, type ReactNode } from "react";
import { AdminNavigation } from "@/features/admin/admin-navigation";
import { AdminLayoutShell } from "@/features/admin/admin-layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="h-10 w-44 rounded-xl bg-muted animate-pulse" />
        </div>
      }
    >
      <AdminLayoutShell sidebar={<AdminNavigation />}>
        {children}
      </AdminLayoutShell>
    </Suspense>
  );
}
