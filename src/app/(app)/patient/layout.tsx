import type { ReactNode } from "react";
import { PatientNavigation } from "@/features/patient/patient-navigation";
import { PatientLayoutShell } from "@/features/patient/patient-layout-shell";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <PatientLayoutShell sidebar={<PatientNavigation />}>
      {children}
    </PatientLayoutShell>
  );
}
