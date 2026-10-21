"use client";

import { Clock3, MapPin, Users } from "lucide-react";
import { localizedClinic } from "@/shared/data/mock/localized-copy";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Badge } from "@/shared/components/ui/badge";

export function ClinicInformation() {
  const { locale, t } = useI18n();
  const clinic = localizedClinic(locale);
  const details = [
    { icon: Users, title: t.landing.clinicInfo.teamTitle, lines: clinic.team },
    { icon: MapPin, title: clinic.name, lines: [clinic.address, clinic.email, clinic.phone] },
    { icon: Clock3, title: t.landing.clinicInfo.visitTitle, lines: [clinic.hours, clinic.closed, t.landing.clinicInfo.sampleHours] },
  ];

  return (
    <section aria-labelledby="clinic-title" className="scroll-mt-32 border-y border-brand-border bg-brand-subtle" data-reveal="section" id="clinic">
      <div className="mx-auto w-full max-w-none px-5 py-14 sm:px-8 sm:py-20 lg:px-12 2xl:px-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.clinicInfo.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl" id="clinic-title">{t.landing.clinicInfo.title}</h2>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium">
            {t.landing.clinicInfo.badge}
          </Badge>
        </div>
        <div className="mt-9 grid gap-8 md:grid-cols-3">
          {details.map(({ icon: Icon, title, lines }) => (
            <div className="rounded-2xl border border-brand-border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-7" data-reveal="card" key={title}>
              <span className="grid size-11 place-items-center rounded-full bg-action/25 text-brand-primary"><Icon aria-hidden="true" className="size-5" /></span><h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3><ul className="mt-3 space-y-1 break-words text-sm leading-7 text-muted-foreground">{lines.map((line) => <li key={line}>{line}</li>)}</ul><p className="mt-4 text-xs text-muted-foreground">{t.landing.clinicInfo.demoData}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
