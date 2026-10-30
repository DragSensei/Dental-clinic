"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { SiteBrand } from "@/components/shared/site-brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageCombobox } from "@/components/shared/language-combobox";
import { useI18n } from "@/i18n/locale-provider";

// Slim toolbar for authenticated dashboards; the marketing navbar and footer stay on public routes.
export function AppTopBar() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div aria-label={t.appBar.label} className="flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8" role="toolbar">
        {/* Phones keep the logo mark only so language and theme controls fit. */}
        <div className="min-w-0 max-sm:[&>a>span:last-child]:sr-only">
          <SiteBrand />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1 text-xs">
            <span className="px-1.5 text-muted-foreground font-medium">Demo:</span>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/dev/demo-login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: "admin" }),
                });
                window.location.href = "/admin/overview";
              }}
              className="rounded-md px-2 py-1 font-semibold text-foreground hover:bg-background shadow-xs transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/dev/demo-login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: "doctor" }),
                });
                window.location.href = "/admin/overview";
              }}
              className="rounded-md px-2 py-1 font-semibold text-foreground hover:bg-background shadow-xs transition-colors"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/dev/demo-login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: "patient" }),
                });
                window.location.href = "/patient/overview";
              }}
              className="rounded-md px-2 py-1 font-semibold text-primary hover:bg-background shadow-xs transition-colors"
            >
              Patient
            </button>
          </div>
          <Link
            className="hidden min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            href="/"
          >
            <Globe aria-hidden="true" className="size-4" />
            {t.appBar.viewWebsite}
          </Link>
          <LanguageCombobox className="w-32" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
