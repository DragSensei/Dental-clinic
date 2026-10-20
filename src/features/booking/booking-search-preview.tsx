import { CalendarDays, MapPin, ArrowRight, Smile } from "lucide-react";
import Link from "next/link";
import { demoClinic } from "./landing-demo-data";

const searchFields = [
  { label: "Where", value: demoClinic.search.area, icon: MapPin },
  { label: "Visit type", value: demoClinic.search.visit, icon: Smile },
  { label: "When", value: demoClinic.search.time, icon: CalendarDays },
];

export function BookingSearchPreview() {
  return (
    <section aria-labelledby="search-preview-title" className="relative z-10 mx-auto w-full max-w-none scroll-mt-28 px-0" data-reveal="card" id="booking-preview">
      <h2 className="sr-only" id="search-preview-title">Booking search preview</h2>
      <p className="mb-3 px-2 text-xs leading-5 text-muted-foreground">Sample search · continue to explore the simulated booking flow. No real appointments are created.</p>
      <div aria-label="Booking search preview. Sample information only." className="grid overflow-hidden rounded-[28px] border border-brand-border bg-card shadow-xl shadow-brand-primary/10 sm:grid-cols-3 lg:grid-cols-[1.1fr_1.1fr_1fr_auto]" role="group">
        {searchFields.map(({ label, value, icon: Icon }, index) => (
          <div className={`flex min-h-[76px] items-center gap-3 px-5 py-3 ${index < searchFields.length - 1 ? "border-b border-border sm:border-b-0 lg:border-r" : ""}`} key={label}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-brand-primary">
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{value}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-end p-3 sm:col-span-3 lg:col-span-1">
          <Link className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-ring sm:w-auto" href="/book">Continue <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
