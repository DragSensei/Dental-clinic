import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import { BookingSearchPreview } from "./booking-search-preview";

export function AppointmentCta() {
  return (
    <section aria-labelledby="next-step-title" className="w-full scroll-mt-32 py-8 sm:py-12" data-reveal="section" id="next-step">
      <div className="w-full overflow-hidden rounded-3xl bg-brand-primary text-primary-foreground">
        <div className="grid md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col items-start justify-center p-6 sm:p-9 lg:p-12" data-reveal="content">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/75">YOUR NEXT STEP</p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="next-step-title"><span className="block">A little clarity.</span><span className="block">A confident next step.</span></h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-primary-foreground/85 sm:text-base">Explore a simulated appointment request using sample services, clinicians, and availability.</p>
            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-full! px-5 sm:w-auto" })} href="/book">Explore booking preview <ArrowRight aria-hidden="true" className="size-4" /></Link>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-primary-foreground underline decoration-primary-foreground/40 underline-offset-4 outline-none transition-colors hover:decoration-primary-foreground focus-visible:ring-2 focus-visible:ring-ring" href="/visit">First-visit guide</Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-primary-foreground/75">Demo only. No real appointments are created.</p>
          </div>
          <div className="relative aspect-[1.5/1] w-full md:aspect-auto md:min-h-[400px]" data-reveal="image">
            <Image alt="A patient speaking with a dental professional" className="object-cover md:rounded-l-[80px]" fill sizes="(max-width: 767px) 100vw, 50vw" src="/dental-visit-hero.png" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl px-5 sm:mt-10 sm:px-8 lg:px-12 2xl:px-16" data-reveal="content">
        <div className="rounded-2xl border border-brand-border bg-background p-3 shadow-lg shadow-brand-primary/5 sm:p-5">
          <p className="mb-3 px-2 text-sm font-semibold text-brand-primary sm:mb-4">Appointment search preview</p>
          <BookingSearchPreview />
        </div>
      </div>
    </section>
  );
}
