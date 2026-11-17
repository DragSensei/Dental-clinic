"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/locale-provider";
import { BookingSearchPreview } from "./booking-search-preview";

export function AppointmentCta() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="next-step-title" className="w-full scroll-mt-32" data-reveal="section" id="next-step">
      {/* Sky-blue editorial band per DESIGN.md Section 3 & 8 (#9) */}
      <div className="bg-primary text-primary-foreground px-5 pt-14 pb-24 sm:px-8 sm:pt-16 sm:pb-28 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7" data-reveal="content">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/80">
              {t.landing.cta.eyebrow}
            </p>
            <h2
              className="font-display mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl"
              id="next-step-title"
            >
              <span className="block">{t.landing.cta.titleLine1}</span>
              <span className="block">{t.landing.cta.titleLine2}</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {t.landing.cta.body}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
                href="/book"
              >
                <span>{t.landing.cta.explore}</span>
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-primary-foreground underline decoration-primary-foreground/45 underline-offset-4 outline-none transition-colors hover:decoration-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
                href="/visit"
              >
                {t.landing.cta.firstVisitGuide}
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-primary-foreground/80">{t.landing.cta.demoOnly}</p>
          </div>

          <div className="lg:col-span-5" data-reveal="image">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary-foreground/15 shadow-sm">
              <Image
                alt={t.landing.cta.imageAlt}
                className="object-cover object-[center_20%] rtl:-scale-x-100"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 40vw"
                src="/dental-visit-hero.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking search card straddling the sky-blue CTA and footer ground seam */}
      <div className="border-t border-border bg-muted px-5 pb-10 sm:px-8 sm:pb-12 lg:px-12 2xl:px-16">
        <div className="relative z-10 mx-auto -mt-14 w-full max-w-7xl sm:-mt-16" data-reveal="content">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-md sm:p-5">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary sm:mb-3">
              {t.landing.cta.searchLabel}
            </p>
            <BookingSearchPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
