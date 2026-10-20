"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-shell flex-1"><section className="surface mx-auto max-w-2xl p-8 text-center"><p className="eyebrow">Something went wrong</p><h1 className="page-title">This page could not load.</h1><p className="mt-4 text-muted-foreground">Try again, or return to the home page.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground" onClick={reset} type="button">Try again</button><Link className="inline-flex min-h-11 items-center rounded-lg border border-brand-border px-5 font-semibold text-foreground hover:bg-muted" href="/">Return home</Link></div></section></main>;
}
