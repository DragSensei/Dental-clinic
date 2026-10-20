import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";

const preparation = [
  ["Bring your questions", "Write down what you want to discuss so the things that matter to you are easy to remember."],
  ["Share what helps you feel comfortable", "If dental visits make you nervous, tell the dental team and ask how they can support you."],
  ["Understand the proposed care", "Ask about the plan, alternatives, expected costs, and follow-up before deciding."],
];

export function VisitInformation() {
  return <main className="page-shell min-h-[60vh]">
    <header className="page-header"><p className="eyebrow">Your first visit</p><h1 className="page-title">A conversation is a good place to start.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Use these general prompts to prepare for a dental conversation. What happens at a visit depends on your needs and the clinician’s assessment.</p></header>
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="surface bg-brand-subtle p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-full bg-background text-brand-primary"><MessageCircle aria-hidden="true" className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">Take your time</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">You can ask for an explanation in plain language, consider your options, and decide when you feel ready. This guide is general information, not personal medical advice.</p><a className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-primary underline underline-offset-4" href="https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-check-ups/" rel="noreferrer" target="_blank">NHS guide to check-ups ↗</a></aside>
      <section aria-labelledby="prepare-title" className="surface p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary"><ShieldCheck aria-hidden="true" className="size-5" /></span><h2 className="mt-5 text-xl font-semibold" id="prepare-title">A few ways to prepare</h2><ul className="mt-4 divide-y divide-brand-border">{preparation.map(([title, description]) => <li className="flex gap-3 py-5 first:pt-2" key={title}><span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-action/30 text-brand-primary"><Check aria-hidden="true" className="size-4" /></span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></li>)}</ul></section>
    </div>
    <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Demo booking</p><h2 className="mt-2 text-xl font-semibold">Ready to explore the flow?</h2><p className="mt-2 text-sm text-primary-foreground/80">The interactive preview uses fictional services, clinicians, and availability.</p></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-ring" href="/book">Open booking preview <ArrowRight aria-hidden="true" className="size-4" /></Link></section>
  </main>;
}
