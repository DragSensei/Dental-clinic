"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";

export function AdvancedCareBanner() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="advanced-care-title" className="relative isolate w-full overflow-hidden bg-brand-primary md:min-h-[480px] lg:min-h-[520px]" id="advanced-care">
      <div className="relative aspect-[3/2] w-full md:absolute md:inset-y-0 md:end-0 md:aspect-auto md:w-[58%] lg:w-[54%]">
        <Image
          alt=""
          className="object-cover object-[center_20%] rtl:-scale-x-100"
          fill
          sizes="(max-width: 767px) 100vw, 56vw"
          src="/advanced-care-generated.png"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/15 via-30% to-transparent md:bg-gradient-to-r md:from-brand-primary md:via-brand-primary/55 md:via-30% md:to-transparent rtl:md:bg-gradient-to-l"
        />
      </div>
      <div className="relative z-10 flex items-center px-5 pb-12 pt-4 sm:px-8 md:min-h-[480px] md:py-16 lg:min-h-[520px] lg:px-12 2xl:px-16">
        <div className="max-w-xl text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{t.landing.advancedCare.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="advanced-care-title">{t.landing.advancedCare.title}</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
            {t.landing.advancedCare.body}
          </p>
          <ul className="mt-6 grid gap-3 text-sm font-medium sm:grid-cols-3">
            {t.landing.advancedCare.promises.map((item) => <li className="flex items-center gap-2" key={item}><Check aria-hidden="true" className="size-4 shrink-0 text-action" />{item}</li>)}
          </ul>
          <Link className={buttonVariants({ variant: "accent", className: "mt-8 h-12 rounded-lg px-5" })} href="/services">{t.landing.advancedCare.explore} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link>
        </div>
      </div>
    </section>
  );
}
