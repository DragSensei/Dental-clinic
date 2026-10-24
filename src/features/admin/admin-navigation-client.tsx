"use client";

import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/i18n/locale-provider";
import { DashboardSidebar, type DashboardNavItem } from "@/components/shared/dashboard-sidebar";
import { useAdminSidebar } from "./admin-sidebar-context";

const navConfig = [
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

  const items: DashboardNavItem[] = navConfig.map(([key, href, Icon]) => {
    const active =
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      (href === "/admin/accounts" &&
        (pathname.startsWith("/admin/doctors") || pathname.startsWith("/admin/patients")));
    return {
      key: href,
      label: t.admin.nav[key],
      href,
      icon: Icon,
      active,
    };
  });

  return (
    <DashboardSidebar
      items={items}
      workspaceLabel={t.admin.nav.workspace}
      navAriaLabel={t.admin.nav.label}
      collapsed={collapsed}
      onToggle={onToggle}
      expandLabel={t.admin.nav.expand}
      collapseLabel={t.admin.nav.collapse}
      expandTitle={t.admin.nav.expandTitle}
      collapseTitle={t.admin.nav.collapseTitle}
      signedInEmail={signedInEmail}
      userDisplayName={signedInEmail ?? "Admin"}
      roleLabel={t.admin.accounts.roleAdmin}
      signOutLabel={t.admin.layout.signOut}
      onSignOut={onSignOut}
    />
  );
}
