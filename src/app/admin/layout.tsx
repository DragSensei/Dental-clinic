import type { ReactNode } from "react";
import { AdminNavigation } from "@/features/admin/admin-navigation";
import { AdminLayoutShell } from "@/features/admin/admin-layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutShell sidebar={<AdminNavigation />}>
      {children}
    </AdminLayoutShell>
  );
}
