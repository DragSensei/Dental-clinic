"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import { useI18n } from "@/shared/i18n/locale-provider";

export function AdvancedCareBanner() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="advanced-care-title" className="relative isolate min-h-[440px] w-full overflow-hidden bg-brand-primary sm:min-h-[500px]" id="advanced-care">
      <Image
        alt=""
        className="object-cover object-center rtl:-scale-x-100"
        fill
        sizes="100vw"
        src="/advanced-care-generated.png"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-primary/85 via-brand-primary/30 to-transparent sm:bg-gradient-to-r sm:from-brand-primary/45 sm:via-brand-primary/10 sm:to-transparent rtl:sm:bg-gradient-to-l" />
      <div className="relative z-10 flex min-h-[440px] items-end px-5 py-12 sm:min-h-[500px] sm:items-center sm:px-8 sm:py-16 lg:px-12 2xl:px-16">
        <div className="max-w-2xl text-white">
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
