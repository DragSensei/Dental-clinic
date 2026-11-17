"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { ExpandableCard } from "@/components/shared/expandable-card";
import { localizedService } from "@/data/mock/localized-copy";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80";

export function CareGuide() {
  const { services } = useClinic();
  const { locale, t } = useI18n();

  return (
    <section
      aria-labelledby="care-title"
      className="scroll-mt-32 bg-background px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16"
      data-reveal="section"
      id="care"
    >
      <div className="mx-auto w-full max-w-none">
        <div className="mx-auto max-w-2xl text-center" data-reveal="content">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {t.landing.careGuide.eyebrow}
          </p>
          <h2
            className="font-display mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            id="care-title"
          >
            {t.landing.careGuide.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.landing.careGuide.body}
          </p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            {t.landing.careGuide.clickHint}
          </p>
        </div>

        {services.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-6">
            {services.slice(0, 5).map((service) => {
              const copy = localizedService(service, locale);
              return (
                <ExpandableCard
                  key={service.id}
                  title={copy.title}
                  src={service.image || DEFAULT_FALLBACK_IMAGE}
                  description={copy.description}
                  category={copy.categoryLabel}
                  duration={service.durationMinutes}
                  className="p-4 sm:p-5"
                  classNameExpanded="[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3.5 [&_h4:first-child]:mt-0 [&_h4]:mb-1 [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed"
                >
                  <h4>{t.services.card.overviewHeading}</h4>
                  <p>{copy.extendedDetails?.overview || copy.description}</p>

                  <h4>{t.services.card.procedureHeading}</h4>
                  <p>{copy.extendedDetails?.procedure || t.services.card.fallbackProcedure}</p>

                  <h4>{t.services.card.benefitsHeading}</h4>
                  <p>{copy.extendedDetails?.benefits || t.services.card.fallbackBenefits}</p>

                  <h4>{t.services.card.aftercareHeading}</h4>
                  <p>{copy.extendedDetails?.aftercare || t.services.card.fallbackAftercare}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-3.5 w-full">
                    <Link
                      href={`/book?serviceId=${service.id}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
                    >
                      <CalendarCheck className="size-4" />
                      {t.services.card.bookNow}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {interpolate(t.services.card.consultationDuration, { count: service.durationMinutes })}
                    </span>
                  </div>
                </ExpandableCard>
              );
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-brand-border p-7 text-sm text-muted-foreground">
            {t.landing.careGuide.empty}
          </p>
        )}

        <div className="mt-10 text-center">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-border px-6 text-sm font-semibold text-brand-primary hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring transition-colors"
            href="/services"
          >
            <span>{t.landing.careGuide.viewAll}</span>
            <ArrowRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
