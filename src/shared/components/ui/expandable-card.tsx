"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/lib/utils";

export interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  category?: string;
  duration?: number | string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  initiallyOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}

const emptySubscribe = () => () => {};

let elevationSequence = 60;

const springTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

export function ExpandableCard({
  title,
  src,
  description,
  category,
  duration,
  children,
  className,
  classNameExpanded,
  initiallyOpen = false,
  onOpenChange,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(initiallyOpen);
  const [cardZIndex, setCardZIndex] = React.useState<number | undefined>(
    initiallyOpen ? ++elevationSequence : undefined
  );
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const cardRef = React.useRef<HTMLDivElement>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = React.useId();

  const handleOpen = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCardZIndex(++elevationSequence);
    setActive(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleClose = React.useCallback(() => {
    setCardZIndex(++elevationSequence);
    setActive(false);
    onOpenChange?.(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setCardZIndex(undefined);
      closeTimerRef.current = null;
    }, 550);
  }, [onOpenChange]);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!active) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [active, handleClose]);

  return (
    <>
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={handleClose}
                  className="fixed inset-0 z-50 h-full w-full bg-black/55 backdrop-blur-md"
                />
              )}
            </AnimatePresence>

            {active && (
              <div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  layoutId={`card-${title}-${id}`}
                  ref={cardRef}
                  transition={springTransition}
                  style={{ borderRadius: 24 }}
                  className={cn(
                    "pointer-events-auto relative flex max-h-[90vh] w-full max-w-[660px] flex-col overflow-hidden border border-brand-border bg-card text-card-foreground shadow-2xl",
                    classNameExpanded
                  )}
                  {...props}
                >
                  <motion.div
                    layoutId={`image-${title}-${id}`}
                    transition={springTransition}
                    className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-muted before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-14 before:bg-gradient-to-t before:from-card/90 before:to-transparent"
                  >
                    <img
                      src={src}
                      alt={title}
                      className="h-full w-full object-cover object-center"
                    />
                    {category && (
                      <motion.span
                        layout="position"
                        layoutId={`category-${title}-${id}`}
                        transition={springTransition}
                        className="absolute top-3.5 start-3.5 z-20 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-brand-primary shadow-xs backdrop-blur-md"
                      >
                        {category}
                      </motion.span>
                    )}
                  </motion.div>

                  <motion.div
                    layout="position"
                    transition={springTransition}
                    className="flex items-start justify-between gap-4 border-b border-brand-border px-6 pt-4 pb-3.5 sm:px-7 sm:pt-5 sm:pb-4"
                  >
                    <motion.div
                      layout="position"
                      layoutId={`heading-${title}-${id}`}
                      transition={springTransition}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                          {description}
                        </p>
                        {duration && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-brand-subtle px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                            {duration} mins
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {title}
                      </h3>
                    </motion.div>

                    <button
                      type="button"
                      aria-label="Close dialog"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                      }}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-subtle text-muted-foreground transition-colors duration-200 hover:bg-brand-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </motion.div>

                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.18, ease: "easeOut" }}
                    className="flex-1 overflow-y-auto px-6 pb-5 pt-3.5 sm:px-7 sm:pb-6 [scrollbar-width:thin]"
                  >
                    <div className="flex flex-col items-start text-sm leading-relaxed text-muted-foreground">
                      {children}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </>,
          document.body
        )}

      <motion.div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={active}
        layoutId={`card-${title}-${id}`}
        transition={springTransition}
        onLayoutAnimationComplete={() => {
          if (!active) {
            setCardZIndex(undefined);
          }
        }}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        style={{
          borderRadius: 16,
          zIndex: active ? 60 : cardZIndex,
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col justify-between overflow-hidden border border-brand-border bg-card p-3.5 shadow-sm hover:border-brand-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring outline-none",
          className
        )}
      >
        <motion.div
          layoutId={`image-${title}-${id}`}
          transition={springTransition}
          style={{ borderRadius: 12 }}
          className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-muted"
        >
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover object-center"
          />
          {category && (
            <motion.span
              layout="position"
              layoutId={`category-${title}-${id}`}
              transition={springTransition}
              className="absolute top-2.5 start-2.5 z-10 rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary shadow-xs backdrop-blur-md"
            >
              {category}
            </motion.span>
          )}
        </motion.div>

        <motion.div
          layout="position"
          transition={springTransition}
          className="flex flex-1 items-start justify-between gap-3 pt-3.5"
        >
          <motion.div
            layout="position"
            layoutId={`heading-${title}-${id}`}
            transition={springTransition}
            className="flex flex-col min-w-0 flex-1"
          >
            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
              {description}
            </p>
            <h3 className="mt-1 font-semibold text-base text-foreground transition-colors group-hover:text-brand-primary">
              {title}
            </h3>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
