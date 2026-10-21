"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import { useI18n } from "@/shared/i18n/locale-provider";
import { BookingSearchPreview } from "./booking-search-preview";

export function AppointmentSection() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="appointment-title" className="scroll-mt-32 bg-brand-subtle px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16" data-reveal="section" id="appointment">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7" data-reveal="content">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.appointmentSection.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="appointment-title">{t.landing.appointmentSection.title}</h2>
          </div>
          <div className="md:col-span-4 md:col-start-9" data-reveal="content">
            <p className="text-sm leading-7 text-muted-foreground">{t.landing.appointmentSection.body}</p>
            <a className={buttonVariants({ variant: "outline", className: "mt-4 h-11 rounded-lg px-4" })} href="#clinic">{t.landing.appointmentSection.clinicDetails} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></a>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-brand-border bg-background p-3 shadow-lg shadow-brand-primary/5 sm:mt-10 sm:p-5" data-reveal="card">
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-brand-primary sm:mb-4">
            <CalendarDays aria-hidden="true" className="size-4" />
            <span>{t.landing.appointmentSection.searchLabel}</span>
          </div>
          <BookingSearchPreview />
        </div>
      </div>
    </section>
  );
}
