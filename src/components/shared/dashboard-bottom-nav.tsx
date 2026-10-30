"use client";

import { BottomNavBar, type BottomNavItem } from "@/components/ui/bottom-nav-bar";

export interface DashboardBottomNavProps {
  items: BottomNavItem[];
  ariaLabel?: string;
  className?: string;
}

export function DashboardBottomNav({
  items,
  ariaLabel,
  className,
}: DashboardBottomNavProps) {
  return (
    <div className="md:hidden">
      <BottomNavBar
        items={items}
        ariaLabel={ariaLabel}
        stickyBottom
        className={className}
      />
    </div>
  );
}

export default DashboardBottomNav;
