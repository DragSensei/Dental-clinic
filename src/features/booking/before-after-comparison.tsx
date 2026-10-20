"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftRight, MoveHorizontal } from "lucide-react";

const comparisons = [
  {
    id: "smile-comparison-one",
    label: "Illustration one",
    before: "/smile-before.png",
    after: "/smile-after.png",
    beforeAlt: "Illustrative natural smile with teeth in a soft ivory shade",
    afterAlt: "The same illustrative smile with a modestly brighter natural ivory tooth shade",
  },
  {
    id: "smile-comparison-two",
    label: "Illustration two",
    before: "/smile-example-before.png",
    after: "/smile-example-after.png",
    beforeAlt: "AI-generated illustrative smile with a natural ivory tooth shade",
    afterAlt: "The same AI-generated illustrative smile with a subtly brighter tooth shade",
  },
];

function SmileComparison({ comparison }: { comparison: (typeof comparisons)[number] }) {
  const [reveal, setReveal] = useState(50);

  return (
    <article className="rounded-[28px] border border-brand-border bg-muted p-2 shadow-sm sm:p-3" data-reveal="card">
      <h3 className="sr-only">{comparison.label}</h3>
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[22px] bg-action/10" id={`${comparison.id}-images`}>
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
          <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">After</span>
          <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">Before</span>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white" style={{ left: `${reveal}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white text-brand-primary">
            <MoveHorizontal className="size-5" />
          </span>
        </div>

        <input
          id={`${comparison.id}-range`}
          aria-label={`Reveal the after image for ${comparison.label.toLowerCase()}`}
          aria-controls={`${comparison.id}-images`}
          aria-valuetext={`${reveal}% of the illustrative after image shown`}
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
  return (
    <section aria-labelledby="smile-preview-title" className="mx-auto w-full max-w-none scroll-mt-24 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-12 lg:pb-24 lg:pt-12 2xl:px-16" data-reveal="section" id="smile-preview">
      <div className="grid gap-5 md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="text-foreground">02</span>
            <span aria-hidden="true" className="h-px w-8 bg-action" />
            Illustrative comparisons
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-5xl" id="smile-preview-title">
            Two smiles, two views.
          </h2>
        </div>
        <div className="max-w-sm border-l border-border pl-4 md:col-span-4 md:col-start-9 md:justify-self-end">
          <p className="text-sm leading-6 text-muted-foreground">Move either divider to reveal more of its paired illustration.</p>
          <p className="mt-3 inline-flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ArrowLeftRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
            AI-generated illustrations only. These are not actual patient results or treatment promises.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:mt-9 lg:grid-cols-2">
        {comparisons.map((comparison) => <SmileComparison comparison={comparison} key={comparison.id} />)}
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        Drag either image, or focus its slider and use the arrow keys.
      </p>
    </section>
  );
}
