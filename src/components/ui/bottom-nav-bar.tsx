"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Home,
  Briefcase,
  ArrowLeftRight,
  MessageSquare,
  Award,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavItem = {
  key?: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

export type BottomNavBarProps = {
  items?: BottomNavItem[];
  defaultIndex?: number;
  activeIndex?: number;
  onSelect?: (index: number, item: BottomNavItem) => void;
  stickyBottom?: boolean;
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_NAV_ITEMS: BottomNavItem[] = [
  { label: "Home", icon: Home },
  { label: "Services", icon: Briefcase },
  { label: "Activity", icon: ArrowLeftRight },
  { label: "Messages", icon: MessageSquare },
  { label: "Awards", icon: Award },
  { label: "Profile", icon: User },
];

export function BottomNavBar({
  items = DEFAULT_NAV_ITEMS,
  defaultIndex = 0,
  activeIndex,
  onSelect,
  stickyBottom = false,
  ariaLabel,
  className,
}: BottomNavBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const [internalIndex, setInternalIndex] = useState(defaultIndex);

  const activeExplicitIndex = items.findIndex((item) => item.active === true);
  const currentActiveIndex =
    activeIndex !== undefined
      ? activeIndex
      : activeExplicitIndex !== -1
      ? activeExplicitIndex
      : internalIndex;

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 26 }
      }
      role="navigation"
      aria-label={ariaLabel ?? "Bottom Navigation"}
      className={cn(
        "bg-card dark:bg-card border border-border rounded-full flex items-center p-1.5 shadow-xl gap-0.5 max-w-[calc(100vw-16px)] min-h-[56px]",
        stickyBottom && "fixed inset-x-0 bottom-4 mx-auto z-40 w-fit",
        className
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = currentActiveIndex === idx;
        const itemKey = item.key ?? item.href ?? `${item.label}-${idx}`;

        const handleClick = () => {
          setInternalIndex(idx);
          item.onClick?.();
          onSelect?.(idx, item);
        };

        const itemContent = (
          <>
            <Icon
              size={20}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 transition-colors duration-200"
            />
            <motion.div
              initial={false}
              animate={{
                width: isActive ? "auto" : 0,
                opacity: isActive ? 1 : 0,
                marginInlineStart: isActive ? 6 : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      width: { type: "spring", stiffness: 350, damping: 32 },
                      opacity: { duration: 0.19 },
                      marginInlineStart: { duration: 0.19 },
                    }
              }
              className="overflow-hidden flex items-center max-w-[80px]"
            >
              <span
                className={cn(
                  "font-medium text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis leading-[1.9]",
                  isActive
                    ? "text-primary dark:text-primary opacity-100"
                    : "opacity-0"
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </>
        );

        const itemClasses = cn(
          "flex items-center justify-center gap-0 px-2.5 py-2 rounded-full transition-colors duration-200 relative h-11 min-w-[44px] min-h-[44px]",
          isActive
            ? "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary"
            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        );

        if (item.href) {
          return (
            <Link
              key={itemKey}
              href={item.href}
              onClick={handleClick}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={itemClasses}
            >
              {itemContent}
            </Link>
          );
        }

        return (
          <motion.button
            key={itemKey}
            type="button"
            onClick={handleClick}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className={itemClasses}
          >
            {itemContent}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
