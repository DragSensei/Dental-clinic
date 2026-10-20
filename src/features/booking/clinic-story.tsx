import { HeartHandshake, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

const approach = [
  { icon: MessageCircle, title: "Time for questions", text: "Start with what you would like to understand." },
  { icon: ShieldCheck, title: "Clear information", text: "Get a plain-language overview before deciding." },
  { icon: HeartHandshake, title: "Care at your pace", text: "Take time to consider the next step that feels right." },
];

export function ClinicStory() {
  return (
    <section aria-labelledby="who-we-are-title" className="scroll-mt-32 border-y border-brand-border bg-background" data-reveal="section" id="who-we-are">
      <div className="mx-auto grid w-full max-w-none gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-24 2xl:px-16">
        <div className="lg:col-span-5" data-reveal="content">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-primary">Who we are</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="who-we-are-title">A dental visit should leave room for your questions.</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Every patient arrives with different questions. This guide helps you explore the basics and prepare for a conversation with a dental professional.
          </p>
          <Link className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-primary underline decoration-brand-border underline-offset-4 hover:decoration-brand-primary focus-visible:outline-2 focus-visible:outline-ring" href="/visit">Learn about a first visit <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7" data-reveal="content">
          {approach.map(({ icon: Icon, title, text }) => (
            <article className="rounded-2xl border border-brand-border bg-brand-subtle p-5 sm:p-6" key={title}>
              <span className="grid size-11 place-items-center rounded-full bg-background text-brand-primary"><Icon aria-hidden="true" className="size-5" /></span>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
