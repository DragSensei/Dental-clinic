"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceDetail({ id }: { id: string }) {
  const { services, doctors } = useClinic();
  const { locale, t } = useI18n();
  const service = services.find((item) => item.id === id);
  if (!service) return <main className="page-shell flex-1"><div className="surface p-8"><p className="eyebrow">{t.services.detail.unavailableEyebrow}</p><h1 className="page-title">{t.services.detail.unavailableTitle}</h1><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/services"><ArrowLeft className="size-4 rtl:-scale-x-100" />{t.services.detail.browse}</Link></div></main>;
  const copy = localizedService(service, locale);
  const providers = doctors.filter((doctor) => doctor.serviceIds.includes(service.id));
  return <main className="page-shell min-h-[60vh]">
    <Link className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary" href="/services"><ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />{t.services.detail.allServices}</Link>
    <article className="surface overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><p className="eyebrow">{t.services.detail.eyebrow}</p><h1 className="page-title">{copy.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{copy.description}</p><p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-primary"><Clock3 aria-hidden="true" className="size-4" />{interpolate(t.services.detail.visitLength, { count: service.durationMinutes })}</p></div>
      <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="text-xl font-semibold">{t.services.detail.clinicians}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t.services.detail.clinicianNote}</p>{providers.length ? <ul className="mt-5 flex flex-wrap gap-2">{providers.map((doctor) => <li key={doctor.id}><Link className="inline-flex min-h-11 items-center rounded-full border border-brand-border px-4 text-sm font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring" href={`/doctors/${doctor.id}`}>{localizedDoctor(doctor, locale).name}</Link></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">{t.services.detail.noClinicians}</p>}</div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground outline-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-ring" href={`/book?serviceId=${service.id}`}>{t.services.detail.continueBooking} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link></div>
    </article>
    <p className="mt-5 text-xs leading-5 text-muted-foreground">{t.services.detail.disclaimer}</p>
  </main>;
}

export function ServiceDetailFallback() {
  const { t } = useI18n();
  return (
    <main aria-busy="true" aria-label={t.services.detail.loading} className="page-shell min-h-[60vh]">
      <div className="surface overflow-hidden">
        <div className="bg-brand-subtle p-7 sm:p-10 space-y-4">
          <Skeleton className="h-3 w-24 bg-brand-border/60" />
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
