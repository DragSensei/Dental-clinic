"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveHorizontal, Sparkles } from "lucide-react";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

const comparisonImages = [
  { id: "smile-comparison-one", before: "/smile-before.png", after: "/smile-after.png" },
  { id: "smile-comparison-two", before: "/smile-example-before.png", after: "/smile-example-after.png" },
];

type Comparison = {
  id: string;
  before: string;
  after: string;
  label: string;
  beforeAlt: string;
  afterAlt: string;
};

export function BeforeAfterComparison() {
  const { locale, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [reveal, setReveal] = useState(50);

  const comparisons: Comparison[] = comparisonImages.map((images, index) => ({
    ...images,
    ...t.landing.smiles.items[index],
  }));

  const activeComparison = comparisons[activeIndex] || comparisons[0];

  return (
    <section
      id="smile-preview"
      aria-labelledby="smile-preview-title"
      className="section-fade-up relative w-full scroll-mt-24 bg-navy-band text-navy-band-foreground py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 2xl:px-16">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-xs sm:text-sm font-semibold tracking-wider uppercase text-navy-band-muted">
            {t.landing.smiles.eyebrow}
          </p>
          <h2
            id="smile-preview-title"
            className="font-display mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-navy-band-foreground"
          >
            {t.landing.smiles.title}
          </h2>
          <p className="font-body mt-3 text-sm sm:text-base leading-relaxed text-navy-band-muted">
            {t.landing.smiles.body}
          </p>

          {/* Case Switcher Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {comparisons.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setReveal(50);
                }}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeIndex === idx
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-navy-band-border bg-navy-band/60 text-navy-band-muted hover:text-navy-band-foreground hover:bg-navy-band"
                }`}
              >
                <Sparkles className="size-3" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Single Dominant Anchor: Comparison Slider in Architectural Arch Frame */}
        <div className="mx-auto mt-8 sm:mt-12 max-w-2xl">
          <div
            className="relative isolate aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-t-[140px] sm:rounded-t-[200px] lg:rounded-t-[240px] rounded-b-3xl border border-navy-band-border bg-card/10 shadow-2xl"
            dir="ltr"
            id={`${activeComparison.id}-images`}
          >
            {/* Before Image (Base) */}
            <Image
              src={activeComparison.before}
              alt={activeComparison.beforeAlt}
              fill
              sizes="(max-width: 768px) 100vw, 680px"
              priority
              className="object-cover object-[center_40%]"
            />

            {/* After Image (Clipped Reveal Layer) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
            >
              <Image
                src={activeComparison.after}
                alt={activeComparison.afterAlt}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                priority
                className="object-cover object-[center_40%]"
              />
            </div>

            {/* Corner Status Badges */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-between px-4 pb-4 sm:px-6 sm:pb-6"
            >
              <span className="font-body rounded-full border border-white/30 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                {t.landing.smiles.after}
              </span>
              <span className="font-body rounded-full border border-white/30 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                {t.landing.smiles.before}
              </span>
            </div>

            {/* Vertical Divider & Draggable Handle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-md"
              style={{ left: `${reveal}%` }}
            >
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/90 bg-white text-navy-band shadow-xl">
                <MoveHorizontal className="size-5" />
              </span>
            </div>

            {/* Interactive Range Input */}
            <input
              id={`${activeComparison.id}-range`}
              type="range"
              min={0}
              max={100}
              value={reveal}
              onChange={(e) => setReveal(Number(e.target.value))}
              aria-label={interpolate(t.landing.smiles.revealLabel, {
                label: activeComparison.label.toLowerCase(),
              })}
              aria-controls={`${activeComparison.id}-images`}
              aria-valuetext={interpolate(t.landing.smiles.valueText, { percent: reveal })}
              className="before-after-range cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Short Caption and Mandatory Disclaimer */}
          <div className="mx-auto mt-6 max-w-xl text-center">
            <p className="font-body text-xs sm:text-sm text-navy-band-muted">
              {t.landing.smiles.instructions}
            </p>
            <p className="font-body mt-2 text-[11px] sm:text-xs text-navy-band-muted/80">
              {locale === "ar"
                ? "رسم توضيحي تجريبي، وليس نتيجة علاجية فعلية لمريض."
                : "Illustrative demo, not a patient result."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
