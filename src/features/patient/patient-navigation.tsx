import { Suspense } from "react";
import { PatientNavigationClient } from "./patient-navigation-client";

export function PatientNavigation(props?: {
  collapsed?: boolean;
  onToggle?: () => void;
  signedInEmail?: string | null;
  userDisplayName?: string | null;
  onSignOut?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <aside
          aria-label="Patient Navigation"
          className="hidden self-start p-3 transition-[width] duration-300 motion-reduce:transition-none md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:w-[272px]"
        >
          <div className="h-full rounded-[2rem] border border-border bg-card animate-pulse" />
        </aside>
      }
    >
      <PatientNavigationClient {...props} />
    </Suspense>
  );
}
