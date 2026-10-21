"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/locale-provider";
import { useAdminSidebar } from "./admin-sidebar-context";

const items = [
  ["overview", "/admin/overview", LayoutDashboard],
  ["appointments", "/admin/appointments", CalendarCheck2],
  ["calendar", "/admin/calendar", CalendarDays],
  ["accounts", "/admin/accounts", Users],
  ["services", "/admin/services", Wrench],
  ["settings", "/admin/settings", Settings],
] as const;

export function AdminNavigationClient(props?: {
  collapsed?: boolean;
  onToggle?: () => void;
  signedInEmail?: string | null;
  onSignOut?: () => void;
}) {
  const context = useAdminSidebar();
  const collapsed = props?.collapsed ?? context?.collapsed ?? false;
  const onToggle = props?.onToggle ?? context?.onToggle ?? (() => {});
  const signedInEmail = props?.signedInEmail !== undefined ? props.signedInEmail : context?.signedInEmail;
  const onSignOut = props?.onSignOut ?? context?.onSignOut;

  const pathname = usePathname();
  const { t } = useI18n();

  const links = (mobile = false) =>
    items.map(([key, href, Icon]) => {
      const active =
        pathname === href ||
        pathname.startsWith(`${href}/`) ||
        (href === "/admin/accounts" &&
          (pathname.startsWith("/admin/doctors") || pathname.startsWith("/admin/patients")));
      const label = t.admin.nav[key];
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          title={collapsed && !mobile ? label : undefined}
          className={`group flex min-h-11 items-center text-sm font-medium transition-[background-color,color] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            mobile
              ? "shrink-0 gap-3 px-3 rounded-full"
              : collapsed
              ? "h-11 w-11 justify-center gap-0 px-0 mx-auto rounded-xl"
              : "w-full gap-3 px-3 py-2.5 rounded-xl"
          } ${
            active
              ? "bg-secondary text-foreground font-semibold"
              : mobile
              ? "text-muted-foreground hover:bg-muted hover:text-foreground"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-lg transition-[background-color,color,transform] duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${
              collapsed && !mobile ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            }`}
          >
            {label}
          </span>
        </Link>
      );
    });

  const userInitial = signedInEmail ? signedInEmail.charAt(0).toUpperCase() : "A";

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 md:hidden">
        <nav aria-label={t.admin.nav.label} className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {links(true)}
        </nav>
        {signedInEmail && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            title={t.admin.layout.signOut}
            aria-label={t.admin.layout.signOut}
            className="inline-grid size-11 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </button>
        )}
      </div>

      <aside
        className={`hidden p-3 h-full transition-[width] duration-300 motion-reduce:transition-none md:flex md:flex-col ${
          collapsed ? "md:w-[88px]" : "md:w-[272px]"
        }`}
      >
        <div
          className={`flex h-full min-h-0 flex-col rounded-[2rem] border border-border bg-card shadow-sm ${
            collapsed ? "p-1.5" : "p-3"
          }`}
        >
          <div
            className={`mb-2 flex h-12 shrink-0 items-center ${
              collapsed ? "justify-center" : "justify-between px-2"
            }`}
          >
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                {t.admin.nav.workspace}
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!collapsed}
              aria-label={collapsed ? t.admin.nav.expand : t.admin.nav.collapse}
              title={collapsed ? t.admin.nav.expandTitle : t.admin.nav.collapseTitle}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="sr-only">{collapsed ? t.admin.nav.expand : t.admin.nav.collapse}</span>
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" className="size-5 rtl:-scale-x-100" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="size-5 rtl:-scale-x-100" />
              )}
            </button>
          </div>

          <nav
            aria-label={t.admin.nav.label}
            className={`min-h-0 flex-1 overflow-y-auto py-2 ${collapsed ? "space-y-3" : "space-y-1.5"}`}
          >
            {links()}
          </nav>

          <div className="mt-auto shrink-0 border-t border-border pt-3">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  title={signedInEmail ?? undefined}
                  aria-label={signedInEmail ?? undefined}
                >
                  {signedInEmail ? userInitial : <User aria-hidden="true" className="size-5" />}
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title={t.admin.layout.signOut}
                    aria-label={t.admin.layout.signOut}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    <span className="sr-only">{t.admin.layout.signOut}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 p-2.5">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  aria-hidden="true"
                >
                  {signedInEmail ? userInitial : <User className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground" title={signedInEmail ?? undefined}>
                    {signedInEmail ?? "Admin"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {t.admin.accounts.roleAdmin}
                  </p>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title={t.admin.layout.signOut}
                    aria-label={t.admin.layout.signOut}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    <span className="sr-only">{t.admin.layout.signOut}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
