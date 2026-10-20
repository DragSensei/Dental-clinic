"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { Suspense } from "react";
import { buttonVariants } from "@/shared/components/ui/button";
import { SiteBrand } from "@/shared/components/site-brand";
import { ThemeToggle } from "@/shared/components/theme-toggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Doctors", href: "/doctors" },
  { label: "Visit", href: "/visit" },
  { label: "Admin", href: "/admin" },
];

export function SiteNav() {
  return <Suspense fallback={<SiteNavFrame pathname={null} />}><PathAwareSiteNav /></Suspense>;
}

function PathAwareSiteNav() {
  const pathname = usePathname();
  return <SiteNavFrame pathname={pathname} />;
}

function SiteNavFrame({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname !== null && !href.includes("#") && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex min-h-[68px] w-full items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 2xl:px-16">
        <SiteBrand />
        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map(({ label, href }, index) => <Link aria-current={active(href) ? "page" : undefined} className={`site-nav-link site-nav-link-${index} relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium outline-none transition-colors hover:bg-muted hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-ring ${active(href) ? "text-brand-primary" : "text-muted-foreground"}`} href={href} key={label}><span>{label}</span></Link>)}
          <ThemeToggle />
          <Link className={buttonVariants({ variant: "accent", className: "ml-2 h-11 whitespace-nowrap rounded-lg px-4 text-sm" })} href="/book">Book a visit</Link>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <Link className={buttonVariants({ variant: "accent", className: "h-11 rounded-lg px-3 text-xs sm:px-4 sm:text-sm" })} href="/book">Book a visit</Link>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger aria-label="Open navigation menu" className="inline-grid size-11 place-items-center rounded-lg border border-brand-border bg-background text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Menu aria-hidden="true" className="size-5" /></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm" />
              <Dialog.Popup className="fixed inset-y-0 right-0 z-[61] flex w-[min(24rem,90vw)] flex-col overflow-y-auto bg-background p-5 shadow-2xl outline-none data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full transition-transform duration-200 motion-reduce:transition-none">
                <div className="flex items-center justify-between border-b border-brand-border pb-5"><SiteBrand /><Dialog.Close aria-label="Close navigation menu" className="grid size-11 place-items-center rounded-lg border border-brand-border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X aria-hidden="true" className="size-5" /></Dialog.Close></div>
                <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
                <nav aria-label="Mobile navigation" className="mt-3 flex flex-col">
                  {links.map(({ label, href }, index) => <Link aria-current={active(href) ? "page" : undefined} className={`site-nav-mobile-link site-nav-mobile-link-${index} flex min-h-12 items-center border-b border-brand-border text-sm font-medium text-foreground outline-none focus-visible:text-brand-primary`} href={href} key={label} onClick={() => setOpen(false)}>{label}</Link>)}
                </nav>
                <div className="mt-4 flex items-center justify-between"><span className="text-sm font-medium">Appearance</span><ThemeToggle /></div>
                <Link className={buttonVariants({ variant: "accent", className: "mt-5 min-h-12 rounded-lg" })} href="/book" onClick={() => setOpen(false)}>Book an appointment</Link>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
