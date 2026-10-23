import { Suspense } from "react";
import { AdminNavigationClient } from "./admin-navigation-client";

export function AdminNavigation(props?: {
  collapsed?: boolean;
  onToggle?: () => void;
  signedInEmail?: string | null;
  onSignOut?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <aside aria-label="Admin Navigation" className="hidden p-3 h-full md:block md:w-[272px]">
          <div className="h-full rounded-[2rem] border border-border bg-card animate-pulse" />
        </aside>
      }
    >
      <AdminNavigationClient {...props} />
    </Suspense>
  );
}
