"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Stethoscope } from "lucide-react";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorProfile({ id }: { id: string }) {
  const { doctors, services } = useClinic();
  const { locale, t } = useI18n();
  const doctor = doctors.find((item) => item.id === id);
  if (!doctor) return <main className="page-shell flex-1"><div className="surface p-8"><p className="eyebrow">{t.doctors.profile.unavailableEyebrow}</p><h1 className="page-title">{t.doctors.profile.unavailableTitle}</h1><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/doctors"><ArrowLeft className="size-4 rtl:-scale-x-100" />{t.doctors.profile.meetTeam}</Link></div></main>;
  const copy = localizedDoctor(doctor, locale);
  const offered = services.filter((service) => doctor.serviceIds.includes(service.id));
  return <main className="page-shell min-h-[60vh]"><Link className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/doctors"><ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />{t.doctors.profile.back}</Link>
    <article className="surface overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><span className="grid size-14 place-items-center rounded-2xl border border-brand-border bg-background text-brand-primary"><Stethoscope aria-hidden="true" className="size-6" /></span><p className="mt-6 eyebrow">{copy.specialty}</p><h1 className="page-title">{copy.name}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{copy.bio}</p></div><div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="text-xl font-semibold">{t.doctors.profile.careAreas}</h2>{offered.length ? <ul className="mt-4 flex flex-wrap gap-2">{offered.map((service) => <li key={service.id}><Link className="inline-flex min-h-11 items-center rounded-full border border-brand-border px-4 text-sm font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring" href={`/services/${service.id}`}>{localizedService(service, locale).title}</Link></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">{t.doctors.profile.noServices}</p>}</div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground outline-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-ring" href={`/book?doctorId=${doctor.id}`}>{t.doctors.profile.continueBooking} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link></div></article><p className="mt-5 text-xs leading-5 text-muted-foreground">{t.doctors.profile.disclaimer}</p>
  </main>;
}

export function DoctorProfileFallback() {
  const { t } = useI18n();
  return (
    <main aria-busy="true" aria-label={t.doctors.profile.loading} className="page-shell min-h-[60vh]">
      <div className="surface overflow-hidden">
        <div className="bg-brand-subtle p-7 sm:p-10 space-y-4">
          <Skeleton className="size-14 rounded-2xl bg-brand-border/60" />
          <Skeleton className="h-3 w-36 bg-brand-border/60" />
          <Skeleton className="h-10 max-w-md bg-brand-border/60" />
          <Skeleton className="h-5 max-w-2xl bg-brand-border/60" />
        </div>
        <div className="p-7 sm:p-10 space-y-4">
          <Skeleton className="h-6 w-56 bg-brand-subtle" />
          <Skeleton className="h-11 w-48 bg-brand-subtle" />
        </div>
      </div>
    </main>
  );
}
