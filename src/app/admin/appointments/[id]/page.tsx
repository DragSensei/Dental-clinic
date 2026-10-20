import { Suspense } from "react";
import { AdminView } from "@/features/admin/admin-view";
export const instant = false;

type RouteProps = { params: Promise<{ id: string }> };

function AppointmentFallback() {
  return <div aria-busy="true" aria-label="Loading appointment" className="motion-reduce:animate-none animate-pulse"><div className="mb-8 border-b border-border pb-6"><div className="h-3 w-40 rounded bg-muted"/><div className="mt-4 h-9 w-64 rounded bg-muted"/><div className="mt-3 h-4 w-80 max-w-full rounded bg-muted"/></div><div className="grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-2xl border border-border bg-card"/><div className="h-64 rounded-2xl border border-border bg-card"/></div></div>;
}

async function ResolvedAppointment({ params }: RouteProps) {
  const { id } = await params;
  return <AdminView view="appointment" id={id}/>;
}

export default function Page({ params }: RouteProps) {
  return <Suspense fallback={<AppointmentFallback/>}><ResolvedAppointment params={params}/></Suspense>;
}
