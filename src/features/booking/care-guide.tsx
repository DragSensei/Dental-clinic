"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, X, CalendarCheck, Sparkles } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { localizedService } from "@/data/mock/localized-copy";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import type { Service } from "@/data/mock/catalog";

const CATEGORY_NAMES: Record<string, { en: string; ar: string }> = {
  "Preventive Care": { en: "Preventive Care", ar: "رعاية وقائية" },
  "Restorative Dentistry": { en: "Restorative Dentistry", ar: "طب الأسنان الترميمي" },
  "Cosmetic Dentistry": { en: "Cosmetic Dentistry", ar: "طب الأسنان التجميلي" },
  "Orthodontics": { en: "Orthodontics", ar: "تقويم الأسنان" },
  "Pediatric Dentistry": { en: "Pediatric Dentistry", ar: "طب أسنان الأطفال" },
  "Oral Surgery & Endodontics": { en: "Oral Surgery & Endodontics", ar: "جراحة الفم وعلاج الجذور" },
};

const SERVICE_PRICES: Record<string, { en: string; ar: string }> = {
  "service-1": { en: "From $95", ar: "من ٩٥ $" },
  "service-2": { en: "From $850", ar: "من ٨٥٠ $" },
  "service-3": { en: "From $1,200", ar: "من ١,٢٠٠ $" },
  "service-4": { en: "From $250", ar: "من ٢٥٠ $" },
  "service-5": { en: "From $110", ar: "من ١١٠ $" },
  "service-6": { en: "From $420", ar: "من ٤٢٠ $" },
  "service-7": { en: "From $80", ar: "من ٨٠ $" },
  "service-8": { en: "From $140", ar: "من ١٤٠ $" },
  "service-9": { en: "From $65", ar: "من ٦٥ $" },
  "service-10": { en: "From $600", ar: "من ٦٠٠ $" },
  "service-11": { en: "From $350", ar: "من ٣٥٠ $" },
  "service-12": { en: "From $750", ar: "من ٧٥٠ $" },
};

function getCategoryLabel(category: string, locale: string) {
  return CATEGORY_NAMES[category]?.[locale === "ar" ? "ar" : "en"] || category;
}

export function CareGuide() {
  const { services } = useClinic();
  const { locale, t } = useI18n();
  const [featuredImageError, setFeaturedImageError] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const featuredService = services[0];
  const otherServices = services.slice(1, 5);

  const featuredCopy = featuredService ? localizedService(featuredService, locale) : null;
  const featuredPrice = featuredService
    ? SERVICE_PRICES[featuredService.id]?.[locale === "ar" ? "ar" : "en"] ||
      (locale === "ar" ? "من ١٢٠ $" : "From $120")
    : "";

  const selectedCopy = selectedService ? localizedService(selectedService, locale) : null;
  const selectedPrice = selectedService
    ? SERVICE_PRICES[selectedService.id]?.[locale === "ar" ? "ar" : "en"] ||
      (locale === "ar" ? "من ١٢٠ $" : "From $120")
    : "";

  return (
    <section
      id="care"
      aria-labelledby="care-title"
      className="section-fade-up relative w-full scroll-mt-24 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 2xl:px-16">
        {/* Section Header */}
        <div className="max-w-2xl">
          <p className="font-body text-xs sm:text-sm font-semibold tracking-wider uppercase text-muted-foreground">
            {t.landing.careGuide.eyebrow}
          </p>
          <h2
            id="care-title"
            className="font-display mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground"
          >
            {t.landing.careGuide.title}
          </h2>
          <p className="font-body mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {t.landing.careGuide.body}
          </p>
        </div>

        {services.length > 0 ? (
          <div className="mt-10 sm:mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
            {/* 1. Large Featured Treatment Card (lg:col-span-7) */}
            {featuredService && featuredCopy && (
              <article className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md">
                {/* Photo Stage */}
                <div className="relative aspect-[16/10] sm:aspect-[3/2] w-full overflow-hidden bg-secondary">
                  {featuredImageError ? (
                    <div
                      role="img"
                      aria-label="Featured treatment placeholder"
                      className="flex h-full w-full items-center justify-center p-6 text-center text-muted-foreground"
                    >
                      <p className="font-body text-sm font-medium tracking-wide">
                        Featured treatment photo: interior.jpg, 3:2, clinic interior
                      </p>
                    </div>
                  ) : (
                    <Image
                      src="/images/demo/interior.jpg"
                      alt={featuredCopy.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      onError={() => setFeaturedImageError(true)}
                    />
                  )}
                  <div className="absolute top-4 start-4 z-10">
                    <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3.5 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-md">
                      <Sparkles className="size-3 text-primary" />
                      <span>{getCategoryLabel(featuredCopy.category, locale)}</span>
                    </span>
                  </div>
                </div>

                {/* Featured Content */}
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                        {featuredCopy.title}
                      </h3>
                      <span className="font-body text-base sm:text-lg font-semibold text-foreground">
                        {featuredPrice}
                      </span>
                    </div>
                    <p className="font-body mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {featuredCopy.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>
                        {featuredService.durationMinutes}{" "}
                        {locale === "ar" ? "دقيقة استشارة" : "mins consultation"}
                      </span>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-border pt-5">
                    <Link
                      href={`/book?serviceId=${featuredService.id}`}
                      className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:brightness-105 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CalendarCheck className="size-4" />
                      <span>
                        {locale === "ar" ? "احجز هذا العلاج" : "Book this treatment"}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedService(featuredService)}
                      className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>
                        {locale === "ar" ? "التفاصيل السريرية" : "Clinical details"}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Refined List of Other Treatments (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="space-y-3 sm:space-y-3.5">
                {otherServices.map((service) => {
                  const copy = localizedService(service, locale);
                  const price =
                    SERVICE_PRICES[service.id]?.[locale === "ar" ? "ar" : "en"] ||
                    (locale === "ar" ? "من ١٢٠ $" : "From $120");

                  return (
                    <div
                      key={service.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:p-4.5 shadow-xs transition-colors hover:border-primary/40 hover:bg-secondary/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {getCategoryLabel(copy.category, locale)}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="font-body text-xs text-muted-foreground">
                            {service.durationMinutes} {locale === "ar" ? "د" : "min"}
                          </span>
                        </div>
                        <h4 className="font-body mt-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {copy.title}
                        </h4>
                        <p className="font-body mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                          {copy.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3.5 shrink-0 border-t sm:border-t-0 border-border/50 pt-2.5 sm:pt-0">
                        <span className="font-body text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                          {price}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedService(service)}
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-3.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span>{locale === "ar" ? "تفاصيل" : "Expand"}</span>
                          </button>
                          <Link
                            href={`/book?serviceId=${service.id}`}
                            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-secondary px-3.5 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span>{locale === "ar" ? "حجز" : "Book"}</span>
                            <ArrowRight className="size-3 rtl:-scale-x-100" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Services Link */}
              <div className="pt-2">
                <Link
                  href="/services"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:bg-secondary shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{t.landing.careGuide.viewAll}</span>
                  <ArrowRight className="size-4 rtl:-scale-x-100" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-border p-7 text-sm text-muted-foreground">
            {t.landing.careGuide.empty}
          </p>
        )}
      </div>

      {/* 3. Accessible Expandable Details Dialog */}
      <Dialog.Root
        open={selectedService !== null}
        onOpenChange={(open) => !open && setSelectedService(null)}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
          <Dialog.Popup className="fixed inset-x-4 top-[50%] z-50 max-h-[88vh] w-auto max-w-xl -translate-y-[50%] overflow-y-auto rounded-2xl border border-border bg-card p-6 sm:p-7 text-card-foreground shadow-2xl outline-none sm:start-[50%] sm:-translate-x-[50%]">
            {selectedService && selectedCopy && (
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-body rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {getCategoryLabel(selectedCopy.category, locale)}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {selectedService.durationMinutes}{" "}
                        {locale === "ar" ? "دقيقة" : "mins"}
                      </span>
                    </div>
                    <Dialog.Title className="font-display mt-2 text-2xl sm:text-3xl font-semibold text-foreground">
                      {selectedCopy.title}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close
                    aria-label={locale === "ar" ? "إغلاق النافذة" : "Close dialog"}
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="size-5" />
                  </Dialog.Close>
                </div>

                {/* Full Clinical Details */}
                <div className="mt-5 space-y-4 font-body text-sm leading-relaxed text-muted-foreground">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {locale === "ar" ? "نظرة عامة على العلاج" : "Treatment Overview"}
                    </h4>
                    <p className="mt-1">
                      {selectedService.extendedDetails?.overview || selectedCopy.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {locale === "ar"
                        ? "الإجراء السريري وما يمكن توقعه"
                        : "Clinical Procedure & What to Expect"}
                    </h4>
                    <p className="mt-1">
                      {selectedService.extendedDetails?.procedure ||
                        "Our experienced clinical team utilizes modern diagnostic imaging and gentle dental protocols to ensure complete comfort throughout your visit."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {locale === "ar" ? "الفوائد العلاجية الرئيسية" : "Key Treatment Benefits"}
                    </h4>
                    <p className="mt-1">
                      {selectedService.extendedDetails?.benefits ||
                        "Preserves your oral health, restores full function and aesthetic harmony, and supports lasting dental well-being."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {locale === "ar" ? "الرعاية اللاحقة والعناية اليومية" : "Aftercare & Maintenance"}
                    </h4>
                    <p className="mt-1">
                      {selectedService.extendedDetails?.aftercare ||
                        "Maintain daily brushing and flossing, follow personalized home-care recommendations, and attend bi-annual examinations."}
                    </p>
                  </div>
                </div>

                {/* Dialog Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="font-body text-base font-semibold text-foreground">
                    {selectedPrice}
                  </span>
                  <Link
                    href={`/book?serviceId=${selectedService.id}`}
                    onClick={() => setSelectedService(null)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs hover:brightness-105 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CalendarCheck className="size-4" />
                    <span>
                      {locale === "ar" ? "احجز هذا الموعد الآن" : "Book appointment now"}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
