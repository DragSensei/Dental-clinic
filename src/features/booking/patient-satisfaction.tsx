"use client";

import { ArrowRight } from "lucide-react";
import { localizedClinic } from "@/shared/data/mock/localized-copy";
import { interpolate } from "@/shared/i18n/format";
import { useI18n } from "@/shared/i18n/locale-provider";

export function PatientSatisfaction() {
  const { locale, t } = useI18n();
  const testimonials = localizedClinic(locale).testimonials;
  return (
    <section aria-labelledby="patient-satisfaction-title" className="scroll-mt-28 border-y border-brand-border bg-background px-5 py-12 sm:px-8 sm:py-16 lg:px-12 2xl:px-16" id="patient-satisfaction">
      <div className="mx-auto grid w-full max-w-7xl gap-5 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.satisfaction.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl" id="patient-satisfaction-title">{t.landing.satisfaction.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{t.landing.satisfaction.lead}</p>
        </div>
        <a className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary underline decoration-brand-border underline-offset-4 hover:decoration-brand-primary focus-visible:outline-2 focus-visible:outline-ring md:col-span-4 md:col-start-9 md:justify-self-end" href="#care">
          {t.landing.satisfaction.exploreCare} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </a>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl gap-5 md:grid-cols-3">
        {testimonials.map(({ name, visit, quote }) => (
          <figure className="rounded-2xl border border-brand-border bg-brand-subtle p-6" key={name}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary">{t.landing.satisfaction.sampleTestimonial}</p>
            <blockquote className="mt-4 text-sm leading-7 text-foreground">“{quote}”</blockquote>
            <figcaption className="mt-5 border-t border-brand-border pt-4"><span className="block text-sm font-semibold">{name}</span><span className="mt-1 block text-xs text-muted-foreground">{interpolate(t.landing.satisfaction.fictionalPatient, { visit })}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
