"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";
import { BookingSearchPreview } from "./booking-search-preview";

export function AppointmentCta() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="next-step-title" className="w-full scroll-mt-32 py-8 sm:py-12" data-reveal="section" id="next-step">
      <div className="relative isolate w-full overflow-hidden rounded-3xl bg-brand-primary text-white dark:text-primary-foreground md:min-h-[440px]">
        <div className="relative aspect-[3/2] w-full md:absolute md:inset-y-0 md:end-0 md:aspect-auto md:w-[58%] lg:w-[54%]" data-reveal="image">
          <Image
            alt={t.landing.cta.imageAlt}
            className="object-cover object-[center_20%] rtl:-scale-x-100"
            fill
            sizes="(max-width: 767px) 100vw, 56vw"
            src="/dental-visit-hero.png"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/15 via-30% to-transparent md:bg-gradient-to-r md:from-brand-primary md:via-brand-primary/55 md:via-30% md:to-transparent rtl:md:bg-gradient-to-l"
          />
        </div>
        <div className="relative z-10 flex items-center px-6 pb-10 pt-4 sm:px-9 md:min-h-[440px] md:py-12 lg:px-12" data-reveal="content">
          <div className="flex max-w-xl flex-col items-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 dark:text-primary-foreground/75">{t.landing.cta.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] text-white dark:text-primary-foreground sm:text-5xl" id="next-step-title"><span className="block">{t.landing.cta.titleLine1}</span><span className="block">{t.landing.cta.titleLine2}</span></h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/90 dark:text-primary-foreground/85 sm:text-base">{t.landing.cta.body}</p>
            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-full! px-5 sm:w-auto" })} href="/book">{t.landing.cta.explore} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 outline-none transition-colors hover:decoration-white focus-visible:ring-2 focus-visible:ring-ring dark:text-primary-foreground dark:decoration-primary-foreground/40 dark:hover:decoration-primary-foreground" href="/visit">{t.landing.cta.firstVisitGuide}</Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/75 dark:text-primary-foreground/75">{t.landing.cta.demoOnly}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl px-5 sm:mt-10 sm:px-8 lg:px-12 2xl:px-16" data-reveal="content">
        <div className="rounded-2xl border border-brand-border bg-background p-3 shadow-lg shadow-brand-primary/5 sm:p-5">
          <p className="mb-3 px-2 text-sm font-semibold text-brand-primary sm:mb-4">{t.landing.cta.searchLabel}</p>
          <BookingSearchPreview />
        </div>
      </div>
    </section>
  );
}
