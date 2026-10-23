"use client";

import { localizedClinic } from "@/data/mock/localized-copy";
import { useI18n } from "@/i18n/locale-provider";

export function PatientMetrics() {
  const { locale, t } = useI18n();
  const metrics = localizedClinic(locale).metrics;
  return (
    <section aria-label={t.landing.metrics.label} className="scroll-mt-28 bg-brand-subtle px-5 py-8 sm:px-8 sm:py-10 lg:px-12 2xl:px-16" id="patient-metrics">
      <p className="mx-auto mb-4 max-w-7xl text-xs font-medium text-muted-foreground">{t.landing.metrics.note}</p>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div className="rounded-xl border border-brand-border bg-background px-4 py-5 sm:px-6 sm:py-6" key={label}>
            <p className="text-xl font-bold tracking-tight text-brand-primary sm:text-2xl">{value}</p>
            <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
