"use client";

import { AppCombobox } from "@/components/ui/combobox";
import { useI18n } from "@/i18n/locale-provider";
import { isLocale, locales } from "@/i18n/locales";

// Read-only: the language is chosen from the list, never typed.
export function LanguageCombobox({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const options = locales.map((code) => ({ value: code, label: t.language.native[code] }));

  return <AppCombobox className={className} hideLabel label={t.language.label} onValueChange={(next) => { if (isLocale(next)) setLocale(next); }} options={options} readOnly value={locale} />;
}
