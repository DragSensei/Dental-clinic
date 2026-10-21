"use client";

import { AppCombobox } from "@/shared/components/ui/combobox";
import { useI18n } from "@/shared/i18n/locale-provider";
import { isLocale, locales } from "@/shared/i18n/locales";

// Read-only: the language is chosen from the list, never typed.
export function LanguageCombobox({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const options = locales.map((code) => ({ value: code, label: t.language.native[code] }));

  return <AppCombobox className={className} hideLabel label={t.language.label} onValueChange={(next) => { if (isLocale(next)) setLocale(next); }} options={options} readOnly value={locale} />;
}
