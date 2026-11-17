"use client";

import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { localizedClinic } from "@/data/mock/localized-copy";
import { useI18n } from "@/i18n/locale-provider";

export function ClinicInformation() {
  const { locale, t } = useI18n();
  const clinic = localizedClinic(locale);
  const details = [
    { icon: MapPin, title: clinic.name, lines: [clinic.address, clinic.email, clinic.phone] },
    { icon: Clock3, title: t.landing.clinicInfo.visitTitle, lines: [clinic.hours, clinic.closed, t.landing.clinicInfo.sampleHours] },
    { icon: Users, title: t.landing.clinicInfo.teamTitle, lines: clinic.team },
  ];

  return (
    <aside aria-labelledby="clinic-title" className="scroll-mt-28 lg:col-span-5" data-reveal="content" id="clinic">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {t.landing.clinicInfo.eyebrow}
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl" id="clinic-title">
            {t.landing.clinicInfo.title}
          </h2>
        </div>
        <Badge className="px-3 py-1 text-xs font-medium" variant="outline">
          {t.landing.clinicInfo.badge}
        </Badge>
      </div>

      <div className="space-y-4">
        {details.map(({ icon: Icon, title, lines }) => (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs" data-reveal="card" key={title}>
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-brand-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
                <ul className="mt-2 space-y-1 break-words text-sm leading-relaxed text-muted-foreground">
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{t.landing.clinicInfo.demoData}</p>
        <Link
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-primary underline decoration-border underline-offset-4 hover:decoration-brand-primary focus-visible:outline-2 focus-visible:outline-ring"
          href="/contact"
        >
          <span>{t.landing.appointmentSection.clinicDetails}</span>
          <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </aside>
  );
}
