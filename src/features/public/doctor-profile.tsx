"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Stethoscope } from "lucide-react";
import { useClinic } from "@/shared/data/use-clinic";

export function DoctorProfile({ id }: { id: string }) {
  const { doctors, services } = useClinic();
  const doctor = doctors.find((item) => item.id === id);
  if (!doctor) return <main className="page-shell flex-1"><div className="surface p-8"><p className="eyebrow">Profile unavailable</p><h1 className="page-title">We couldn’t find that clinician.</h1><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/doctors"><ArrowLeft className="size-4" />Meet the team</Link></div></main>;
  const offered = services.filter((service) => doctor.serviceIds.includes(service.id));
  return <main className="page-shell min-h-[60vh]"><Link className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/doctors"><ArrowLeft aria-hidden="true" className="size-4" />All clinicians</Link>
    <article className="surface overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><span className="grid size-14 place-items-center rounded-2xl border border-brand-border bg-background text-brand-primary"><Stethoscope aria-hidden="true" className="size-6" /></span><p className="mt-6 eyebrow">{doctor.specialty}</p><h1 className="page-title">{doctor.name}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{doctor.bio}</p></div><div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="text-xl font-semibold">Sample care areas</h2>{offered.length ? <ul className="mt-4 flex flex-wrap gap-2">{offered.map((service) => <li key={service.id}><Link className="inline-flex min-h-11 items-center rounded-full border border-brand-border px-4 text-sm font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring" href={`/services/${service.id}`}>{service.title}</Link></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No sample services are associated with this clinician.</p>}</div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground outline-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-ring" href={`/book?doctorId=${doctor.id}`}>Continue to booking preview <ArrowRight aria-hidden="true" className="size-4" /></Link></div></article><p className="mt-5 text-xs leading-5 text-muted-foreground">Demo profile only. Credentials and clinic affiliation are fictional.</p>
  </main>;
}
