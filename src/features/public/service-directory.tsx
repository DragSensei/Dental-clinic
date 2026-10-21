"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useClinic } from "@/shared/data/use-clinic";
import { localizedService } from "@/shared/data/mock/localized-copy";
import { ExpandableCard } from "@/shared/components/ui/expandable-card";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Sparkles, CalendarCheck } from "lucide-react";

function ServiceDirectoryContent() {
  const { services } = useClinic();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();

  const initialCategory = searchParams?.get("category") || "all";
  const initialServiceId = searchParams?.get("service") || null;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((s) => (s.category || "Preventive Care") === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <main className="page-shell min-h-[70vh] py-12">
      <header className="page-header max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand-primary">
          <Sparkles className="size-3.5" />
          <span>{t.services.directory.eyebrow}</span>
        </div>
        <h1 className="page-title mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          {t.services.directory.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {t.services.directory.lead}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Click any card below to explore treatment procedures, clinical expectations, and aftercare guides.
        </p>
      </header>

      {/* Category Filter Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-brand-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-11 rounded-full px-4 text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-brand-primary text-primary-foreground shadow-sm"
                : "bg-brand-subtle text-muted-foreground hover:bg-brand-border/60 hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Specialties" : cat}
          </button>
        ))}
      </div>

      {/* Expandable Cards Grid */}
      {filteredServices.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const copy = localizedService(service, locale);
            return (
              <ExpandableCard
                key={service.id}
                title={copy.title}
                src={service.image || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"}
                description={copy.description}
                category={service.category || "Preventive Care"}
                duration={service.durationMinutes}
                initiallyOpen={initialServiceId === service.id}
                classNameExpanded="[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3.5 [&_h4:first-child]:mt-0 [&_h4]:mb-1 [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed"
              >
                <h4>Treatment Overview</h4>
                <p>
                  {service.extendedDetails?.overview || copy.description}
                </p>

                <h4>Clinical Procedure & What to Expect</h4>
                <p>
                  {service.extendedDetails?.procedure ||
                    "Our experienced clinical team utilizes modern diagnostic imaging, gentle dental protocols, and sterile instrumentation to ensure complete comfort throughout your visit."}
                </p>

                <h4>Key Treatment Benefits</h4>
                <p>
                  {service.extendedDetails?.benefits ||
                    "Preserves your oral health, restores full biting function, enhances smile aesthetics, and supports lasting dental wellness."}
                </p>

                <h4>Aftercare & Maintenance</h4>
                <p>
                  {service.extendedDetails?.aftercare ||
                    "Maintain everyday brushing and flossing, follow personalized home-care recommendations, and attend routine examinations."}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-3.5 w-full">
                  <Link
                    href={`/book?serviceId=${service.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
                  >
                    <CalendarCheck className="size-4" />
                    {locale === "ar" ? "احجز الآن" : "Book now"}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Consultation duration: {service.durationMinutes} minutes
                  </span>
                </div>
              </ExpandableCard>
            );
          })}
        </div>
      ) : (
        <div className="surface mt-8 p-8 text-center text-sm text-muted-foreground">
          {t.services.directory.empty}
        </div>
      )}
    </main>
  );
}

export function ServiceDirectory() {
  return (
    <Suspense fallback={<div className="page-shell min-h-[60vh] py-12 text-muted-foreground">Loading services…</div>}>
      <ServiceDirectoryContent />
    </Suspense>
  );
}
