"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/i18n/locale-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const dark = theme === "dark";
  const label = dark ? t.theme.toLight : t.theme.toDark;

  return <button aria-label={label} aria-pressed={dark} className="group inline-grid size-11 shrink-0 place-items-center rounded-lg border border-brand-border bg-background text-brand-primary outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none" onClick={toggleTheme} title={label} type="button">
    <span className="transition-transform duration-200 group-hover:rotate-12 motion-reduce:transform-none motion-reduce:transition-none">{dark ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}</span>
  </button>;
}
