"use client";

import Link from "next/link";
import { useClinic } from "@/shared/data/use-clinic";
import { ServiceCard } from "@/shared/components/service-card";
import { getServiceIcon } from "@/shared/components/service-icons";

export function ServiceDirectory() {
  const { services } = useClinic();
  return <main className="page-shell min-h-[60vh]">
    <header className="page-header"><p className="eyebrow">Sample care menu</p><h1 className="page-title">Explore dental services.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Browse illustrative care topics from the demo clinic. Listings, durations, and availability are sample data; ask a dental professional about your needs.</p><p className="mt-3 text-sm text-muted-foreground">Ready to continue? <Link className="inline-flex min-h-11 items-center font-semibold text-brand-primary underline underline-offset-4" href="/book">Start a booking preview</Link></p></header>
    {services.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard {...service} headingLevel="h2" Icon={getServiceIcon(service.id)} key={service.id} />)}</div> : <div className="surface p-7 text-sm text-muted-foreground">No sample services are available right now.</div>}
  </main>;
}
