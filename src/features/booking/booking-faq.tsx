"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/shared/i18n/locale-provider";

export function BookingFaq() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-title" className="mx-auto grid w-full max-w-none scroll-mt-28 gap-8 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-12 lg:px-12 lg:py-24 2xl:px-16" data-reveal="section" id="faq">
      <div className="md:col-span-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.landing.faq.eyebrow}</p>
        <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="faq-title">{t.landing.faq.titleLine1}<br />{t.landing.faq.titleLine2}</h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">{t.landing.faq.lead}</p>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-brand-border bg-card px-5 shadow-sm md:col-span-7 md:col-start-6 sm:px-7" data-reveal="card">
        {t.landing.faq.items.map(({ question, answer }, index) => {
          const answerId = `faq-answer-${index}`;
          const isOpen = openIndex === index;

          return (
          <div className="border-b border-brand-border last:border-b-0" key={question}>
            <button
              aria-controls={answerId}
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-start text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              {question}
              <Plus aria-hidden="true" className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""} motion-reduce:transition-none`} />
            </button>
            <div className="faq-answer" aria-hidden={!isOpen} data-open={isOpen} id={answerId}>
              <div className="faq-answer-inner">
                <p className="max-w-xl pb-6 pe-8 text-sm leading-7 text-muted-foreground">{answer}</p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
