"use client";

import { ArrowRight } from "lucide-react";
import { localizedClinic } from "@/data/mock/localized-copy";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

export function PatientSatisfaction() {
  const { locale, t } = useI18n();
  const clinicCopy = localizedClinic(locale);
  const { testimonials, metrics } = clinicCopy;

  return (
    <section
      aria-labelledby="patient-satisfaction-title"
      className="scroll-mt-28 border-t border-border bg-secondary/25 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16"
      data-reveal="section"
      id="patient-satisfaction"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Compact Key Figures */}
        <div className="border-b border-border pb-10 mb-10" id="patient-metrics">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-5 sm:px-6" key={label}>
                <p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1.5 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t.landing.metrics.note}</p>
        </div>

        {/* Testimonials Header + Cards */}
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              {t.landing.satisfaction.eyebrow}
            </p>
            <h2
              className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              id="patient-satisfaction-title"
            >
              {t.landing.satisfaction.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.landing.satisfaction.lead}
            </p>
          </div>
          <div className="md:col-span-4 md:flex md:justify-end">
            <a
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary underline decoration-border underline-offset-4 hover:decoration-brand-primary focus-visible:outline-2 focus-visible:outline-ring"
              href="#care"
            >
              <span>{t.landing.satisfaction.exploreCare}</span>
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, visit, quote }) => (
            <figure className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs" key={name}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                  {t.landing.satisfaction.sampleTestimonial}
                </p>
                <blockquote className="mt-4 text-sm leading-7 text-foreground sm:text-base">
                  “{quote}”
                </blockquote>
              </div>
              <figcaption className="mt-6 border-t border-border pt-4">
                <span className="block text-sm font-semibold text-foreground">{name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {interpolate(t.landing.satisfaction.fictionalPatient, { visit })}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
