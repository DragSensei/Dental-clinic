"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { useClinic } from "@/shared/data/use-clinic";

export function ServiceDetail({ id }: { id: string }) {
  const { services, doctors } = useClinic();
  const service = services.find((item) => item.id === id);
  if (!service) return <main className="page-shell flex-1"><div className="surface p-8"><p className="eyebrow">Service unavailable</p><h1 className="page-title">We couldn’t find that service.</h1><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/services"><ArrowLeft className="size-4" />Browse services</Link></div></main>;
  const providers = doctors.filter((doctor) => doctor.serviceIds.includes(service.id));
  return <main className="page-shell min-h-[60vh]">
    <Link className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/services"><ArrowLeft aria-hidden="true" className="size-4" />All services</Link>
    <article className="surface overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><p className="eyebrow">Sample service</p><h1 className="page-title">{service.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{service.description}</p><p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-primary"><Clock3 aria-hidden="true" className="size-4" />Sample visit length: {service.durationMinutes} minutes</p></div>
      <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="text-xl font-semibold">Clinicians for this service</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">The sample team below can be selected in the booking preview. This is illustrative, not confirmed clinic availability.</p>{providers.length ? <ul className="mt-5 flex flex-wrap gap-2">{providers.map((doctor) => <li key={doctor.id}><Link className="inline-flex min-h-11 items-center rounded-full border border-brand-border px-4 text-sm font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring" href={`/doctors/${doctor.id}`}>{doctor.name}</Link></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">No sample clinicians are currently listed for this service.</p>}</div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground outline-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-ring" href={`/book?serviceId=${service.id}`}>Continue to booking preview <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
    </article>
    <p className="mt-5 text-xs leading-5 text-muted-foreground">Demo content only. This page does not provide diagnosis or treatment advice.</p>
  </main>;
}
