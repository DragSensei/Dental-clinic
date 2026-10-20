"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { useClinic } from "@/shared/data/use-clinic";

export function DoctorDirectory() {
  const { doctors } = useClinic();
  return <main className="page-shell min-h-[60vh]"><header className="page-header"><p className="eyebrow">Fictional demo team</p><h1 className="page-title">Meet the dental team.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Get to know the sample clinicians and the care areas they can discuss. Names, profiles, and service matches are demonstration data.</p></header>
    {doctors.length ? <div className="grid gap-4 sm:grid-cols-2">{doctors.map((doctor) => <article className="surface flex flex-col p-6 sm:p-7" key={doctor.id}><span className="grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary"><Stethoscope aria-hidden="true" className="size-5" /></span><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-primary">{doctor.specialty}</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{doctor.name}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{doctor.bio}</p><Link className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-brand-primary" href={`/doctors/${doctor.id}`}>View profile <ArrowRight aria-hidden="true" className="size-4" /></Link></article>)}</div> : <div className="surface p-7 text-sm text-muted-foreground">No sample clinicians are listed right now.</div>}
  </main>;
}
