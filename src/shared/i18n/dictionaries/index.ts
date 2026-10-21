import type { Locale } from "@/shared/i18n/locales";
import { ar } from "@/shared/i18n/dictionaries/ar";
import { en, type Dictionary } from "@/shared/i18n/dictionaries/en";

export type { Dictionary } from "./en";
export type ErrorKey = keyof Dictionary["errors"];

export const dictionaries: Readonly<Record<Locale, Dictionary>> = { en, ar };
