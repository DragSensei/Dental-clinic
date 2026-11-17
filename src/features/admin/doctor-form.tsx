"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Search,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import type { Doctor, Service } from "@/data/mock/catalog";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { errorKeyFrom } from "@/i18n/errors";
import { interpolate } from "@/i18n/format";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/locale-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageTitle, Panel, field, labelClass } from "@/features/admin/admin-ui";
import { AlertErrorWithEverything } from "@/components/shared/alert-error";
import {
  DoctorProfileFields,
  type DoctorProfileFieldsValue,
} from "@/features/admin/doctor-profile-fields";

const WEEKDAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const WEEKDAY_NAMES_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;

function getInitials(name: string): string {
  const cleaned = name.replace(/^(dr\.?|د\.?)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DoctorForm({
  doctor,
  services,
  save,
}: {
  doctor: Doctor;
  services: readonly Service[];
  save: (doctor: Doctor) => Promise<unknown>;
}) {
  const { locale, t } = useI18n();
  const localizedCurrent = localizedDoctor(doctor, locale);

  const [name, setName] = useState(doctor.name);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [bio, setBio] = useState(doctor.bio);
  const [profileFields, setProfileFields] = useState<DoctorProfileFieldsValue>({
    image: doctor.image ?? "",
    credentials: doctor.credentials ?? "",
    experienceBadge: doctor.experienceBadge ?? "",
    experienceSummary: doctor.experienceSummary ?? "",
    languages: doctor.languages ?? "",
    comfortFocus: doctor.comfortFocus ?? "",
  });
  const [serviceIds, setServiceIds] = useState<string[]>([...doctor.serviceIds]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [error, setError] = useState<ErrorKey | "">("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const normalizedFilter = serviceFilter.trim().toLowerCase();
  const visibleServices = services.filter((service) => {
    if (!normalizedFilter) return true;
    const copy = localizedService(service, locale);
    return `${copy.title} ${service.title} ${service.titleAr ?? ""} ${copy.categoryLabel} ${service.category}`
      .toLowerCase()
      .includes(normalizedFilter);
  });

  const assignedServices = services.filter((service) => serviceIds.includes(service.id));

  function toggleService(id: string) {
    setSaved(false);
    setError("");
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setPending(true);
    try {
      await save({
        ...doctor,
        name: name.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        image: profileFields.image.trim(),
        credentials: profileFields.credentials.trim(),
        experienceBadge: profileFields.experienceBadge.trim(),
        experienceSummary: profileFields.experienceSummary.trim(),
        languages: profileFields.languages.trim(),
        comfortFocus: profileFields.comfortFocus.trim(),
        serviceIds,
      });
      setSaved(true);
    } catch (cause) {
      setError(errorKeyFrom(cause, "save_profile_failed"));
    } finally {
      setPending(false);
    }
  }

  const weekdayNames = locale === "ar" ? WEEKDAY_NAMES_AR : WEEKDAY_NAMES_EN;
  const previewName = name.trim() || localizedCurrent.name;
  const previewSpecialty = specialty.trim() || localizedCurrent.specialty;
  const previewBio = bio.trim() || localizedCurrent.bio;

  return (
    <MotionConfig reducedMotion="user">
      <PageTitle
        title={t.admin.doctors.editTitle}
        description={t.admin.doctors.editBody}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              className={buttonVariants({
                variant: "outline",
                className: "min-h-11 inline-flex items-center gap-2",
              })}
              href={`/doctors/${doctor.id}`}
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              {t.admin.doctors.viewPublicProfile}
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
                className: "min-h-11 inline-flex items-center gap-2",
              })}
              href="/admin/accounts"
            >
              <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
              {t.admin.accounts.backToAccounts}
            </Link>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start"
      >
        <form className="min-w-0 space-y-6" onSubmit={handleSubmit}>
          {/* Section 1: Identity & Biography */}
          <Panel>
            <div className="mb-5">
              <h2 className="text-base font-semibold tracking-tight">
                {t.admin.doctors.identityTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.admin.doctors.identityBody}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                <span className="flex items-center justify-between gap-2">
                  <span>{t.admin.doctors.name}</span>
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {name.length}/80
                  </span>
                </span>
                <input
                  className={field}
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                />
              </label>

              <label className={labelClass}>
                <span className="flex items-center justify-between gap-2">
                  <span>{t.admin.doctors.specialty}</span>
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {specialty.length}/100
                  </span>
                </span>
                <input
                  className={field}
                  required
                  maxLength={100}
                  value={specialty}
                  onChange={(e) => {
                    setSpecialty(e.target.value);
                    setSaved(false);
                  }}
                />
              </label>
            </div>

            <label className={`${labelClass} mt-4`}>
              <span className="flex items-center justify-between gap-2">
                <span>{t.admin.doctors.bio}</span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {bio.length}/500
                </span>
              </span>
              <textarea
                className={`${field} min-h-32 py-3`}
                required
                maxLength={500}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSaved(false);
                }}
              />
            </label>

            <div className="mt-5">
              <DoctorProfileFields
                value={profileFields}
                onChange={(next) => {
                  setProfileFields(next);
                  setSaved(false);
                }}
              />
            </div>
          </Panel>

          {/* Section 2: Assigned Treatments */}
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight">
                    {t.admin.doctors.services}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-brand-subtle px-2.5 py-0.5 text-xs font-semibold text-brand-primary tabular-nums">
                    {interpolate(t.admin.doctors.assignedCount, {
                      selected: serviceIds.length,
                      total: services.length,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.admin.doctors.servicesBody}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 text-sm"
                  onClick={() => {
                    setServiceIds(services.map((item) => item.id));
                    setSaved(false);
                    setError("");
                  }}
                >
                  {t.admin.doctors.selectAll}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 text-sm"
                  onClick={() => {
                    setServiceIds([]);
                    setSaved(false);
                    setError("");
                  }}
                >
                  {t.admin.doctors.clearAll}
                </Button>
              </div>
            </div>

            <div className="relative mt-4">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                placeholder={t.admin.doctors.filterServicesPlaceholder}
                aria-label={t.admin.doctors.filterServicesPlaceholder}
                className={`${field} ps-10 pe-11`}
              />
              <AnimatePresence>
                {serviceFilter && (
                  <motion.button
                    type="button"
                    aria-label="Clear filter"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setServiceFilter("")}
                    className="absolute end-1 top-1/2 grid size-10 min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={visibleServices.length === 0 ? "doctor-services-empty" : "doctor-services-grid"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                {visibleServices.length === 0 ? (
                  <p className="col-span-full rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    {t.admin.services.emptySearch}
                  </p>
                ) : (
                  visibleServices.map((service, index) => {
                    const copy = localizedService(service, locale);
                    const selected = serviceIds.includes(service.id);
                    return (
                      <motion.button
                        key={service.id}
                        type="button"
                        aria-pressed={selected}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.16,
                          delay: Math.min(index * 0.02, 0.14),
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleService(service.id)}
                        className={`group flex min-h-16 items-center gap-3 rounded-xl border p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          selected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        {service.image ? (
                          <span className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <img
                              src={service.image}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </span>
                        ) : null}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {copy.title}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{copy.categoryLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock3 aria-hidden="true" className="size-3" />
                              {interpolate(t.admin.services.minutes, {
                                count: service.durationMinutes,
                              })}
                            </span>
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-transparent"
                          }`}
                        >
                          <Check className="size-3.5" />
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </Panel>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <AlertErrorWithEverything
                  description={t.errors[error]}
                  onDismiss={() => setError("")}
                  dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {saved && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-subtle px-4 py-3 text-sm font-medium text-brand-primary"
              >
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                <span>{t.admin.doctors.saved}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:px-6">
            <Link
              href="/admin/accounts"
              className={buttonVariants({ variant: "outline", className: "min-h-11" })}
            >
              {t.admin.accounts.backToAccounts}
            </Link>
            <Button
              type="submit"
              variant="accent"
              className="min-h-11 min-w-44 font-semibold shadow-xs"
              disabled={pending}
            >
              {pending ? t.admin.doctors.saving : t.admin.doctors.save}
            </Button>
          </div>
        </form>

        {/* Right Column: Live Clinician Profile Preview + Weekly Schedule */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20">
          <Panel>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <span>{t.admin.doctors.previewTitle}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.admin.doctors.previewSubtitle}
            </p>

            <div className="mt-4 rounded-2xl border border-brand-border bg-background p-5 shadow-xs">
              <div className="flex items-center gap-3.5">
                {profileFields.image.trim() ? (
                  <img
                    src={profileFields.image.trim()}
                    alt={previewName}
                    className="size-14 shrink-0 rounded-2xl object-cover object-top ring-1 ring-brand-primary/20"
                  />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-subtle text-base font-bold text-brand-primary ring-1 ring-brand-primary/20">
                    {getInitials(previewName)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Stethoscope aria-hidden="true" className="size-3 shrink-0" />
                      <span className="truncate">{previewSpecialty}</span>
                    </span>
                    {profileFields.experienceBadge.trim() && (
                      <span className="inline-flex items-center rounded-full border border-brand-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {profileFields.experienceBadge.trim()}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 truncate text-lg font-bold tracking-tight text-foreground">
                    {previewName}
                  </h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {previewBio}
              </p>

              {(profileFields.credentials.trim() || profileFields.languages.trim()) && (
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {profileFields.credentials.trim() && <p>{profileFields.credentials.trim()}</p>}
                  {profileFields.languages.trim() && <p>{profileFields.languages.trim()}</p>}
                </div>
              )}

              <div className="mt-4 border-t border-border/70 pt-3.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {t.admin.doctors.services} ({assignedServices.length})
                </p>
                {assignedServices.length > 0 ? (
                  <motion.div layout className="mt-2.5 flex flex-wrap gap-1.5">
                    <AnimatePresence mode="popLayout">
                      {assignedServices.map((service) => {
                        const copy = localizedService(service, locale);
                        return (
                          <motion.span
                            key={service.id}
                            layout
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.16 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            <span>{copy.title}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {service.durationMinutes}m
                            </span>
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    {t.admin.doctors.noServicesAssigned}
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock aria-hidden="true" className="size-4 text-brand-primary" />
              <span>{t.admin.doctors.scheduleSnapshotTitle}</span>
            </div>
            {doctor.workingHours && doctor.workingHours.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-xs">
                {doctor.workingHours.map((slot) => (
                  <li
                    key={slot.dayOfWeek}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                  >
                    <span className="font-medium text-foreground">
                      {weekdayNames[slot.dayOfWeek] ?? `Day ${slot.dayOfWeek}`}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {slot.isOff
                        ? t.admin.doctors.dayOff
                        : `${slot.startTime ?? "09:00"} – ${slot.endTime ?? "17:00"}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {t.admin.doctors.scheduleDefaultHint}
              </p>
            )}
          </Panel>
        </aside>
      </motion.div>
    </MotionConfig>
  );
}
