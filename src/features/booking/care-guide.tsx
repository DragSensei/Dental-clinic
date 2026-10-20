"use client";

import Link from "next/link";
import { ServiceCard } from "@/shared/components/service-card";
import { getServiceIcon } from "@/shared/components/service-icons";
import { useClinic } from "@/shared/data/use-clinic";

export function CareGuide() {
  const { services } = useClinic();
  return <section aria-labelledby="care-title" className="scroll-mt-32 bg-background px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16" data-reveal="section" id="care">
    <div className="mx-auto w-full max-w-7xl">
      <div className="mx-auto max-w-2xl text-center" data-reveal="content"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">Our services</p><h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="care-title">Explore dental care topics.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">A few sample care topics from this fictional clinic. Explore the complete menu on the services page. These sample listings are not confirmed treatment offerings.</p><p className="mt-2 text-xs leading-6 text-muted-foreground">General terminology: <a className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring" href="https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-treatments/" rel="noreferrer" target="_blank">NHS dental treatments guide</a>.</p></div>
      {services.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.slice(0, 4).map((service) => <div data-reveal="card" key={service.id}><ServiceCard {...service} headingLevel="h3" Icon={getServiceIcon(service.id)} /></div>)}</div> : <p className="mt-10 rounded-2xl border border-brand-border p-7 text-sm text-muted-foreground">No sample services are currently listed.</p>}
      <div className="mt-8 text-center"><Link className="inline-flex min-h-11 items-center rounded-full border border-brand-border px-5 text-sm font-semibold text-brand-primary hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring" href="/services">View all services</Link></div>
    </div>
  </section>;
}
