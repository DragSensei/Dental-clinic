"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { formatUtcDate, formatUtcTime } from "@/shared/i18n/format";
import { dictionaries, type Dictionary } from "@/shared/i18n/dictionaries";
import { defaultLocale, documentLang, isLocale, localeDirection, localeStorageKey, type Locale } from "@/shared/i18n/locales";

type Listener = () => void;
type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  formatDate: (date: string, options: Intl.DateTimeFormatOptions) => string;
  formatTime: (time: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const listeners = new Set<Listener>();
let currentLocale: Locale | null = null;

function readStoredLocale(): Locale {
  try {
    const value = window.localStorage.getItem(localeStorageKey);
    return isLocale(value) ? value : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Locale {
  currentLocale ??= readStoredLocale();
  return currentLocale;
}

// Hydration starts from the default locale so server HTML matches; the stored preference applies right after.
function getServerSnapshot(): Locale {
  return defaultLocale;
}

function storeLocale(next: Locale) {
  currentLocale = next;
  listeners.forEach((listener) => listener());
  try {
    window.localStorage.setItem(localeStorageKey, next);
  } catch {
    // Language switching still applies to this page view when browser storage is unavailable.
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dir = localeDirection[locale];
  const t = dictionaries[locale];

  useEffect(() => {
    document.documentElement.lang = documentLang[locale];
    document.documentElement.dir = dir;
    document.title = t.meta.title;
  }, [locale, dir, t]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    dir,
    t,
    setLocale: storeLocale,
    formatDate: (date, options) => formatUtcDate(date, locale, options),
    formatTime: (time) => formatUtcTime(time, locale),
  }), [locale, dir, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useI18n must be used within LocaleProvider.");
  return context;
}
