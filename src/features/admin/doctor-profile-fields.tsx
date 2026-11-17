"use client";
/* eslint-disable @next/next/no-img-element */

import { DOCTOR_IMAGE_PRESETS } from "@/data/mock/catalog";
import { field, labelClass } from "@/features/admin/admin-ui";
import { useI18n } from "@/i18n/locale-provider";

export interface DoctorProfileFieldsValue {
  image: string;
  credentials: string;
  experienceBadge: string;
  experienceSummary: string;
  languages: string;
  comfortFocus: string;
}

export const EMPTY_DOCTOR_PROFILE_FIELDS: DoctorProfileFieldsValue = {
  image: "",
  credentials: "",
  experienceBadge: "",
  experienceSummary: "",
  languages: "",
  comfortFocus: "",
};

/**
 * Shared clinician card inputs for editing or creating dynamic landing card profiles.
 */
export function DoctorProfileFields({
  value,
  onChange,
  compact = false,
}: {
  value: DoctorProfileFieldsValue;
  onChange: (next: DoctorProfileFieldsValue) => void;
  compact?: boolean;
}) {
  const { locale, t } = useI18n();
  const labels = t.admin.doctors;

  function patch<K extends keyof DoctorProfileFieldsValue>(key: K, nextVal: DoctorProfileFieldsValue[K]) {
    onChange({ ...value, [key]: nextVal });
  }

  return (
    <div className="space-y-4 border-t border-border/70 pt-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{labels.profileFieldsHeading}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{labels.profileFieldsHint}</p>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-medium text-muted-foreground">
          {labels.portraitPresetsLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          {DOCTOR_IMAGE_PRESETS.map((preset) => {
            const active = value.image.trim() === preset.url;
            const presetLabel = locale === "ar" ? preset.labelAr : preset.labelEn;
            return (
              <button
                key={preset.url}
                type="button"
                aria-pressed={active}
                onClick={() => patch("image", preset.url)}
                className={`inline-flex min-h-11 max-w-full min-w-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-primary bg-brand-subtle text-brand-primary"
                    : "border-border bg-background text-foreground hover:bg-muted/60"
                }`}
              >
                <img
                  src={preset.url}
                  alt={presetLabel}
                  className="size-7 shrink-0 rounded-lg object-cover object-top"
                />
                <span className="truncate">{presetLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={`${labelClass} min-w-0`}>
          <span>{labels.portraitUrl}</span>
          <input
            className={field}
            maxLength={1000}
            value={value.image}
            onChange={(e) => patch("image", e.target.value)}
            placeholder="/images/demo/doctor.jpg"
          />
        </label>

        <label className={`${labelClass} min-w-0`}>
          <span>{labels.experienceBadge}</span>
          <input
            className={field}
            maxLength={60}
            value={value.experienceBadge}
            onChange={(e) => patch("experienceBadge", e.target.value)}
            placeholder="10 yrs exp"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={`${labelClass} min-w-0`}>
          <span>{labels.credentials}</span>
          <input
            className={field}
            maxLength={300}
            value={value.credentials}
            onChange={(e) => patch("credentials", e.target.value)}
            placeholder="BDS, MSc Restorative Dentistry"
          />
        </label>

        <label className={`${labelClass} min-w-0`}>
          <span>{labels.experienceSummary}</span>
          <input
            className={field}
            maxLength={300}
            value={value.experienceSummary}
            onChange={(e) => patch("experienceSummary", e.target.value)}
            placeholder="10 years experience · Implant specialist"
          />
        </label>
      </div>

      <label className={`${labelClass} min-w-0`}>
        <span>{labels.languages}</span>
        <input
          className={field}
          maxLength={200}
          value={value.languages}
          onChange={(e) => patch("languages", e.target.value)}
          placeholder="Arabic, English"
        />
      </label>

      <label className={`${labelClass} min-w-0`}>
        <span>{labels.comfortFocus}</span>
        <textarea
          className={`${field} ${compact ? "min-h-20" : "min-h-24"} py-2.5`}
          maxLength={1000}
          value={value.comfortFocus}
          onChange={(e) => patch("comfortFocus", e.target.value)}
          placeholder="Gentle explain-first consultations and anxiety-free diagnostics…"
        />
      </label>
    </div>
  );
}
