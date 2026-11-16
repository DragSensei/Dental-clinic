"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Doctor, Service } from "@/data/mock/catalog";
import { getServiceCategoryLabel, localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Clock3, Plus, Search, Stethoscope, X } from "lucide-react";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { PageTitle, Panel, field } from "@/features/admin/admin-ui";
import { DoctorForm } from "@/features/admin/doctor-form";
import { ServiceForm } from "@/features/admin/service-form";

export function Doctors({ doctors }: { doctors: readonly Doctor[] }) {
  const { locale, t } = useI18n();
  return (
    <MotionConfig reducedMotion="user">
      <PageTitle title={t.admin.doctors.title} description={t.admin.doctors.description} />
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor, index) => {
          const copy = localizedDoctor(doctor, locale);
          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.04, 0.18),
                ease: "easeOut",
              }}
              whileHover={{ y: -3 }}
              className="h-full"
            >
              <Panel className="group flex h-full flex-col justify-between gap-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/45 hover:shadow-md">
                <div>
                  <h2 className="text-lg font-semibold transition-colors duration-200 group-hover:text-brand-primary">
                    {copy.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{copy.specialty}</p>
                  <p className="mt-4 text-sm leading-6">{copy.bio}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {interpolate(t.admin.doctors.linked, { count: doctor.serviceIds.length })}
                  </p>
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      className: "group/btn min-h-11 inline-flex items-center gap-1.5 transition-colors group-hover:border-primary/40",
                    })}
                    href={`/admin/doctors/${doctor.id}`}
                  >
                    <span>{t.admin.doctors.editProfile}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 rtl:rotate-180 rtl:group-hover/btn:-translate-x-0.5"
                    />
                  </Link>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>
    </MotionConfig>
  );
}

export function DoctorEditor({ id, doctors, services, save }: { id: string; doctors: readonly Doctor[]; services: readonly Service[]; save: (doctor: Doctor) => Promise<unknown> }) {
  const { t } = useI18n();
  const doctor = doctors.find((person) => person.id === id);
  if (!doctor) return <PageTitle title={t.admin.doctors.notFoundTitle} description={t.admin.doctors.notFoundBody}/>;
  return <DoctorForm key={doctor.id} doctor={doctor} services={services} save={save} />;
}

function serviceLanguageBadge(service: Service, t: ReturnType<typeof useI18n>["t"]) {
  if (service.defaultLocale === "en") return t.admin.services.badgeEnDefault;
  if (service.defaultLocale === "ar") return t.admin.services.badgeArDefault;
  return service.titleAr?.trim() ? t.admin.services.badgeBilingual : t.admin.services.badgeEnDefault;
}

export function Services({ services, doctors = [] }: { services: readonly Service[]; doctors?: readonly Doctor[] }) {
  const { locale, t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category || "Preventive Care")))];
  const categoryCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "all"
      ? services.length
      : services.filter((s) => (s.category || "Preventive Care") === cat).length;
    return acc;
  }, {});

  const normalizedQuery = query.trim().toLowerCase();

  const filteredServices = services.filter((service) => {
    const category = service.category || "Preventive Care";
    if (selectedCategory !== "all" && category !== selectedCategory) return false;
    if (!normalizedQuery) return true;
    const copy = localizedService(service, locale);
    const haystack = [
      service.title,
      service.titleAr ?? "",
      service.description,
      service.descriptionAr ?? "",
      category,
      copy.categoryLabel,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (
    <MotionConfig reducedMotion="user">
      <PageTitle
        title={t.admin.services.title}
        description={t.admin.services.description}
        action={
          <Link
            className={buttonVariants({ variant: "accent", className: "min-h-11 inline-flex items-center gap-2 font-semibold shadow-xs transition-transform active:scale-[0.98]" })}
            href="/admin/services/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t.admin.services.createService}
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="mb-6 grid gap-4"
      >
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.admin.services.searchPlaceholder}
            aria-label={t.admin.services.searchPlaceholder}
            className={`${field} ps-10 pe-11`}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                aria-label="Clear search"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.14 }}
                onClick={() => setQuery("")}
                className="absolute end-1 top-1/2 grid size-10 min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  active
                    ? "text-primary-foreground font-semibold"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-services-category-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary shadow-xs"
                  />
                )}
                <span className="relative z-10">
                  {cat === "all" ? (locale === "ar" ? "جميع التخصصات" : "All categories") : getServiceCategoryLabel(cat, locale)}
                </span>
                <span
                  className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {categoryCounts[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {filteredServices.length === 0 ? (
          <motion.div
            key={`services-empty-${selectedCategory}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <Panel>
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t.admin.services.emptySearch}</p>
                {(query || selectedCategory !== "all") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      setQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    {locale === "ar" ? "إعادة ضبط التصفية" : "Reset filters"}
                  </Button>
                )}
              </div>
            </Panel>
          </motion.div>
        ) : (
          <motion.div
            key={`services-grid-${selectedCategory}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="grid gap-4 md:grid-cols-2"
          >
            {filteredServices.map((service, index) => {
              const copy = localizedService(service, locale);
              const assignedCount = doctors.filter((doctor) => doctor.serviceIds.includes(service.id)).length;
              const secondaryTitle =
                service.defaultLocale !== "en" &&
                service.defaultLocale !== "ar" &&
                service.titleAr?.trim()
                  ? locale === "ar"
                    ? service.title
                    : service.titleAr
                  : "";

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.03, 0.18),
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Panel className="group flex h-full flex-col justify-between gap-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/45 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      {service.image ? (
                        <div className="hidden size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:block">
                          <img
                            src={service.image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {copy.categoryLabel}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {serviceLanguageBadge(service, t)}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-brand-primary">
                          {copy.title}
                        </h2>
                        {secondaryTitle ? (
                          <p className="mt-0.5 text-xs text-muted-foreground" dir={locale === "ar" ? "ltr" : "rtl"}>
                            {secondaryTitle}
                          </p>
                        ) : null}
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{copy.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 tabular-nums">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          {interpolate(t.admin.services.minutes, { count: service.durationMinutes })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <Stethoscope aria-hidden="true" className="size-3.5" />
                          {assignedCount}
                        </span>
                      </div>
                      <Link
                        className={buttonVariants({
                          variant: "outline",
                          className: "group/btn min-h-11 inline-flex items-center gap-1.5 transition-colors group-hover:border-primary/40",
                        })}
                        href={`/admin/services/${service.id}`}
                      >
                        <span>{t.admin.services.editService}</span>
                        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 rtl:rotate-180 rtl:group-hover/btn:-translate-x-0.5" />
                      </Link>
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export function ServiceCreator({ save }: { save: (service: Omit<Service, "id">) => Promise<unknown> }) {
  return <ServiceForm mode="create" onSave={save} />;
}

export function ServiceEditor({
  id,
  services,
  doctors = [],
  save,
}: {
  id: string;
  services: readonly Service[];
  doctors?: readonly Doctor[];
  save: (service: Service) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const service = services.find((item) => item.id === id);

  if (!service) {
    return <PageTitle title={t.admin.services.notFoundTitle} description={t.admin.services.notFoundBody} />;
  }

  return (
    <ServiceForm
      key={service.id}
      mode="edit"
      service={service}
      doctors={doctors}
      onSave={(payload) => save({ ...service, ...payload, id: service.id })}
    />
  );
}
