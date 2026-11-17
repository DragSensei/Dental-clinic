"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/locale-provider";

export function BookingFaq() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div aria-labelledby="faq-title" className="scroll-mt-28 lg:col-span-7" data-reveal="content" id="faq">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          {t.landing.faq.eyebrow}
        </p>
        <h2
          className="font-display mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          id="faq-title"
        >
          {t.landing.faq.titleLine1} {t.landing.faq.titleLine2}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t.landing.faq.lead}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-xs sm:px-7" data-reveal="card">
        {t.landing.faq.items.map(({ question, answer }, index) => {
          const answerId = `faq-answer-${index}`;
          const isOpen = openIndex === index;

          return (
            <div className="border-b border-border last:border-b-0" key={question}>
              <button
                aria-controls={answerId}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-start text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span>{question}</span>
                <Plus
                  aria-hidden="true"
                  className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-45 text-foreground" : ""} motion-reduce:transition-none`}
                />
              </button>
              <div className="faq-answer" aria-hidden={!isOpen} data-open={isOpen} id={answerId}>
                <div className="faq-answer-inner">
                  <p className="pb-5 pe-6 text-sm leading-relaxed text-muted-foreground">{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
