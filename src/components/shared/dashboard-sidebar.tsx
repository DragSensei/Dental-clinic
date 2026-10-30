import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, User, type LucideIcon } from "lucide-react";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import type { BottomNavItem } from "@/components/ui/bottom-nav-bar";

export type DashboardNavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
};

export type DashboardSidebarProps = {
  items: DashboardNavItem[];
  workspaceLabel: string;
  navAriaLabel: string;
  collapsed: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
  expandTitle: string;
  collapseTitle: string;
  signedInEmail?: string | null;
  userDisplayName?: string | null;
  roleLabel: string;
  signOutLabel: string;
  onSignOut?: () => void;
};

export function DashboardSidebar({
  items,
  workspaceLabel,
  navAriaLabel,
  collapsed,
  onToggle,
  expandLabel,
  collapseLabel,
  expandTitle,
  collapseTitle,
  signedInEmail,
  userDisplayName,
  roleLabel,
  signOutLabel,
  onSignOut,
}: DashboardSidebarProps) {
  const mobileItems: BottomNavItem[] = items.map((item) => ({
    key: item.href,
    label: item.label,
    icon: item.icon,
    href: item.href,
    active: item.active,
  }));

  const userInitial = userDisplayName
    ? userDisplayName.charAt(0).toUpperCase()
    : signedInEmail
    ? signedInEmail.charAt(0).toUpperCase()
    : "A";

  return (
    <>
      <DashboardBottomNav items={mobileItems} ariaLabel={navAriaLabel} />

      <aside
        className={`hidden self-start p-3 transition-[width] duration-300 motion-reduce:transition-none md:sticky md:top-14 md:flex md:flex-col md:h-[calc(100vh-3.5rem)] ${
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
                {workspaceLabel}
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!collapsed}
              aria-label={collapsed ? expandLabel : collapseLabel}
              title={collapsed ? expandTitle : collapseTitle}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="sr-only">{collapsed ? expandLabel : collapseLabel}</span>
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" className="size-5 rtl:-scale-x-100" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="size-5 rtl:-scale-x-100" />
              )}
            </button>
          </div>

          <nav
            aria-label={navAriaLabel}
            className={`min-h-0 flex-1 overflow-y-auto py-2 ${collapsed ? "space-y-3" : "space-y-1.5"}`}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`group flex min-h-11 items-center text-sm font-medium transition-[background-color,color] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  collapsed
                    ? "h-11 w-11 justify-center gap-0 px-0 mx-auto rounded-xl"
                    : "w-full gap-3 px-3 py-2.5 rounded-xl"
                } ${
                  item.active
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg transition-[background-color,color,transform] duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <item.icon aria-hidden="true" className="size-5" />
                </span>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${
                    collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto shrink-0 border-t border-border pt-3">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  title={signedInEmail ?? undefined}
                  aria-label={signedInEmail ?? undefined}
                >
                  {signedInEmail || userDisplayName ? (
                    userInitial
                  ) : (
                    <User aria-hidden="true" className="size-5" />
                  )}
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title={signOutLabel}
                    aria-label={signOutLabel}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    <span className="sr-only">{signOutLabel}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 p-2.5">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  aria-hidden="true"
                >
                  {signedInEmail || userDisplayName ? (
                    userInitial
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground"
                    title={userDisplayName || signedInEmail || undefined}
                  >
                    {userDisplayName || signedInEmail || "User"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {roleLabel}
                  </p>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title={signOutLabel}
                    aria-label={signOutLabel}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    <span className="sr-only">{signOutLabel}</span>
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

export default DashboardSidebar;
