import type { ReactNode } from "react";
import type { Appointment } from "@/shared/data/mock/catalog";

export const field = "min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const labelClass = "grid gap-1.5 text-sm font-medium";
export const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bluehaven Dental · demo workspace</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</header>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`}>{children}</section>; }
export function Empty({ children }: { children: ReactNode }) { return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>; }
export function Status({ status }: { status: Appointment["status"] }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${status === "confirmed" ? "bg-brand-subtle text-foreground" : "bg-muted text-muted-foreground"}`}>{status}</span>; }
