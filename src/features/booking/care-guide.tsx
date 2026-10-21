"use client";

import Link from "next/link";
import { ExpandableCard } from "@/shared/components/ui/expandable-card";
import { localizedService } from "@/shared/data/mock/localized-copy";
import { useClinic } from "@/shared/data/use-clinic";
import { useI18n } from "@/shared/i18n/locale-provider";
import { ArrowRight, CalendarCheck } from "lucide-react";

export function CareGuide() {
  const { services } = useClinic();
  const { locale, t } = useI18n();

  return (
    <section aria-labelledby="care-title" className="scroll-mt-32 bg-background px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16" data-reveal="section" id="care">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center" data-reveal="content">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.careGuide.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="care-title">{t.landing.careGuide.title}</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.landing.careGuide.body}</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Click any service to view full clinical procedures, benefits, and aftercare guidance.
          </p>
        </div>

        {services.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service) => {
              const copy = localizedService(service, locale);
              return (
                <ExpandableCard
                  key={service.id}
                  title={copy.title}
                  src={service.image || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"}
                  description={copy.description}
                  category={service.category || "Preventive Care"}
                  duration={service.durationMinutes}
                  classNameExpanded="[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3.5 [&_h4:first-child]:mt-0 [&_h4]:mb-1 [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed"
                >
                  <h4>Treatment Overview</h4>
                  <p>{service.extendedDetails?.overview || copy.description}</p>

                  <h4>Clinical Procedure & What to Expect</h4>
                  <p>{service.extendedDetails?.procedure || "Our experienced clinical team utilizes modern diagnostic imaging and gentle dental protocols to ensure complete comfort throughout your visit."}</p>

                  <h4>Key Treatment Benefits</h4>
                  <p>{service.extendedDetails?.benefits || "Preserves your oral health, restores full function and aesthetic harmony, and supports lasting dental well-being."}</p>

                  <h4>Aftercare & Maintenance</h4>
                  <p>{service.extendedDetails?.aftercare || "Maintain daily brushing and flossing, follow personalized home-care recommendations, and attend bi-annual examinations."}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-3.5 w-full">
                    <Link
                      href={`/book?serviceId=${service.id}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
                    >
                      <CalendarCheck className="size-4" />
                      {locale === "ar" ? "احجز الآن" : "Book now"}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {service.durationMinutes} mins consultation
                    </span>
                  </div>
                </ExpandableCard>
              );
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-brand-border p-7 text-sm text-muted-foreground">{t.landing.careGuide.empty}</p>
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
