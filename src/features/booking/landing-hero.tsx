"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";

export function LandingHero() {
  const { t } = useI18n();
  return (
    <>
      <section className="relative mx-auto grid w-full max-w-none items-center gap-8 overflow-hidden bg-brand-subtle px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:py-16 2xl:px-16" id="home">
        <div className="relative z-10 lg:col-span-5" data-reveal="content">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-2xl text-[clamp(2.65rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-brand-primary">
            {t.landing.hero.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t.landing.hero.lead}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link className={buttonVariants({ variant: "accent", className: "h-12 rounded-lg px-5" })} href="/book">
              {t.landing.hero.bookAppointment} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </Link>
            <Link className="inline-flex h-12 items-center gap-2 rounded-lg border border-brand-border bg-background px-4 text-sm font-semibold text-brand-primary outline-none transition-colors hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-ring" href="/visit">
              <MessageCircle aria-hidden="true" className="size-4" />
              {t.landing.hero.firstVisitGuide}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[1.25/1] w-full overflow-hidden rounded-[20px] bg-white shadow-lg shadow-brand-primary/10 sm:aspect-[1.55/1] lg:col-span-7 lg:aspect-[1.35/1]" data-reveal="image">
          <Image
            alt={t.landing.hero.imageAlt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 58vw"
            src="/dental-visit-hero.png"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/70 bg-background/95 p-4 shadow-md backdrop-blur sm:inset-x-auto sm:end-5 sm:bottom-5 sm:max-w-xs sm:p-5">
            <p className="text-sm font-semibold text-brand-primary">{t.landing.hero.overlayTitle}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.landing.hero.overlayText}</p>
          </div>
        </div>
      </section>

      <div aria-label={t.landing.hero.topicsLabel} className="border-y border-brand-border bg-background px-5 py-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-brand-primary sm:justify-between">
          {t.landing.hero.topics.map((topic) => <span className="inline-flex min-h-11 items-center" key={topic}>{topic}</span>)}
        </div>
      </div>
    </>
  );
}
