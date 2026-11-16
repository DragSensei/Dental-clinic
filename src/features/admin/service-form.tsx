"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Languages,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  DEFAULT_SERVICE_IMAGE,
  SERVICE_CATEGORIES,
  SERVICE_IMAGE_PRESETS,
  services as seedServices,
  type Doctor,
  type Service,
  type ServiceExtendedDetails,
  type ServiceLanguageMode,
} from "@/data/mock/catalog";
import { getServiceCategoryLabel, localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { errorKeyFrom } from "@/i18n/errors";
import { interpolate } from "@/i18n/format";
import { dictionaries, type ErrorKey } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { useI18n } from "@/i18n/locale-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { AppCombobox } from "@/components/ui/combobox";
import { PageTitle, Panel, field, labelClass } from "@/features/admin/admin-ui";
import { AlertErrorWithEverything } from "@/components/shared/alert-error";
import { ExpandableCard } from "@/components/shared/expandable-card";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120] as const;

type ExtendedDraft = {
  overview: string;
  procedure: string;
  benefits: string;
  aftercare: string;
};

const EMPTY_EXTENDED: ExtendedDraft = {
  overview: "",
  procedure: "",
  benefits: "",
  aftercare: "",
};

function toExtendedDraft(details?: ServiceExtendedDetails): ExtendedDraft {
  return {
    overview: details?.overview ?? "",
    procedure: details?.procedure ?? "",
    benefits: details?.benefits ?? "",
    aftercare: details?.aftercare ?? "",
  };
}

function toOptionalExtended(draft: ExtendedDraft): ServiceExtendedDetails | undefined {
  const overview = draft.overview.trim();
  const procedure = draft.procedure.trim();
  const benefits = draft.benefits.trim();
  const aftercare = draft.aftercare.trim();
  if (!overview && !procedure && !benefits && !aftercare) return undefined;
  return { overview, procedure, benefits, aftercare };
}

function resolveInitialDraft(service?: Service) {
  if (!service) {
    return {
      mode: "bilingual" as ServiceLanguageMode,
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      category: "Preventive Care",
      duration: "45",
      image: DEFAULT_SERVICE_IMAGE,
      extendedEn: { ...EMPTY_EXTENDED },
      extendedAr: { ...EMPTY_EXTENDED },
    };
  }

  const mode: ServiceLanguageMode = service.defaultLocale ?? "bilingual";
  const seed = seedServices.find((item) => item.id === service.id);
  const arResolved = localizedService(service, "ar");

  const titleEn = mode === "ar" ? "" : service.title;
  const descriptionEn = mode === "ar" ? "" : service.description;
  const titleAr =
    mode === "en"
      ? ""
      : service.titleAr ?? (seed && service.title === seed.title ? arResolved.title : "");
  const descriptionAr =
    mode === "en"
      ? ""
      : service.descriptionAr ??
        (seed && service.description === seed.description ? arResolved.description : "");

  const extendedEn =
    mode === "ar" ? { ...EMPTY_EXTENDED } : toExtendedDraft(service.extendedDetails);
  const extendedAr =
    mode === "en"
      ? { ...EMPTY_EXTENDED }
      : toExtendedDraft(
          service.extendedDetailsAr ??
            (seed && service.extendedDetails?.overview === seed.extendedDetails?.overview
              ? seed.extendedDetailsAr
              : undefined)
        );

  return {
    mode,
    titleEn,
    titleAr,
    descriptionEn,
    descriptionAr,
    category: service.category || "Preventive Care",
    duration: String(service.durationMinutes ?? 45),
    image: service.image || DEFAULT_SERVICE_IMAGE,
    extendedEn,
    extendedAr,
  };
}

function countFilledSections(draft: ExtendedDraft): number {
  return [draft.overview, draft.procedure, draft.benefits, draft.aftercare].filter(
    (v) => v.trim().length > 0
  ).length;
}

export function ServiceForm({
  mode,
  service,
  doctors = [],
  onSave,
}: {
  mode: "create" | "edit";
  service?: Service;
  doctors?: readonly Doctor[];
  onSave: (payload: Omit<Service, "id"> & { id?: string }) => Promise<unknown>;
}) {
  const { locale, t } = useI18n();
  const initial = resolveInitialDraft(service);

  const [languageMode, setLanguageMode] = useState<ServiceLanguageMode>(initial.mode);
  const [titleEn, setTitleEn] = useState(initial.titleEn);
  const [titleAr, setTitleAr] = useState(initial.titleAr);
  const [descriptionEn, setDescriptionEn] = useState(initial.descriptionEn);
  const [descriptionAr, setDescriptionAr] = useState(initial.descriptionAr);
  const [category, setCategory] = useState(initial.category);
  const [duration, setDuration] = useState(initial.duration);
  const [image, setImage] = useState(initial.image);
  const [extendedEn, setExtendedEn] = useState<ExtendedDraft>(initial.extendedEn);
  const [extendedAr, setExtendedAr] = useState<ExtendedDraft>(initial.extendedAr);
  const [clinicalOpen, setClinicalOpen] = useState(
    () =>
      countFilledSections(initial.extendedEn) > 0 ||
      countFilledSections(initial.extendedAr) > 0
  );
  const [previewLocale, setPreviewLocale] = useState<Locale>(locale);
  const [errorKey, setErrorKey] = useState<ErrorKey | "">("");
  const [customError, setCustomError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const assignedDoctors = service
    ? doctors.filter((doc) => doc.serviceIds.includes(service.id))
    : [];

  const durationNum = Number(duration);
  const previewService: Service = {
    id: service?.id ?? "preview-service",
    title:
      languageMode === "ar"
        ? titleAr.trim() || (locale === "ar" ? "عنوان الخدمة" : "Service title")
        : titleEn.trim() || "Service title",
    titleAr:
      languageMode === "en"
        ? undefined
        : titleAr.trim() || (languageMode === "bilingual" ? undefined : "عنوان الخدمة"),
    description:
      languageMode === "ar"
        ? descriptionAr.trim() || "وصف مختصر يوضح تفاصيل الزيارة والخطوات التالية."
        : descriptionEn.trim() ||
          "Clear summary explaining what this consultation covers and next steps.",
    descriptionAr:
      languageMode === "en"
        ? undefined
        : descriptionAr.trim() ||
          (languageMode === "bilingual"
            ? undefined
            : "وصف مختصر يوضح تفاصيل الزيارة والخطوات التالية."),
    defaultLocale: languageMode,
    durationMinutes:
      Number.isInteger(durationNum) && durationNum >= 15 && durationNum <= 180
        ? durationNum
        : 45,
    category,
    image: image.trim() || DEFAULT_SERVICE_IMAGE,
    extendedDetails: toOptionalExtended(extendedEn),
    extendedDetailsAr: toOptionalExtended(extendedAr),
  };
  const previewCopy = localizedService(previewService, previewLocale);

  const filledCount =
    languageMode === "ar"
      ? countFilledSections(extendedAr)
      : countFilledSections(extendedEn);

  function resetForCreateAnother() {
    setLanguageMode("bilingual");
    setTitleEn("");
    setTitleAr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setCategory("Preventive Care");
    setDuration("45");
    setImage(DEFAULT_SERVICE_IMAGE);
    setExtendedEn({ ...EMPTY_EXTENDED });
    setExtendedAr({ ...EMPTY_EXTENDED });
    setClinicalOpen(false);
    setErrorKey("");
    setCustomError("");
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorKey("");
    setCustomError("");
    setSaved(false);

    const minutes = Number(duration);
    if (!Number.isInteger(minutes) || minutes < 15 || minutes > 180) {
      setErrorKey("duration_range");
      return;
    }

    if (languageMode === "bilingual") {
      if (!titleEn.trim() || !descriptionEn.trim() || !titleAr.trim() || !descriptionAr.trim()) {
        setCustomError(t.admin.services.missingBilingualError);
        return;
      }
    } else if (languageMode === "en") {
      if (!titleEn.trim() || !descriptionEn.trim()) {
        setErrorKey("invalid_service");
        return;
      }
    } else if (!titleAr.trim() || !descriptionAr.trim()) {
      setErrorKey("invalid_service");
      return;
    }

    const payload: Omit<Service, "id"> & { id?: string } = {
      ...(service ? { id: service.id } : {}),
      title: languageMode === "ar" ? titleAr.trim() : titleEn.trim(),
      description: languageMode === "ar" ? descriptionAr.trim() : descriptionEn.trim(),
      titleAr: languageMode === "en" ? undefined : titleAr.trim(),
      descriptionAr: languageMode === "en" ? undefined : descriptionAr.trim(),
      defaultLocale: languageMode,
      durationMinutes: minutes,
      category: category.trim() || "Preventive Care",
      image: image.trim() || DEFAULT_SERVICE_IMAGE,
      extendedDetails:
        languageMode === "ar"
          ? toOptionalExtended(extendedAr)
          : toOptionalExtended(extendedEn),
      extendedDetailsAr:
        languageMode === "en" ? undefined : toOptionalExtended(extendedAr),
    };

    setPending(true);
    try {
      await onSave(payload);
      setSaved(true);
    } catch (cause) {
      setErrorKey(errorKeyFrom(cause, "save_service_failed"));
    } finally {
      setPending(false);
    }
  }

  const languageModes: {
    value: ServiceLanguageMode;
    label: string;
    desc: string;
    Icon: typeof Languages;
  }[] = [
    {
      value: "bilingual",
      label: t.admin.services.modeBilingual,
      desc: t.admin.services.modeBilingualDesc,
      Icon: Languages,
    },
    {
      value: "en",
      label: t.admin.services.modeEnOnly,
      desc: t.admin.services.modeEnOnlyDesc,
      Icon: Globe,
    },
    {
      value: "ar",
      label: t.admin.services.modeArOnly,
      desc: t.admin.services.modeArOnlyDesc,
      Icon: Globe,
    },
  ];

  const categoryOptions = SERVICE_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: locale === "ar" ? cat.ar : cat.en,
  }));

  const clinicalFields: {
    key: keyof ExtendedDraft;
    label: string;
    placeholderEn: string;
    placeholderAr: string;
  }[] = [
    {
      key: "overview",
      label: t.admin.services.overviewLabel,
      placeholderEn: "What this care area addresses and who it helps…",
      placeholderAr: "نظرة عامة حول ما يعالجه هذا القسم ولمن يناسب…",
    },
    {
      key: "procedure",
      label: t.admin.services.procedureLabel,
      placeholderEn: "Step-by-step description of the patient experience…",
      placeholderAr: "وصف مبسط لخطوات الإجراء وما يتوقعه المريض…",
    },
    {
      key: "benefits",
      label: t.admin.services.benefitsLabel,
      placeholderEn: "Key clinical outcomes and patient comfort advantages…",
      placeholderAr: "أبرز الفوائد العلاجية والراحة طويلة الأمد للمريض…",
    },
    {
      key: "aftercare",
      label: t.admin.services.aftercareLabel,
      placeholderEn: "Recovery guidance and everyday maintenance habits…",
      placeholderAr: "إرشادات العناية المنزلية والمتابعة بعد الزيارة…",
    },
  ];

  const showEn = languageMode === "bilingual" || languageMode === "en";
  const showAr = languageMode === "bilingual" || languageMode === "ar";
  const isTwoColCopy = languageMode === "bilingual";
  const previewDict = dictionaries[previewLocale];

  return (
    <MotionConfig reducedMotion="user">
      <PageTitle
        title={mode === "create" ? t.admin.services.createTitle : t.admin.services.editTitle}
        description={
          mode === "create" ? t.admin.services.createBody : t.admin.services.editBody
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {mode === "edit" && service && (
              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "min-h-11 inline-flex items-center gap-2",
                })}
                href={`/services/${service.id}`}
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                {t.admin.services.viewPublicPage}
              </Link>
            )}
            <Link
              className={buttonVariants({
                variant: "outline",
                className: "min-h-11 inline-flex items-center gap-2",
              })}
              href="/admin/services"
            >
              <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
              {t.admin.services.backToServices}
            </Link>
          </div>
        }
      />

      {mode === "create" && saved ? (
        <Panel className="max-w-2xl">
          <div className="py-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary">
              <CheckCircle2 aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {t.admin.services.created}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {previewCopy.title} · {interpolate(t.admin.services.minutes, { count: previewService.durationMinutes })}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                className={buttonVariants({
                  variant: "accent",
                  className: "min-h-11 font-semibold",
                })}
                href="/admin/services"
              >
                {t.admin.services.backToServices}
              </Link>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={resetForCreateAnother}
              >
                {t.admin.services.createAnother}
              </Button>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Section 1: Language & Copy */}
            <Panel>
              <div className="mb-5">
                <h2 className="text-base font-semibold tracking-tight">
                  {t.admin.services.languageSectionTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.admin.services.languageSectionBody}
                </p>
              </div>

              <div role="radiogroup" aria-label={t.admin.services.languageSectionTitle} className="grid gap-3 sm:grid-cols-3">
                {languageModes.map((opt) => {
                  const Icon = opt.Icon;
                  const selected = languageMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setLanguageMode(opt.value);
                        setCustomError("");
                        setErrorKey("");
                      }}
                      className={`flex min-h-16 flex-col items-start rounded-xl border p-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span
                          className={`grid size-7 place-items-center rounded-md ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span
                          aria-hidden="true"
                          className={`grid size-4 place-items-center rounded-full border ${
                            selected ? "border-primary" : "border-muted-foreground/50"
                          }`}
                        >
                          {selected && <span className="size-2 rounded-full bg-primary" />}
                        </span>
                      </div>
                      <span className="mt-2.5 text-sm font-semibold text-foreground">
                        {opt.label}
                      </span>
                      <span className="mt-1 text-xs leading-5 text-muted-foreground">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={languageMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`mt-6 grid gap-5 ${
                    isTwoColCopy ? "lg:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                {showEn && (
                  <div
                    dir="ltr"
                    className="space-y-4 rounded-xl border border-border bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-brand-subtle px-2.5 py-1 text-xs font-semibold text-brand-primary">
                        {t.admin.services.englishBadge}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {titleEn.length}/80
                      </span>
                    </div>

                    <label className={labelClass}>
                      {isTwoColCopy
                        ? t.admin.services.serviceNameEn
                        : t.admin.services.serviceName}
                      <input
                        className={field}
                        required={showEn}
                        maxLength={80}
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder={t.admin.services.serviceNamePlaceholderEn}
                      />
                    </label>

                    <label className={labelClass}>
                      <span className="flex items-center justify-between gap-2">
                        <span>
                          {isTwoColCopy
                            ? t.admin.services.descriptionEn
                            : t.admin.services.descriptionLabel}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground tabular-nums">
                          {descriptionEn.length}/300
                        </span>
                      </span>
                      <textarea
                        className={`${field} min-h-28 py-3`}
                        required={showEn}
                        maxLength={300}
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        placeholder={t.admin.services.descriptionPlaceholderEn}
                      />
                    </label>
                  </div>
                )}

                {showAr && (
                  <div
                    dir="rtl"
                    className="space-y-4 rounded-xl border border-border bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-brand-subtle px-2.5 py-1 text-xs font-semibold text-brand-primary">
                        {t.admin.services.arabicBadge}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {titleAr.length}/80
                      </span>
                    </div>

                    <label className={labelClass}>
                      {isTwoColCopy
                        ? t.admin.services.serviceNameAr
                        : t.admin.services.serviceName}
                      <input
                        className={field}
                        required={showAr}
                        maxLength={80}
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        placeholder={t.admin.services.serviceNamePlaceholderAr}
                      />
                    </label>

                    <label className={labelClass}>
                      <span className="flex items-center justify-between gap-2">
                        <span>
                          {isTwoColCopy
                            ? t.admin.services.descriptionAr
                            : t.admin.services.descriptionLabel}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground tabular-nums">
                          {descriptionAr.length}/300
                        </span>
                      </span>
                      <textarea
                        className={`${field} min-h-28 py-3`}
                        required={showAr}
                        maxLength={300}
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder={t.admin.services.descriptionPlaceholderAr}
                      />
                    </label>
                  </div>
                )}
                </motion.div>
              </AnimatePresence>
            </Panel>

            {/* Section 2: Category, Duration & Visual Presentation */}
            <Panel>
              <div className="mb-5">
                <h2 className="text-base font-semibold tracking-tight">
                  {t.admin.services.detailsSectionTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.admin.services.detailsSectionBody}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <AppCombobox
                  label={t.admin.services.categoryLabel}
                  options={categoryOptions}
                  value={category}
                  onValueChange={setCategory}
                  placeholder={t.admin.services.categoryLabel}
                />

                <div className="grid gap-2">
                  <label htmlFor="service-duration-input" className="text-sm font-medium">
                    {t.admin.services.duration}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {DURATION_PRESETS.map((preset) => {
                      const active = Number(duration) === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDuration(String(preset))}
                          className={`min-h-11 rounded-full px-3.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                            active
                              ? "bg-action text-action-foreground shadow-xs"
                              : "bg-muted text-muted-foreground hover:bg-brand-subtle hover:text-foreground"
                          }`}
                        >
                          {interpolate(t.admin.services.minutes, { count: preset })}
                        </button>
                      );
                    })}
                    <input
                      id="service-duration-input"
                      className={`${field} w-24 tabular-nums`}
                      type="number"
                      min={15}
                      max={180}
                      step={1}
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.admin.services.durationHint}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon aria-hidden="true" className="size-4 text-brand-primary" />
                  <span>{t.admin.services.coverImageLabel}</span>
                </div>

                <div className="mt-3 grid gap-4">
                  <label className={labelClass}>
                    <span className="text-xs font-normal text-muted-foreground">
                      {t.admin.services.imageUrlLabel}
                    </span>
                    <input
                      className={field}
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder={t.admin.services.imageUrlPlaceholder}
                    />
                  </label>

                  <div>
                    <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                      {t.admin.services.imagePresetsLabel}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                      {SERVICE_IMAGE_PRESETS.map((preset) => {
                        const selected = image.trim() === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setImage(preset.url)}
                            className={`group relative overflow-hidden rounded-xl border text-start transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                              selected
                                ? "border-primary ring-2 ring-ring"
                                : "border-border hover:border-brand-primary/50"
                            }`}
                          >
                            <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                              <img
                                src={preset.url}
                                alt={locale === "ar" ? preset.labelAr : preset.labelEn}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                            </div>
                            <span className="block truncate px-2 py-1.5 text-xs font-medium text-foreground">
                              {locale === "ar" ? preset.labelAr : preset.labelEn}
                            </span>
                            {selected && (
                              <span className="absolute top-1.5 end-1.5 grid size-5 place-items-center rounded-full bg-action text-action-foreground shadow-xs">
                                <Check aria-hidden="true" className="size-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Section 3: Clinical & Patient Guide Details */}
            <Panel>
              <button
                type="button"
                aria-expanded={clinicalOpen}
                onClick={() => setClinicalOpen((open) => !open)}
                className="flex min-h-11 w-full items-center justify-between gap-4 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand-primary">
                    <FileText aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">
                      {t.admin.services.clinicalSectionTitle}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t.admin.services.clinicalSectionBody}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground tabular-nums">
                    {interpolate(t.admin.services.clinicalFilledCount, { count: filledCount })}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${
                      clinicalOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {clinicalOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-5 border-t border-border pt-6">
                      {clinicalFields.map((item) => (
                        <div key={item.key} className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <div
                            className={`grid gap-4 ${
                              isTwoColCopy ? "lg:grid-cols-2" : "grid-cols-1"
                            }`}
                          >
                            {showEn && (
                              <div dir="ltr" className="space-y-1.5">
                                {isTwoColCopy && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {t.admin.services.englishBadge}
                                  </span>
                                )}
                                <textarea
                                  className={`${field} min-h-24 py-2.5`}
                                  maxLength={2000}
                                  value={extendedEn[item.key]}
                                  onChange={(e) =>
                                    setExtendedEn((prev) => ({
                                      ...prev,
                                      [item.key]: e.target.value,
                                    }))
                                  }
                                  placeholder={item.placeholderEn}
                                />
                              </div>
                            )}
                            {showAr && (
                              <div dir="rtl" className="space-y-1.5">
                                {isTwoColCopy && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {t.admin.services.arabicBadge}
                                  </span>
                                )}
                                <textarea
                                  className={`${field} min-h-24 py-2.5`}
                                  maxLength={2000}
                                  value={extendedAr[item.key]}
                                  onChange={(e) =>
                                    setExtendedAr((prev) => ({
                                      ...prev,
                                      [item.key]: e.target.value,
                                    }))
                                  }
                                  placeholder={item.placeholderAr}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>

            {(errorKey || customError) && (
              <AlertErrorWithEverything
                description={customError || (errorKey ? t.errors[errorKey] : "")}
                onDismiss={() => {
                  setErrorKey("");
                  setCustomError("");
                }}
                dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
              />
            )}

            {saved && mode === "edit" && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-brand-subtle px-4 py-3 text-sm font-medium text-brand-primary"
              >
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                <span>{t.admin.services.saved}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:px-6">
              <Link
                href="/admin/services"
                className={buttonVariants({ variant: "outline", className: "min-h-11" })}
              >
                {t.admin.services.backToServices}
              </Link>
              <Button
                type="submit"
                variant="accent"
                className="min-h-11 min-w-44 font-semibold shadow-xs"
                disabled={pending}
              >
                {pending
                  ? t.admin.services.saving
                  : mode === "create"
                  ? t.admin.services.createSubmit
                  : t.admin.services.save}
              </Button>
            </div>
          </form>

          {/* Right Column: Live Patient Card Preview + Clinician Context */}
          <aside className="space-y-4 xl:sticky xl:top-20">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    <Sparkles aria-hidden="true" className="size-3.5" />
                    <span>{t.admin.services.previewTitle}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.admin.services.previewSubtitle}
                  </p>
                </div>

                <div
                  role="group"
                  aria-label={t.admin.services.previewLanguageLabel}
                  className="inline-flex rounded-full border border-border bg-muted p-1"
                >
                  {(["en", "ar"] as const).map((lang) => {
                    const active = previewLocale === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setPreviewLocale(lang)}
                        className={`relative min-h-11 min-w-11 rounded-full px-3 text-xs font-semibold transition-colors ${
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="service-preview-locale-pill"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-card shadow-xs"
                          />
                        )}
                        <span className="relative z-10">{lang === "en" ? "EN" : "العربية"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div dir={previewLocale === "ar" ? "rtl" : "ltr"} className="mt-4">
                <ExpandableCard
                  key={`preview-${previewService.id}-${previewLocale}`}
                  title={previewCopy.title}
                  src={previewService.image}
                  description={previewCopy.description}
                  category={getServiceCategoryLabel(previewService.category, previewLocale)}
                  duration={previewService.durationMinutes}
                  dir={previewLocale === "ar" ? "rtl" : "ltr"}
                  className="w-full"
                  classNameExpanded="[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3.5 [&_h4:first-child]:mt-0 [&_h4]:mb-1 [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed"
                >
                  <h4>{previewDict.services.card.overviewHeading}</h4>
                  <p>{previewCopy.extendedDetails?.overview || previewCopy.description}</p>

                  <h4>{previewDict.services.card.procedureHeading}</h4>
                  <p>
                    {previewCopy.extendedDetails?.procedure ||
                      (previewLocale === "ar"
                        ? "يستخدم فريقنا الطبي أحدث تقنيات التصوير التشخيصي والبروتوكولات اللطيفة لضمان راحتك الكاملة طوال الزيارة."
                        : "Our experienced clinical team utilizes modern diagnostic imaging, gentle dental protocols, and sterile instrumentation to ensure complete comfort throughout your visit.")}
                  </p>

                  <h4>{previewDict.services.card.benefitsHeading}</h4>
                  <p>
                    {previewCopy.extendedDetails?.benefits ||
                      (previewLocale === "ar"
                        ? "يحافظ على صحة الفم، ويستعيد الوظيفة الطبيعية والمظهر المتناسق، ويدعم صحة الأسنان على المدى الطويل."
                        : "Preserves your oral health, restores full biting function, enhances smile aesthetics, and supports lasting dental wellness.")}
                  </p>

                  <h4>{previewDict.services.card.aftercareHeading}</h4>
                  <p>
                    {previewCopy.extendedDetails?.aftercare ||
                      (previewLocale === "ar"
                        ? "حافظ على التفريش والخيط يوميًا، واتبع إرشادات العناية المنزلية الموصى بها، والتزم بالمتابعة الدورية."
                        : "Maintain everyday brushing and flossing, follow personalized home-care recommendations, and attend routine examinations.")}
                  </p>

                  <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-3.5">
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground shadow-sm">
                      <CalendarCheck aria-hidden="true" className="size-4" />
                      {previewDict.services.card.bookNow}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {interpolate(previewDict.services.card.consultationDuration, {
                        count: previewService.durationMinutes,
                      })}
                    </span>
                  </div>
                </ExpandableCard>
              </div>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                {t.admin.services.previewClickHint}
              </p>

              <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {languageMode === "en"
                  ? t.admin.services.previewDefaultingToEn
                  : languageMode === "ar"
                  ? t.admin.services.previewDefaultingToAr
                  : titleAr.trim() && descriptionAr.trim()
                  ? t.admin.services.previewBilingualReady
                  : t.admin.services.previewNeedsAr}
              </p>
            </Panel>

            {mode === "edit" && (
              <Panel>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Stethoscope aria-hidden="true" className="size-4 text-brand-primary" />
                  <span>{t.admin.services.assignedClinicians}</span>
                </div>
                {assignedDoctors.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {assignedDoctors.map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/admin/doctors/${doc.id}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-3.5 text-xs font-medium hover:bg-brand-subtle"
                        >
                          {localizedDoctor(doc, locale).name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {t.admin.services.noAssignedClinicians}
                  </p>
                )}
              </Panel>
            )}
          </aside>
        </div>
      )}
    </MotionConfig>
  );
}
