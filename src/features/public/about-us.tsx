"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import { useClinic } from "@/data/use-clinic";
import { localizedDoctor } from "@/data/mock/localized-copy";
import {
  aboutValues as values,
  aboutMilestones as milestones,
  aboutTechnologies as technologies,
} from "@/data/mock/about-data";
import { useI18n } from "@/i18n/locale-provider";
import { buttonVariants } from "@/components/ui/button";

export function AboutUs() {
  const { doctors } = useClinic();
  const { locale } = useI18n();

  return (
    <main className="page-shell min-h-[70vh] py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-subtle/50 p-8 sm:p-14 lg:p-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3.5 py-1 text-xs font-semibold text-brand-primary border border-brand-border">
            <Sparkles className="size-3.5" />
            <span>About BlueHaven Dental</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            A warmer, more thoughtful approach to dental health.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Founded with the philosophy that exceptional dentistry combines advanced scientific precision with deep human empathy. We help patients of all ages achieve healthy, confident smiles in a calming, modern clinic environment.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/book"
              className={buttonVariants({
                variant: "accent",
                className: "min-h-12 px-6 rounded-xl font-semibold shadow-sm inline-flex items-center gap-2",
              })}
            >
              <span>Book a consultation</span>
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({
                variant: "outline",
                className: "min-h-12 px-6 rounded-xl font-medium",
              })}
            >
              Contact our clinic
            </Link>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {milestones.map(({ number, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-border bg-card p-6 text-center shadow-xs"
          >
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">{number}</p>
            <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      {/* Our Core Values */}
      <section className="mt-16 sm:mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Guided by care, grounded in science
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Everything we do revolves around patient comfort, clinical precision, and long-term preventive oral well-being.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-brand-border bg-card p-6 shadow-xs transition-all hover:border-brand-primary/50 hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Dental Specialists & Team */}
      <section className="mt-16 sm:mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand-primary">
              <Users className="size-3.5" />
              <span>Our Specialists</span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Meet our clinical doctors
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Our clinicians bring extensive postgraduate training, gentle demeanors, and specialized expertise across all facets of modern dentistry.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor) => {
            const copy = localizedDoctor(doctor, locale);
            return (
              <div
                key={doctor.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-card p-6 shadow-xs transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-subtle text-2xl font-bold text-brand-primary shadow-xs">
                    {copy.name.slice(0, 2)}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors">
                    {copy.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-primary">
                    {copy.specialty}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {copy.bio}
                  </p>
                </div>
                <div className="mt-6 border-t border-brand-border/60 pt-4">
                  <span className="text-xs text-muted-foreground">
                    Covers {doctor.serviceIds.length} specialty procedures
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology & Standards */}
      <section className="mt-16 sm:mt-24 rounded-3xl border border-brand-border bg-card p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              Advanced Clinical Facility
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Technology that transforms your experience
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
              We continually adopt state-of-the-art dental equipment to minimize procedural discomfort, shorten chair times, and achieve predictable aesthetic and surgical outcomes.
            </p>
            <ul className="mt-6 space-y-3">
              {technologies.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="size-5 shrink-0 text-brand-primary mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-brand-border">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
              alt="Modern BlueHaven Dental clinic interior"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
