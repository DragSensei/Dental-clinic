"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { localizedDoctor } from "@/shared/data/mock/localized-copy";
import { useClinic } from "@/shared/data/use-clinic";
import { useI18n } from "@/shared/i18n/locale-provider";

export function DoctorDirectory() {
  const { doctors } = useClinic();
  const { locale, t } = useI18n();
  return <main className="page-shell min-h-[60vh]"><header className="page-header"><p className="eyebrow">{t.doctors.directory.eyebrow}</p><h1 className="page-title">{t.doctors.directory.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{t.doctors.directory.lead}</p></header>
    {doctors.length ? <div className="grid gap-4 sm:grid-cols-2">{doctors.map((doctor) => { const copy = localizedDoctor(doctor, locale); return <article className="surface flex flex-col p-6 sm:p-7" key={doctor.id}><span className="grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary"><Stethoscope aria-hidden="true" className="size-5" /></span><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-primary">{copy.specialty}</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{copy.name}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.bio}</p><Link className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-brand-primary" href={`/doctors/${doctor.id}`}>{t.doctors.directory.viewProfile} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link></article>; })}</div> : <div className="surface p-7 text-sm text-muted-foreground">{t.doctors.directory.empty}</div>}
  </main>;
}
