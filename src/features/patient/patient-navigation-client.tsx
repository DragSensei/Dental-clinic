"use client";

import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  CreditCard,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
} from "lucide-react";
import { useI18n } from "@/i18n/locale-provider";
import { DashboardSidebar, type DashboardNavItem } from "@/components/shared/dashboard-sidebar";
import { usePatientSidebar } from "./patient-sidebar-context";

const navConfig = [
  { key: "overview", href: "/patient/overview", icon: LayoutDashboard },
  { key: "appointments", href: "/patient/appointments", icon: CalendarCheck2 },
  { key: "intake", href: "/patient/forms", icon: FileText },
  { key: "treatment", href: "/patient/treatment-plan", icon: Stethoscope },
  { key: "care", href: "/patient/care", icon: HeartPulse },
  { key: "billing", href: "/patient/billing", icon: CreditCard },
] as const;

export function PatientNavigationClient(props?: {
  collapsed?: boolean;
  onToggle?: () => void;
  signedInEmail?: string | null;
  userDisplayName?: string | null;
  onSignOut?: () => void;
}) {
  const context = usePatientSidebar();
  const collapsed = props?.collapsed ?? context?.collapsed ?? false;
  const onToggle = props?.onToggle ?? context?.onToggle ?? (() => {});
  const signedInEmail = props?.signedInEmail !== undefined ? props.signedInEmail : context?.signedInEmail;
  const userDisplayName = props?.userDisplayName !== undefined ? props.userDisplayName : context?.userDisplayName;
  const onSignOut = props?.onSignOut ?? context?.onSignOut;

  const pathname = usePathname();
  const { t } = useI18n();

  const items: DashboardNavItem[] = navConfig.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const label = (t.patient.nav[item.key as keyof typeof t.patient.nav] as string) ?? item.key;
    return {
      key: item.href,
      label,
      href: item.href,
      icon: item.icon,
      active,
    };
  });

  return (
    <DashboardSidebar
      items={items}
      workspaceLabel={t.patient.nav.portalTitle}
      navAriaLabel={t.patient.nav.navAriaLabel}
      collapsed={collapsed}
      onToggle={onToggle}
      expandLabel={t.patient.nav.expandSidebar}
      collapseLabel={t.patient.nav.collapseSidebar}
      expandTitle={t.patient.nav.expandTitle}
      collapseTitle={t.patient.nav.collapseTitle}
      signedInEmail={signedInEmail}
      userDisplayName={userDisplayName ?? signedInEmail ?? t.patient.nav.defaultUserName}
      roleLabel={t.patient.nav.roleLabel}
      signOutLabel={t.admin.layout.signOut}
      onSignOut={onSignOut}
    />
  );
}

export default PatientNavigationClient;
