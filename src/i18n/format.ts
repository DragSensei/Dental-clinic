import type { Locale } from "@/i18n/locales";

// Western digits keep times and counts consistent across both languages.
const intlLocale: Readonly<Record<Locale, string>> = { en: "en-US", ar: "ar-u-nu-latn" };

export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function formatUtcDate(date: string, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "UTC", ...options }).format(new Date(`${date}T12:00:00Z`));
}

export function formatUtcTime(time: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(new Date(`2000-01-01T${time}:00Z`));
}
