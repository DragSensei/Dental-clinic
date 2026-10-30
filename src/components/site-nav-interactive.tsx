"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  Smile,
  Activity,
  Baby,
  Stethoscope,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { localizedService } from "@/data/mock/localized-copy";
import { useI18n } from "@/i18n/locale-provider";
import { useTheme } from "@/components/theme-provider";
import { buttonVariants } from "@/components/ui/button";
import type { Service } from "@/data/mock/catalog";

const CATEGORY_ICONS: Record<string, typeof ShieldCheck> = {
  "Preventive Care": ShieldCheck,
  "Restorative Dentistry": Activity,
  "Cosmetic Dentistry": Sparkles,
  "Orthodontics": Smile,
  "Pediatric Dentistry": Baby,
  "Oral Surgery & Endodontics": Stethoscope,
};

export function SiteNavInteractive() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, dashboardRoute } = useSession();
  const { services } = useClinic();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group services by category
  const categorizedServices = useMemo(() => {
    const map = new Map<string, Service[]>();
    services.forEach((s) => {
      const cat = s.category || "Preventive Care";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });
    return map;
  }, [services]);

  const categories = useMemo(() => Array.from(categorizedServices.keys()), [categorizedServices]);

  const activeCategory =
    selectedCategory && categorizedServices.has(selectedCategory)
      ? selectedCategory
      : categories[0] ?? "Preventive Care";

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

  const active = (href: string) =>
    pathname !== null &&
    !href.includes("#") &&
    (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "ar" : "en");
  };

  const dark = theme === "dark";

  return (
    <div
      className="relative flex w-full items-center justify-between gap-3 sm:gap-6 py-2"
      onMouseLeave={handleMouseLeave}
    >
      {/* Brand: Tooth capsule icon + Clinic Name */}
      <Link
        href="/"
        className="inline-flex min-h-11 shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        onClick={() => setDropdownOpen(false)}
      >
        <span className="grid size-10 place-items-center rounded-full bg-brand-subtle text-brand-primary">
          <svg aria-hidden="true" className="size-[19px]" fill="none" viewBox="0 0 24 24">
            <path
              d="M7.4 4.25c-2.12 0-3.4 1.72-3.4 4.2 0 2.29.86 3.48 1.73 4.83.78 1.2 1.17 4.72 2.43 4.72 1.03 0 1.39-3.76 3.84-3.76s2.81 3.76 3.84 3.76c1.26 0 1.65-3.52 2.43-4.72.87-1.35 1.73-2.54 1.73-4.83 0-2.48-1.28-4.2-3.4-4.2-1.54 0-2.23.71-4.6.71s-3.06-.71-4.6-.71Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
        <span className="text-sm sm:text-base font-bold tracking-tight text-foreground whitespace-nowrap">
          {t.brand.name}
        </span>
      </Link>

      {/* Center Nav Links (Desktop) */}
      <nav aria-label={t.nav.main} className="hidden lg:flex items-center gap-1 xl:gap-2">
        {/* Home */}
        <Link
          href="/"
          className={`site-nav-link relative inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
            active("/") && pathname === "/"
              ? "font-semibold text-brand-primary"
              : "font-medium text-muted-foreground"
          }`}
          onClick={() => setDropdownOpen(false)}
        >
          {t.nav.home}
        </Link>

        {/* Services with Cloudflare Mega Dropdown */}
        <div className="relative" onMouseEnter={handleMouseEnter}>
          <Link
            href="/services"
            className={`site-nav-link relative inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
              active("/services") || dropdownOpen
                ? "font-semibold text-brand-primary"
                : "font-medium text-muted-foreground"
            }`}
          >
            <span>{t.nav.services}</span>
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-brand-primary" : "text-muted-foreground"
              }`}
            />
          </Link>

          {/* Cloudflare Mega Dropdown Panel */}
          {dropdownOpen && (
            <div
              className="absolute top-[calc(100%+8px)] start-1/2 -translate-x-1/2 w-[760px] max-w-[95vw] rounded-2xl border border-border bg-popover/98 p-5 text-popover-foreground shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="grid grid-cols-12 gap-5">
                {/* Left Categories Rail */}
                <div className="col-span-5 border-e border-border pe-4 space-y-1">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Clinical Specialties
                  </p>
                  {categories.map((category) => {
                    const Icon = CATEGORY_ICONS[category] || Stethoscope;
                    const isSelected = activeCategory === category;
                    const count = categorizedServices.get(category)?.length || 0;
                    return (
                      <button
                        key={category}
                        type="button"
                        onMouseEnter={() => setSelectedCategory(category)}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm transition-all outline-none ${
                          isSelected
                            ? "bg-brand-subtle text-brand-primary font-semibold border border-brand-border"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`size-4 ${isSelected ? "text-brand-primary" : "text-muted-foreground"}`} />
                          <span className="truncate">{category}</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Services Listing */}
                <div className="col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        {activeCategory}
                      </span>
                      <Link
                        href={`/services?category=${encodeURIComponent(activeCategory)}`}
                        onClick={() => setDropdownOpen(false)}
                        className="text-xs text-muted-foreground hover:text-brand-primary transition-colors"
                      >
                        Filter on page →
                      </Link>
                    </div>

                    <div className="space-y-1 max-h-[280px] overflow-y-auto pe-1 [scrollbar-width:thin]">
                      {(categorizedServices.get(activeCategory) || []).map((service) => {
                        const copy = localizedService(service, locale);
                        return (
                          <Link
                            key={service.id}
                            href={`/services?category=${encodeURIComponent(activeCategory)}&service=${service.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="group flex items-start justify-between rounded-xl p-2.5 transition-colors hover:bg-muted"
                          >
                            <div className="min-w-0 pe-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                                {copy.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {copy.description}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono mt-0.5">
                              {service.durationMinutes}m
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cloudflare footer bar inside mega dropdown */}
                  <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-xs">
                    <Link
                      href="/services"
                      onClick={() => setDropdownOpen(false)}
                      className="inline-flex items-center gap-1 font-medium text-brand-primary hover:text-brand-hover transition-colors"
                    >
                      <span>Explore all {services.length} services</span>
                      <ArrowRight className="size-3 rtl:-scale-x-100" />
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setDropdownOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Need guidance? Contact us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* About us */}
        <Link
          href="/about"
          className={`site-nav-link relative inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
            active("/about") || active("/doctors")
              ? "font-semibold text-brand-primary"
              : "font-medium text-muted-foreground"
          }`}
          onClick={() => setDropdownOpen(false)}
        >
          {t.nav.aboutUs || "About us"}
        </Link>

        {/* Contact us */}
        <Link
          href="/contact"
          className={`site-nav-link relative inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
            active("/contact") || active("/visit")
              ? "font-semibold text-brand-primary"
              : "font-medium text-muted-foreground"
          }`}
          onClick={() => setDropdownOpen(false)}
        >
          {t.nav.contactUs || "Contact us"}
        </Link>
      </nav>

      {/* Right Controls: EN, Theme, Sign In / Open Dashboard / Book a visit */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Language Switcher (EN / AR) - visible on sm+ */}
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={t.language.switchTo.replace("{language}", locale === "en" ? "Arabic" : "English")}
          className="hidden sm:inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border bg-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {locale === "en" ? "EN" : "العربية"}
        </button>

        {/* Theme Toggle Button - visible on sm+ */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? t.theme.toLight : t.theme.toDark}
          className="hidden sm:grid size-11 place-items-center rounded-lg border border-border bg-background text-brand-primary hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        {/* Auth / Action Button Logic */}
        {isLoggedIn ? (
          <Link
            href={dashboardRoute}
            className={buttonVariants({
              variant: "accent",
              className: "min-h-11 rounded-full px-3 sm:px-6 text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap gap-1.5 sm:gap-2",
            })}
          >
            <LayoutDashboard className="hidden sm:block size-4 shrink-0" />
            <span>{t.nav.openDashboard}</span>
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden md:inline-flex min-h-11 items-center px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/book"
              className={buttonVariants({
                variant: "accent",
                className: "min-h-11 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap",
              })}
            >
              {t.nav.bookVisit}
            </Link>
          </>
        )}

        {/* Mobile Hamburger Trigger */}
        <div className="flex lg:hidden">
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger
              aria-label={t.nav.openMenu}
              className="grid size-11 place-items-center rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="size-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs" />
              <Dialog.Popup className="fixed inset-y-0 end-0 z-[61] flex w-[min(24rem,90vw)] flex-col overflow-y-auto bg-background border-s border-border p-6 text-foreground shadow-2xl outline-none data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full rtl:data-[starting-style]:-translate-x-full rtl:data-[ending-style]:-translate-x-full transition-transform duration-200">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-subtle text-brand-primary">
                      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                        <path d="M7.4 4.25c-2.12 0-3.4 1.72-3.4 4.2 0 2.29.86 3.48 1.73 4.83.78 1.2 1.17 4.72 2.43 4.72 1.03 0 1.39-3.76 3.84-3.76s2.81 3.76 3.84 3.76c1.26 0 1.65-3.52 2.43-4.72.87-1.35 1.73-2.54 1.73-4.83 0-2.48-1.28-4.2-3.4-4.2-1.54 0-2.23.71-4.6.71s-3.06-.71-4.6-.71Z" />
                      </svg>
                    </span>
                    <span className="font-semibold text-foreground">{t.brand.name}</span>
                  </div>
                  <Dialog.Close
                    aria-label={t.nav.closeMenu}
                    className="grid size-11 place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="size-5" />
                  </Dialog.Close>
                </div>

                <Dialog.Title className="sr-only">{t.nav.menuTitle}</Dialog.Title>

                {/* Mobile Links */}
                <nav aria-label={t.nav.mobile} className="mt-4 flex flex-col divide-y divide-border">
                  <Link
                    href="/"
                    className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-brand-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.home}
                  </Link>
                  <Link
                    href="/services"
                    className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-brand-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.services}
                  </Link>
                  <Link
                    href="/about"
                    className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-brand-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.aboutUs || "About us"}
                  </Link>
                  <Link
                    href="/contact"
                    className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-brand-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.contactUs || "Contact us"}
                  </Link>
                </nav>

                {/* Preferences in Drawer */}
                <div className="mt-6 space-y-3 border-t border-border pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Language</span>
                    <button
                      type="button"
                      onClick={toggleLanguage}
                      className="min-h-11 px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted"
                    >
                      {locale === "en" ? "English (EN)" : "العربية (AR)"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="grid size-11 place-items-center rounded-lg border border-border bg-muted/50 text-brand-primary hover:bg-muted"
                    >
                      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Mobile Auth Button */}
                <div className="mt-8 grid gap-3">
                  {isLoggedIn ? (
                    <Link
                      href={dashboardRoute}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({
                        variant: "accent",
                        className: "min-h-12 w-full rounded-xl text-sm font-semibold gap-2 justify-center",
                      })}
                    >
                      <LayoutDashboard className="size-4" />
                      <span>{t.nav.openDashboard}</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className={buttonVariants({
                          variant: "outline",
                          className: "min-h-12 w-full rounded-xl text-sm font-medium justify-center",
                        })}
                      >
                        {t.nav.login}
                      </Link>
                      <Link
                        href="/book"
                        onClick={() => setMobileOpen(false)}
                        className={buttonVariants({
                          variant: "accent",
                          className: "min-h-12 w-full rounded-xl text-sm font-semibold justify-center",
                        })}
                      >
                        {t.nav.bookVisit}
                      </Link>
                    </>
                  )}
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </div>
  );
}
