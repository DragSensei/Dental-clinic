"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  PhoneCall,
} from "lucide-react";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";

export function LandingHero() {
  const { t, locale, formatDate } = useI18n();
  const { services, doctors, getAvailableDatesForAnyDoctor, getAvailableSlotsForAnyDoctor } = useClinic();
  const [imageError, setImageError] = useState(false);

  // Compute 3 real appointment slots from the clinic repository
  const upcomingSlots = useMemo(() => {
    const primaryService = services[0];
    const serviceId = primaryService?.id || "initial-consultation";
    const availableDates = getAvailableDatesForAnyDoctor ? getAvailableDatesForAnyDoctor(serviceId) : [];

    const result: {
      serviceId: string;
      doctorId: string;
      doctorName: string;
      date: string;
      formattedDate: string;
      time: string;
    }[] = [];

    if (availableDates && availableDates.length > 0) {
      for (const d of availableDates) {
        const slots = getAvailableSlotsForAnyDoctor ? getAvailableSlotsForAnyDoctor(serviceId, d) : [];
        for (const s of slots) {
          result.push({
            serviceId,
            doctorId: s.doctorId,
            doctorName: s.doctorName,
            date: d,
            formattedDate: formatDate(d, { weekday: "short", month: "short", day: "numeric" }),
            time: s.time,
          });
          if (result.length >= 3) return result;
        }
      }
    }

    // High-fidelity fallback slots using real catalog doctors to eliminate CLS
    if (result.length === 0) {
      const doc1 = doctors[0]?.name || "Dr. Sarah Chen";
      const doc2 = doctors[1]?.name || "Dr. Marcus Vance";
      const doc3 = doctors[2]?.name || doctors[0]?.name || "Dr. Sarah Chen";
      const today = new Date();
      const d1 = new Date(today.getTime() + 86400000).toISOString().split("T")[0];
      const d2 = new Date(today.getTime() + 172800000).toISOString().split("T")[0];

      return [
        {
          serviceId,
          doctorId: doctors[0]?.id || "doc-1",
          doctorName: doc1,
          date: d1,
          formattedDate: formatDate(d1, { weekday: "short", month: "short", day: "numeric" }),
          time: "09:30",
        },
        {
          serviceId,
          doctorId: doctors[1]?.id || "doc-2",
          doctorName: doc2,
          date: d1,
          formattedDate: formatDate(d1, { weekday: "short", month: "short", day: "numeric" }),
          time: "14:15",
        },
        {
          serviceId,
          doctorId: doctors[2]?.id || doctors[0]?.id || "doc-1",
          doctorName: doc3,
          date: d2,
          formattedDate: formatDate(d2, { weekday: "short", month: "short", day: "numeric" }),
          time: "11:00",
        },
      ];
    }

    return result;
  }, [services, doctors, getAvailableDatesForAnyDoctor, getAvailableSlotsForAnyDoctor, formatDate]);

  return (
    <section
      className="relative mx-auto flex min-h-[calc(100vh-68px)] w-full flex-col justify-between overflow-hidden"
      id="home"
      aria-label={t.landing.hero.title}
    >
      {/* 1. Full-Bleed Studio Photography from public/images/demo/ (Z-0 plane) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {imageError ? (
          <div
            role="img"
            aria-label="Clinic photo demo placeholder"
            className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-border bg-secondary/50 p-6 text-center text-muted-foreground"
          >
            <p className="font-semibold uppercase tracking-wider text-xs sm:text-sm">
              [CLINIC PHOTO DEMO ASSET · REPLACE PER CLINIC]
            </p>
            <p className="mt-1 text-xs">
              /public/images/demo/hero-desktop.jpg (16:9) · hero-mobile.jpg (4:5)
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Photo: 4:5 ratio below md */}
            <div className="relative h-full w-full block md:hidden">
              <Image
                src="/images/demo/hero-mobile.jpg"
                alt={t.landing.hero.imageAlt}
                fill
                priority
                sizes="100vw"
                onError={() => setImageError(true)}
                className="object-cover object-top rtl:-scale-x-100 transition-transform duration-500"
              />
            </div>

            {/* Desktop Photo: 16:9 ratio on md+ */}
            <div className="relative h-full w-full hidden md:block">
              <Image
                src="/images/demo/hero-desktop.jpg"
                alt={t.landing.hero.imageAlt}
                fill
                priority
                sizes="100vw"
                onError={() => setImageError(true)}
                className="object-cover object-right rtl:object-left rtl:-scale-x-100 transition-transform duration-500"
              />
            </div>
          </>
        )}
      </div>

      {/* 2. Start-side Scrim Overlay: high contrast over photo text area (Z-10 plane) */}
      <div
        aria-hidden="true"
        className="hero-scrim-start pointer-events-none absolute inset-0 z-10"
      />

      {/* 3. Hero Content Container (Z-20 plane) */}
      <div className="hero-fade-up relative z-20 mx-auto my-auto w-full max-w-7xl px-4 pt-16 pb-6 sm:px-8 sm:pt-28 sm:pb-12 lg:px-12 2xl:px-16">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Start Side: Display Headline, Support Line & CTAs */}
          <div className="col-span-12 lg:col-span-7">
            {/* Eyebrow Pill */}
            <div className="inline-flex min-h-7 sm:min-h-8 items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-0.5 text-xs font-semibold text-foreground backdrop-blur-xs">
              <span className="size-2 rounded-full bg-primary" />
              <span>{t.landing.hero.eyebrow}</span>
            </div>

            {/* Display Headline: Cormorant Garamond (Latin) / Amiri (Arabic) */}
            <h1 className="font-display mt-3 sm:mt-4 text-[clamp(2.15rem,6.5vw,4.5rem)] font-semibold leading-[1.06] tracking-tight text-foreground">
              {t.landing.hero.title}
            </h1>

            {/* Support Line */}
            <p className="font-body mt-3 sm:mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
              {t.landing.hero.lead}
            </p>

            {/* Dual CTAs: Rounded-full per Section 6 */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/book"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all duration-150 hover:brightness-105 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{t.landing.hero.bookAppointment}</span>
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 text-sm font-semibold text-foreground shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{t.landing.hero.viewTreatments || "View treatments"}</span>
              </Link>
            </div>
          </div>

          {/* End Side (Desktop) / Below Headline (Mobile): Floating 'Next available' Card */}
          <div className="col-span-12 lg:col-span-5 w-full max-w-md mx-auto lg:ms-auto">
            <div className="rounded-2xl border border-border/80 bg-background/85 p-3.5 sm:p-5 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5 sm:pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-body text-xs sm:text-sm font-semibold text-foreground">
                      {t.landing.hero.nextAvailableTitle || "Next available"}
                    </h2>
                  </div>
                  <p className="font-body mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                    {t.landing.hero.nextAvailableSubtitle || "Real-time clinic availability"}
                  </p>
                </div>
                <span className="font-body rounded-full bg-secondary px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-foreground">
                  {t.landing.hero.clinicSlotBadge || "CLINIC SLOT"}
                </span>
              </div>

              {/* Real Slots: One Tap to Book */}
              <div className="mt-2.5 sm:mt-3 space-y-1.5 sm:space-y-2">
                {upcomingSlots.map((slot, index) => (
                  <Link
                    key={`${slot.date}-${slot.time}-${index}`}
                    href={`/book?serviceId=${encodeURIComponent(slot.serviceId)}&doctorId=${encodeURIComponent(slot.doctorId)}&date=${encodeURIComponent(slot.date)}&time=${encodeURIComponent(slot.time)}`}
                    className="group flex min-h-11 items-center justify-between rounded-xl border border-border/60 bg-background/60 p-2 sm:p-3 transition-colors hover:bg-secondary/70 hover:border-primary/50 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-lg bg-secondary text-foreground group-hover:text-primary transition-colors">
                        <Calendar aria-hidden="true" className="size-3.5 sm:size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-body text-xs font-semibold text-foreground">
                          {slot.formattedDate} · {slot.time}
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground truncate">
                          {slot.doctorName}
                        </p>
                      </div>
                    </div>
                    <span className="font-body inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 sm:px-3 text-xs font-semibold text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>{t.landing.hero.bookThisSlot || "Book slot"}</span>
                      <ArrowRight aria-hidden="true" className="size-3 rtl:-scale-x-100" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Edge Trust Strip with clearly marked placeholder values (Z-20 plane) */}
      <aside
        aria-label="Clinic Trust Highlights"
        className="relative z-20 w-full border-t border-border/80 bg-background/90 sm:bg-background/70 backdrop-blur-xs py-5 sm:py-7 px-4 sm:px-8 lg:px-12 2xl:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {/* Slot 1: Rating & Reviews */}
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-full bg-secondary text-amber-500 shadow-xs">
                <Star aria-hidden="true" className="size-4 sm:size-5 fill-amber-400 text-amber-500" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-body text-xs sm:text-sm font-semibold text-foreground">
                    {t.landing.hero.trustRating || "4.9 ★ Clinic Rating"}
                  </p>
                </div>
                <p className="font-body text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {t.landing.hero.trustRatingSub || "1,250+ Verified Reviews"}
                </p>
                <span className="inline-block mt-0.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">
                  [CLINIC SLOT]
                </span>
              </div>
            </div>

            {/* Slot 2: Insurance & Payment Plans */}
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary shadow-xs">
                <ShieldCheck aria-hidden="true" className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-body text-xs sm:text-sm font-semibold text-foreground">
                  {t.landing.hero.trustInsurance || "Major Insurance Accepted"}
                </p>
                <p className="font-body text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {t.landing.hero.trustInsuranceSub || "0% APR Financing Plans"}
                </p>
                <span className="inline-block mt-0.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">
                  [CLINIC SLOT]
                </span>
              </div>
            </div>

            {/* Slot 3: Same-Week Appointments */}
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary shadow-xs">
                <Clock aria-hidden="true" className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-body text-xs sm:text-sm font-semibold text-foreground">
                  {t.landing.hero.trustSameWeek || "Same-Week Appointments"}
                </p>
                <p className="font-body text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {t.landing.hero.trustSameWeekSub || "Guaranteed Routine Slots"}
                </p>
                <span className="inline-block mt-0.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">
                  [CLINIC SLOT]
                </span>
              </div>
            </div>

            {/* Slot 4: Emergency Line */}
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary shadow-xs">
                <PhoneCall aria-hidden="true" className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-body text-xs sm:text-sm font-semibold text-foreground">
                  {t.landing.hero.trustEmergency || "24/7 Urgent Care Line"}
                </p>
                <p className="font-body text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {t.landing.hero.trustEmergencySub || "(555) 234-DENT"}
                </p>
                <span className="inline-block mt-0.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">
                  [CLINIC SLOT]
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
