"use client";

import Link from "next/link";
import { ArrowRight, Clock3, type LucideIcon } from "lucide-react";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

export function ServiceCard({ id, title, description, durationMinutes, Icon, headingLevel = "h2" }: { id: string; title: string; description: string; durationMinutes: number; Icon: LucideIcon; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const { t } = useI18n();
  return <Link aria-label={interpolate(t.services.card.learnMore, { title })} className="group relative flex h-full min-h-[270px] flex-col rounded-2xl border border-brand-border bg-card p-5 outline-none transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-brand-primary/50 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none sm:p-6" href={`/services/${id}`}>
    <span className="grid size-14 place-items-center rounded-xl border border-brand-border bg-brand-subtle text-brand-primary transition-colors duration-300 ease-out group-hover:bg-action/30"><Icon aria-hidden="true" className="size-6" strokeWidth={1.7} /></span>
    <Heading className="mt-5 text-lg font-semibold tracking-tight">{title}</Heading>
    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
      <span className="inline-flex min-h-11 items-center gap-2 text-xs text-muted-foreground"><Clock3 aria-hidden="true" className="size-4 text-brand-primary" />{interpolate(t.services.card.minutes, { count: durationMinutes })}</span>
      <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary">{t.services.card.details} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1 motion-reduce:transform-none" /></span>
    </div>
  </Link>;
}
