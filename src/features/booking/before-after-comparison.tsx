"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftRight, MoveHorizontal } from "lucide-react";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

const comparisonImages = [
  { id: "smile-comparison-one", before: "/smile-before.png", after: "/smile-after.png" },
  { id: "smile-comparison-two", before: "/smile-example-before.png", after: "/smile-example-after.png" },
];

type Comparison = { id: string; before: string; after: string; label: string; beforeAlt: string; afterAlt: string };

function SmileComparison({ comparison }: { comparison: Comparison }) {
  const [reveal, setReveal] = useState(50);
  const { t } = useI18n();

  return (
    <article className="rounded-[28px] border border-brand-border bg-muted p-2 shadow-sm sm:p-3" data-reveal="card">
      <h3 className="sr-only">{comparison.label}</h3>
      {/* The reveal divider and range control use physical left positions, so this frame stays left-to-right in every language. */}
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[22px] bg-action/10" dir="ltr" id={`${comparison.id}-images`}>
        <Image
          alt={comparison.beforeAlt}
          className="object-cover object-[center_40%]"
          fill
          sizes="(max-width: 1024px) 100vw, 48vw"
          src={comparison.before}
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <Image
            alt={comparison.afterAlt}
            className="object-cover object-[center_40%]"
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            src={comparison.after}
          />
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-between px-4 pb-4 sm:px-5 sm:pb-5">
          <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">{t.landing.smiles.after}</span>
          <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">{t.landing.smiles.before}</span>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white" style={{ left: `${reveal}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white text-brand-primary">
            <MoveHorizontal className="size-5" />
          </span>
        </div>

        <input
          id={`${comparison.id}-range`}
          aria-label={interpolate(t.landing.smiles.revealLabel, { label: comparison.label.toLowerCase() })}
          aria-controls={`${comparison.id}-images`}
          aria-valuetext={interpolate(t.landing.smiles.valueText, { percent: reveal })}
          className="before-after-range"
          max={100}
          min={0}
          onChange={(event) => setReveal(Number(event.target.value))}
          type="range"
          value={reveal}
        />
      </div>
    </article>
  );
}

export function BeforeAfterComparison() {
  const { t } = useI18n();
  const comparisons: Comparison[] = comparisonImages.map((images, index) => ({ ...images, ...t.landing.smiles.items[index] }));
  return (
    <section aria-labelledby="smile-preview-title" className="mx-auto w-full max-w-none scroll-mt-24 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-12 lg:pb-24 lg:pt-12 2xl:px-16" data-reveal="section" id="smile-preview">
      <div className="grid gap-5 md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="text-foreground">02</span>
            <span aria-hidden="true" className="h-px w-8 bg-action" />
            {t.landing.smiles.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-5xl" id="smile-preview-title">
            {t.landing.smiles.title}
          </h2>
        </div>
        <div className="max-w-sm border-s border-border ps-4 md:col-span-4 md:col-start-9 md:justify-self-end">
          <p className="text-sm leading-6 text-muted-foreground">{t.landing.smiles.body}</p>
          <p className="mt-3 inline-flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ArrowLeftRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
            {t.landing.smiles.disclaimer}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:mt-9 lg:grid-cols-2">
        {comparisons.map((comparison) => <SmileComparison comparison={comparison} key={comparison.id} />)}
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        {t.landing.smiles.instructions}
      </p>
    </section>
  );
}
