"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, GraduationCap, HeartHandshake, Languages, Stethoscope } from "lucide-react";
import { ExpandableCard } from "@/components/shared/expandable-card";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { Doctor } from "@/data/mock/catalog";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

const DOCTOR_FALLBACK_IMAGES = [
  "/images/demo/doctor.jpg",
  "/images/demo/doctor-omar.jpg",
  "/images/demo/doctor-nour.jpg",
  "/images/demo/doctor-adam.jpg",
] as const;

const CAIRO_WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

function formatDoctorSchedule(doctor: Doctor, weekdaysShort: readonly string[], fallback: string): string {
  const byDay = new Map((doctor.workingHours ?? []).map((h) => [h.dayOfWeek, h]));
  const openInWeekOrder = CAIRO_WEEK_ORDER.map((day) => byDay.get(day)).filter(
    (h): h is NonNullable<typeof h> => Boolean(h && !h.isOff && h.startTime && h.endTime)
  );
  if (!openInWeekOrder.length) return fallback;

  // Group adjacent working days (following Saturday-first clinic week) into readable ranges like "Sat–Thu"
  const ranges: number[][] = [];
  for (const entry of openInWeekOrder) {
    const orderIdx = CAIRO_WEEK_ORDER.indexOf(entry.dayOfWeek as (typeof CAIRO_WEEK_ORDER)[number]);
    const prevRange = ranges[ranges.length - 1];
    if (prevRange && orderIdx === prevRange[prevRange.length - 1] + 1) {
      prevRange.push(orderIdx);
    } else {
      ranges.push([orderIdx]);
    }
  }

  const daysLabel = ranges
    .map((group) => {
      const firstDay = weekdaysShort[CAIRO_WEEK_ORDER[group[0]]] ?? "";
      if (group.length === 1) return firstDay;
      if (group.length === 2) return `${firstDay}, ${weekdaysShort[CAIRO_WEEK_ORDER[group[1]]] ?? ""}`;
      return `${firstDay}–${weekdaysShort[CAIRO_WEEK_ORDER[group[group.length - 1]]] ?? ""}`;
    })
    .join(", ");

  const first = openInWeekOrder[0];
  return `${daysLabel} · ${first.startTime}–${first.endTime}`;
}

export function LandingDoctors() {
  const { doctors, services } = useClinic();
  const { locale, t } = useI18n();
  const [showAll, setShowAll] = useState(false);

  const visibleDoctors = showAll ? doctors : doctors.slice(0, 5);
  const hasMoreDoctors = doctors.length > 5;

  const gridColumnsClass =
    visibleDoctors.length <= 3
      ? "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6"
      : visibleDoctors.length === 4
        ? "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6"
        : "mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-6";

  const copySection = t.landing.doctorsSection;

  return (
    <section
      aria-labelledby="doctors-title"
      className="scroll-mt-32 bg-background px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16"
      data-reveal="section"
      id="doctors"
    >
      <div className="mx-auto w-full max-w-none">
        <div className="mx-auto max-w-2xl text-center" data-reveal="content">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {copySection.eyebrow}
          </p>
          <h2
            className="font-display mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            id="doctors-title"
          >
            {copySection.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copySection.body}
          </p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            {copySection.clickHint}
          </p>
        </div>

        {visibleDoctors.length ? (
          <div className={gridColumnsClass}>
            {visibleDoctors.map((doctor, index) => {
              const copy = localizedDoctor(doctor, locale);
              const scheduleSummary = formatDoctorSchedule(
                doctor,
                copySection.weekdaysShort,
                copySection.defaultSchedule
              );
              const offeredServices = services.filter((srv) => doctor.serviceIds.includes(srv.id));
              const imageSrc =
                copy.image || DOCTOR_FALLBACK_IMAGES[index % DOCTOR_FALLBACK_IMAGES.length];
              const badgeText = copy.experienceBadge || copySection.fallbackProfile.badge;
              const credentials = copy.credentials || copySection.fallbackProfile.education;
              const experience = copy.experienceSummary || copySection.fallbackProfile.experience;
              const languages = copy.languages || copySection.fallbackProfile.languages;
              const comfort = copy.comfortFocus || copySection.fallbackProfile.comfort;

              return (
                <ExpandableCard
                  key={doctor.id}
                  title={copy.name}
                  src={imageSrc}
                  description={copy.bio}
                  category={copy.specialty}
                  badgeText={badgeText}
                  imageClassName="object-top"
                  className="p-4 sm:p-5"
                  classNameExpanded="[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3.5 [&_h4:first-child]:mt-0 [&_h4]:mb-1.5 [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed"
                >
                  <h4>{copySection.aboutHeading}</h4>
                  <p>{copy.bio}</p>

                  <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-brand-border/80 bg-brand-subtle/40 p-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <GraduationCap aria-hidden="true" className="size-4 text-brand-primary" />
                        {copySection.credentialsLabel}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {credentials}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border/80 bg-brand-subtle/40 p-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Stethoscope aria-hidden="true" className="size-4 text-brand-primary" />
                        {copySection.experienceLabel}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {experience}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border/80 bg-brand-subtle/40 p-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Languages aria-hidden="true" className="size-4 text-brand-primary" />
                        {copySection.languagesLabel}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {languages}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border/80 bg-brand-subtle/40 p-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Clock aria-hidden="true" className="size-4 text-brand-primary" />
                        {copySection.scheduleLabel}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground tabular-nums">
                        {scheduleSummary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 w-full rounded-xl border border-brand-border/80 bg-muted/40 p-3.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <HeartHandshake aria-hidden="true" className="size-4 text-brand-primary" />
                      {copySection.comfortLabel}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {comfort}
                    </p>
                  </div>

                  <h4>{copySection.proceduresHeading}</h4>
                  {offeredServices.length ? (
                    <div className="flex flex-wrap gap-2">
                      {offeredServices.map((srv) => (
                        <Link
                          key={srv.id}
                          href={`/book?serviceId=${encodeURIComponent(srv.id)}&doctorId=${encodeURIComponent(doctor.id)}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-brand-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:border-brand-primary hover:bg-brand-subtle"
                        >
                          {localizedService(srv, locale).title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p>{copySection.noProcedures}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-3.5 w-full">
                    <Link
                      href={`/book?doctorId=${encodeURIComponent(doctor.id)}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
                    >
                      <CalendarCheck aria-hidden="true" className="size-4" />
                      {interpolate(copySection.bookWithDoctor, { name: copy.name })}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {copySection.placeboNote}
                    </span>
                  </div>
                </ExpandableCard>
              );
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-brand-border p-7 text-sm text-muted-foreground">
            {copySection.empty}
          </p>
        )}

        {hasMoreDoctors && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-brand-border px-6 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-ring"
            >
              {showAll
                ? copySection.showFewer
                : interpolate(copySection.showAll, { count: doctors.length })}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
