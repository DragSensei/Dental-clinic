import { Suspense } from "react";
import { AdminView, ServiceFallback } from "@/features/admin/admin-view";
export const instant = false;

type RouteProps = { params: Promise<{ id: string }> };

async function ResolvedService({ params }: RouteProps) {
  const { id } = await params;
  return <AdminView view="service" id={id}/>;
}

export default function Page({ params }: RouteProps) {
  return <Suspense fallback={<ServiceFallback/>}><ResolvedService params={params}/></Suspense>;
}
