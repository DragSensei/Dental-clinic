export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeStorageKey = "dental-demo-locale";

export const localeDirection: Readonly<Record<Locale, "ltr" | "rtl">> = { en: "ltr", ar: "rtl" };
export const documentLang: Readonly<Record<Locale, string>> = { en: "en-US", ar: "ar" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
