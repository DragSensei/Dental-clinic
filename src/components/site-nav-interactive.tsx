"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  LayoutDashboard,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { localizedService } from "@/data/mock/localized-copy";
import { useI18n } from "@/i18n/locale-provider";
import { useTheme } from "@/components/theme-provider";
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

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  const headerClass = `sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-200 ${
    isTransparent
      ? "bg-transparent border-b border-transparent -mb-16 sm:-mb-[68px]"
      : "bg-background/90 backdrop-blur-md border-b border-border shadow-xs"
  }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto flex min-h-[64px] sm:min-h-[68px] w-full max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12 2xl:px-16">
        <div
          className="relative flex w-full items-center justify-between gap-2 sm:gap-6 py-2"
          onMouseLeave={handleMouseLeave}
        >
          {/* Brand: Tooth capsule icon + Clinic Name */}
          <Link
            href="/"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setDropdownOpen(false)}
          >
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary shadow-xs shrink-0">
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
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
              <span>{locale === "en" ? "BlueHaven" : "بلو هيفن"}</span>
              <span className="hidden sm:inline">{locale === "en" ? " Dental" : " للأسنان"}</span>
            </span>
          </Link>

          {/* Center 4 Navigation Links (Desktop) */}
          <nav aria-label={t.nav.main} className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* 1. Home */}
            <Link
              href="/"
              className={`site-nav-link relative inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm transition-colors outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
                active("/") && pathname === "/"
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              }`}
              onClick={() => setDropdownOpen(false)}
            >
              {t.nav.home}
            </Link>

            {/* 2. Services (with Mega Dropdown) */}
            <div className="relative" onMouseEnter={handleMouseEnter}>
              <Link
                href="/services"
                className={`site-nav-link relative inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
                  active("/services") || dropdownOpen
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                <span>{t.nav.services}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-foreground" : "text-muted-foreground"
                  }`}
                />
              </Link>

              {dropdownOpen && (
                <div
                  className="nav-dropdown-enter absolute start-0 top-full mt-2 w-[620px] rounded-2xl border border-border bg-card p-4 shadow-xl backdrop-blur-md z-50 text-foreground"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-12 gap-4">
                    {/* Left Column: Categories List */}
                    <div className="col-span-5 border-e border-border pe-3 space-y-1">
                      <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.services?.directory?.eyebrow || "Categories"}
                      </p>
                      {categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat] || ShieldCheck;
                        const isSelected = cat === activeCategory;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onMouseEnter={() => setSelectedCategory(cat)}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex w-full min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-secondary font-semibold text-foreground shadow-xs"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            }`}
                          >
                            <Icon className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{cat}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column: Active Category Services */}
                    <div className="col-span-7 ps-1">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                        <span className="text-xs font-semibold text-foreground">
                          {activeCategory}
                        </span>
                        <Link
                          href={`/services?category=${encodeURIComponent(activeCategory)}`}
                          onClick={() => setDropdownOpen(false)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          View all →
                        </Link>
                      </div>

                      <div className="space-y-1 max-h-[260px] overflow-y-auto pe-1 [scrollbar-width:thin]">
                        {(categorizedServices.get(activeCategory) || []).map((service) => {
                          const copy = localizedService(service, locale);
                          return (
                            <Link
                              key={service.id}
                              href={`/services?category=${encodeURIComponent(activeCategory)}&service=${service.id}`}
                              onClick={() => setDropdownOpen(false)}
                              className="group flex min-h-11 items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-secondary/70"
                            >
                              <div className="min-w-0 pe-2">
                                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {copy.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {copy.description}
                                </p>
                              </div>
                              <span className="shrink-0 text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-mono">
                                {service.durationMinutes}m
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border pt-3 flex items-center justify-between text-xs">
                    <Link
                      href="/services"
                      onClick={() => setDropdownOpen(false)}
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline transition-colors"
                    >
                      <span>Explore all services</span>
                      <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setDropdownOpen(false)}
                      className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Need guidance? Contact us
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. About us */}
            <Link
              href="/about"
              className={`site-nav-link relative inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm transition-colors outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
                active("/about") || active("/doctors")
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              }`}
              onClick={() => setDropdownOpen(false)}
            >
              {t.nav.aboutUs || "About us"}
            </Link>

            {/* 4. Contact us */}
            <Link
              href="/contact"
              className={`site-nav-link relative inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm transition-colors outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${
                active("/contact") || active("/visit")
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              }`}
              onClick={() => setDropdownOpen(false)}
            >
              {t.nav.contactUs || "Contact us"}
            </Link>
          </nav>

          {/* Right Controls: Language switch, Theme toggle, Book button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher (EN / AR) */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t.language.switchTo.replace("{language}", locale === "en" ? "Arabic" : "English")}
              className="hidden sm:inline-flex min-h-11 min-w-11 items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary rounded-full border border-border bg-background/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {locale === "en" ? "EN" : "العربية"}
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? t.theme.toLight : t.theme.toDark}
              className="hidden sm:grid size-11 place-items-center rounded-full border border-border bg-background/80 text-foreground hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {/* Auth / Book Button */}
            {isLoggedIn ? (
              <Link
                href={dashboardRoute}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-3.5 sm:px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:brightness-105 whitespace-nowrap gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LayoutDashboard className="hidden sm:block size-4 shrink-0" />
                <span>{t.nav.openDashboard}</span>
              </Link>
            ) : (
              <Link
                href="/book"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:brightness-105 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="sm:hidden">{locale === "en" ? "Book" : "احجز"}</span>
                <span className="hidden sm:inline">{t.landing.hero.bookAppointment}</span>
              </Link>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <div className="flex lg:hidden">
              <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                <Dialog.Trigger
                  aria-label={t.nav.openMenu}
                  className="grid size-11 place-items-center rounded-full border border-border bg-background/90 text-foreground hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Menu className="size-5" />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs" />
                  <Dialog.Popup className="fixed inset-y-0 end-0 z-[61] flex w-[min(22rem,85vw)] flex-col overflow-y-auto bg-background border-s border-border p-6 text-foreground shadow-2xl outline-none data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full rtl:data-[starting-style]:-translate-x-full rtl:data-[ending-style]:-translate-x-full transition-transform duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <path d="M7.4 4.25c-2.12 0-3.4 1.72-3.4 4.2 0 2.29.86 3.48 1.73 4.83.78 1.2 1.17 4.72 2.43 4.72 1.03 0 1.39-3.76 3.84-3.76s2.81 3.76 3.84 3.76c1.26 0 1.65-3.52 2.43-4.72.87-1.35 1.73-2.54 1.73-4.83 0-2.48-1.28-4.2-3.4-4.2-1.54 0-2.23.71-4.6.71s-3.06-.71-4.6-.71Z" />
                          </svg>
                        </span>
                        <span className="font-semibold text-foreground">{t.brand.name}</span>
                      </div>
                      <Dialog.Close
                        aria-label={t.nav.closeMenu}
                        className="grid size-11 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <X className="size-5" />
                      </Dialog.Close>
                    </div>

                    <Dialog.Title className="sr-only">{t.nav.menuTitle}</Dialog.Title>

                    {/* Mobile 4 Navigation Links */}
                    <nav aria-label={t.nav.mobile} className="mt-4 flex flex-col divide-y divide-border">
                      <Link
                        href="/"
                        className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t.nav.home}
                      </Link>
                      <Link
                        href="/services"
                        className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t.nav.services}
                      </Link>
                      <Link
                        href="/about"
                        className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t.nav.aboutUs || "About us"}
                      </Link>
                      <Link
                        href="/contact"
                        className="flex min-h-12 items-center text-sm font-medium text-foreground hover:text-primary"
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
                          className="min-h-11 px-4 py-2 text-xs font-semibold rounded-full border border-border bg-secondary/50 text-foreground hover:bg-secondary"
                        >
                          {locale === "en" ? "English (EN)" : "العربية (AR)"}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="grid size-11 place-items-center rounded-full border border-border bg-secondary/50 text-foreground hover:bg-secondary"
                        >
                          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Book CTA */}
                    <div className="mt-8 grid gap-3">
                      <Link
                        href="/book"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:brightness-105"
                      >
                        {t.landing.hero.bookAppointment}
                      </Link>
                    </div>
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
