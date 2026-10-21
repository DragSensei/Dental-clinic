"use client";

import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/shared/i18n/locale-provider";

export function VisitInformation() {
  const { t } = useI18n();
  return <main className="page-shell min-h-[60vh]">
    <header className="page-header"><p className="eyebrow">{t.visit.eyebrow}</p><h1 className="page-title">{t.visit.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{t.visit.lead}</p></header>
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="surface bg-brand-subtle p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-full bg-background text-brand-primary"><MessageCircle aria-hidden="true" className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">{t.visit.asideTitle}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{t.visit.asideBody}</p><a className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-primary underline underline-offset-4" href="https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-check-ups/" rel="noreferrer" target="_blank">{t.visit.nhsLink}</a></aside>
      <section aria-labelledby="prepare-title" className="surface p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary"><ShieldCheck aria-hidden="true" className="size-5" /></span><h2 className="mt-5 text-xl font-semibold" id="prepare-title">{t.visit.prepareTitle}</h2><ul className="mt-4 divide-y divide-brand-border">{t.visit.preparations.map(({ title, text }) => <li className="flex gap-3 py-5 first:pt-2" key={title}><span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-action/30 text-brand-primary"><Check aria-hidden="true" className="size-4" /></span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></li>)}</ul></section>
    </div>
    <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">{t.visit.booking.label}</p><h2 className="mt-2 text-xl font-semibold">{t.visit.booking.title}</h2><p className="mt-2 text-sm text-primary-foreground/80">{t.visit.booking.body}</p></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-ring" href="/book">{t.visit.booking.cta} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" /></Link></section>
  </main>;
}
