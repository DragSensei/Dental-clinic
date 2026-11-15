"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeftRight, MoveHorizontal } from "lucide-react";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";

const comparisonImages = [
  { id: "smile-whitening", before: "/smile-before.png", after: "/smile-after.png" },
  { id: "smile-braces", before: "/images/smiles/braces-before.jpg", after: "/images/smiles/braces-after.jpg" },
  { id: "smile-veneers", before: "/images/smiles/veneers-before.jpg", after: "/images/smiles/veneers-after.jpg" },
  { id: "smile-aligners", before: "/images/smiles/aligners-before.jpg", after: "/images/smiles/aligners-after.jpg" },
  { id: "smile-bonding", before: "/images/smiles/bonding-before.jpg", after: "/images/smiles/bonding-after.jpg" },
];

type Comparison = { id: string; before: string; after: string; label: string; beforeAlt: string; afterAlt: string };

function SmileComparison({
  comparison,
  isDuplicate = false,
  onInteractStart,
}: {
  comparison: Comparison;
  isDuplicate?: boolean;
  onInteractStart: (isPointerDrag: boolean) => void;
}) {
  const [reveal, setReveal] = useState(50);
  const { t } = useI18n();
  const frameId = isDuplicate ? `${comparison.id}-dup-images` : `${comparison.id}-images`;

  return (
    <div aria-hidden={isDuplicate || undefined} className="w-[min(82vw,340px)] shrink-0 pe-5 sm:w-[380px] lg:w-[420px]">
      <article className="rounded-[28px] border border-brand-border bg-muted p-2 shadow-sm sm:p-3" data-reveal="card">
        {!isDuplicate && <h3 className="sr-only">{comparison.label}</h3>}
        {/* The reveal divider and range control use physical left positions, so this frame stays left-to-right in every language. */}
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[22px] bg-action/10" dir="ltr" id={frameId}>
          <Image
            alt={isDuplicate ? "" : comparison.beforeAlt}
            className="object-cover object-[center_40%]"
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 380px, 420px"
            src={comparison.before}
          />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
            <Image
              alt={isDuplicate ? "" : comparison.afterAlt}
              className="object-cover object-[center_40%]"
              fill
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 380px, 420px"
              src={comparison.after}
            />
          </div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-white/35 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:left-4 sm:top-4"
          >
            {comparison.label}
          </span>

          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-between px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{t.landing.smiles.after}</span>
            <span className="rounded-full border border-white/35 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{t.landing.smiles.before}</span>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white" style={{ left: `${reveal}%` }}>
            <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white text-brand-primary">
              <MoveHorizontal className="size-5" />
            </span>
          </div>

          <input
            id={isDuplicate ? undefined : `${comparison.id}-range`}
            aria-label={isDuplicate ? undefined : interpolate(t.landing.smiles.revealLabel, { label: comparison.label.toLowerCase() })}
            aria-controls={isDuplicate ? undefined : frameId}
            aria-valuetext={isDuplicate ? undefined : interpolate(t.landing.smiles.valueText, { percent: reveal })}
            className="before-after-range"
            max={100}
            min={0}
            onChange={(event) => {
              onInteractStart(false);
              setReveal(Number(event.target.value));
            }}
            onFocus={() => onInteractStart(false)}
            onPointerDown={() => onInteractStart(true)}
            onTouchStart={() => onInteractStart(true)}
            tabIndex={isDuplicate ? -1 : undefined}
            type="range"
            value={reveal}
          />
        </div>
      </article>
    </div>
  );
}

export function BeforeAfterComparison() {
  const { t } = useI18n();
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const pauseScrollYRef = useRef(0);

  const comparisons: Comparison[] = comparisonImages.map((images, index) => ({ ...images, ...t.landing.smiles.items[index] }));

  const handleInteractStart = useCallback((isPointerDrag: boolean) => {
    if (isPointerDrag) isDraggingRef.current = true;
    pauseScrollYRef.current = window.scrollY;
    setIsPaused(true);
  }, []);

  useEffect(() => {
    const endDrag = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, []);

  useEffect(() => {
    if (!isPaused) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!marqueeRef.current?.contains(event.target as Node)) {
        isDraggingRef.current = false;
        setIsPaused(false);
      }
    };

    const handleScroll = () => {
      if (!isDraggingRef.current && Math.abs(window.scrollY - pauseScrollYRef.current) > 24) {
        setIsPaused(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPaused]);

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

      {/* The marquee always slides from right to left regardless of document writing direction. */}
      <div
        className="mt-7 overflow-hidden py-1 sm:mt-9"
        dir="ltr"
        onBlur={(event) => {
          if (!marqueeRef.current?.contains(event.relatedTarget as Node)) {
            setIsPaused(false);
          }
        }}
        onMouseLeave={() => {
          if (!isDraggingRef.current) setIsPaused(false);
        }}
        ref={marqueeRef}
      >
        <div className="smile-marquee-track" data-paused={isPaused ? "true" : "false"}>
          {comparisons.map((comparison) => (
            <SmileComparison comparison={comparison} key={comparison.id} onInteractStart={handleInteractStart} />
          ))}
          {comparisons.map((comparison) => (
            <SmileComparison comparison={comparison} isDuplicate key={`${comparison.id}-dup`} onInteractStart={handleInteractStart} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        {t.landing.smiles.instructions}
      </p>
    </section>
  );
}
