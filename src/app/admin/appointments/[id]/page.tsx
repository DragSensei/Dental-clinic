import { Suspense } from "react";
import { AdminView, AppointmentFallback } from "@/features/admin/admin-view";
export const instant = false;

type RouteProps = { params: Promise<{ id: string }> };

async function ResolvedAppointment({ params }: RouteProps) {
  const { id } = await params;
  return <AdminView view="appointment" id={id}/>;
}

export default function Page({ params }: RouteProps) {
  return <Suspense fallback={<AppointmentFallback/>}><ResolvedAppointment params={params}/></Suspense>;
}
