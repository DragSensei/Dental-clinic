import { ServiceDetail } from "@/features/public/service-detail";
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

function DetailFallback() {
  return <main aria-busy="true" aria-label="Loading service" className="page-shell min-h-[60vh]"><div className="surface animate-pulse motion-reduce:animate-none overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><div className="h-3 w-24 rounded bg-brand-border" /><div className="mt-5 h-10 max-w-md rounded bg-brand-border" /><div className="mt-5 h-5 max-w-2xl rounded bg-brand-border" /></div><div className="p-7 sm:p-10"><div className="h-6 w-56 rounded bg-brand-subtle" /><div className="mt-5 h-11 w-48 rounded bg-brand-subtle" /></div></div></main>;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<DetailFallback />}><ResolvedServicePage params={params} /></Suspense>;
}
