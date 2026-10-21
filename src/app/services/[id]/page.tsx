import { ServiceDetail, ServiceDetailFallback } from "@/features/public/service-detail";
import { services } from "@/shared/data/mock/catalog";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return services.map(({ id }) => ({ id }));
}


async function ResolvedServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!services.some((service) => service.id === id)) notFound();
  return <ServiceDetail id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<ServiceDetailFallback />}><ResolvedServicePage params={params} /></Suspense>;
}
