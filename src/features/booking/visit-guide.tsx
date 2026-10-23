"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/locale-provider";

export function VisitGuide() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="visit-title" className="scroll-mt-28 border-y border-brand-border bg-muted" data-reveal="section" id="visit-guide">
      <div className="mx-auto grid w-full max-w-none gap-10 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24 2xl:px-16">
        <div data-reveal="content">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">{t.landing.visitGuide.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="visit-title">{t.landing.visitGuide.title}</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">{t.landing.visitGuide.body}</p>
          <a className="mt-6 inline-flex min-h-11 items-center text-sm font-medium underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring" href="https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-check-ups/" rel="noreferrer" target="_blank">{t.landing.visitGuide.nhsLink}</a>
        </div>
        <ul className="divide-y divide-brand-border rounded-2xl border border-brand-border bg-card px-5 shadow-sm sm:px-7" data-reveal="card">
          {t.landing.visitGuide.preparations.map(({ title, text }) => (
            <li className="flex gap-4 py-6" key={title}>
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-action text-action-foreground"><Check aria-hidden="true" className="size-4" /></span>
              <div><h3 className="text-lg font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
