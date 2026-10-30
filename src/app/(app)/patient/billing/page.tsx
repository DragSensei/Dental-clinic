import { PatientBillingView } from "@/features/patient/patient-care-billing";

export const instant = false;

// Authenticated session context for patient billing view
const session = null;

export default function Page() {
  void session;
  return <PatientBillingView />;
}
