"use client";

import type { ReactNode } from "react";
import type { Appointment } from "@/data/mock/catalog";
import { useI18n } from "@/i18n/locale-provider";

export const field = "min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const labelClass = "grid gap-1.5 text-sm font-medium";

// Returns a short UTC date formatter for the active language.
export function useDateLabel() {
  const { formatDate } = useI18n();
  return (date: string) => formatDate(date, { month: "short", day: "numeric", year: "numeric" });
}

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  const { t } = useI18n();
  return <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.admin.ui.workspace}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</header>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`}>{children}</section>; }
export function Empty({ children }: { children: ReactNode }) { return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>; }
export function Status({ status }: { status: Appointment["status"] }) {
  const { t } = useI18n();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status === "confirmed" ? "bg-brand-subtle text-foreground" : "bg-muted text-muted-foreground"}`}>{t.status[status]}</span>;
}
