import { Suspense } from "react";
import { AdminView, DoctorFallback } from "@/features/admin/admin-view";
export const instant = false;

type RouteProps = { params: Promise<{ id: string }> };

async function ResolvedDoctor({ params }: RouteProps) {
  const { id } = await params;
  return <AdminView view="doctor" id={id}/>;
}

export default function Page({ params }: RouteProps) {
  return <Suspense fallback={<DoctorFallback/>}><ResolvedDoctor params={params}/></Suspense>;
}
