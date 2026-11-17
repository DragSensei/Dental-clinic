import { Suspense, type ReactNode } from "react";
import { PatientNavigation } from "@/features/patient/patient-navigation";
import { PatientLayoutShell } from "@/features/patient/patient-layout-shell";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="h-10 w-44 rounded-xl bg-muted animate-pulse" />
        </div>
      }
    >
      <PatientLayoutShell sidebar={<PatientNavigation />}>
        {children}
      </PatientLayoutShell>
    </Suspense>
  );
}
