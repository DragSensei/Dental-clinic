import Link from "next/link";

export default function NotFound() {
  return <main className="page-shell flex-1"><section className="surface mx-auto max-w-2xl p-8 text-center"><p className="eyebrow">Page not found</p><h1 className="page-title">We can’t find that page.</h1><p className="mt-4 text-muted-foreground">The page may have moved, or the address may be incorrect.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground" href="/">Return home</Link></section></main>;
}
