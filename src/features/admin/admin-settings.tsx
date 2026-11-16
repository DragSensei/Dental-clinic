"use client";
import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import { PageTitle, Panel } from "@/features/admin/admin-ui";
import { useAdminSidebar } from "./admin-sidebar-context";

export function AdminSettings({ clinic }: { clinic: ReturnType<typeof useClinic> }) {
  const { t } = useI18n();
  const sidebar = useAdminSidebar();
  const [resetDone, setResetDone] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <PageTitle title={t.admin.settings.title} description={t.admin.settings.description} />
      <Panel>
        <h2 className="text-lg font-semibold">{t.admin.settings.resetTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t.admin.settings.resetBody}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t.admin.settings.styling}</p>
        <AnimatePresence initial={false}>
          {resetDone && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-4 rounded-lg border border-brand-border bg-brand-subtle p-3 text-sm font-medium"
              aria-live="polite"
            >
              {t.admin.settings.resetDone}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="min-h-11 font-semibold shadow-xs transition-transform active:scale-[0.98]"
            variant="accent"
            onClick={() => {
              clinic.resetDemo();
              setResetDone(true);
            }}
          >
            {t.admin.settings.reset}
          </Button>
          {sidebar?.onSignOut && (
            <Button
              type="button"
              className="min-h-11 gap-2 font-semibold transition-transform active:scale-[0.98]"
              variant="outline"
              onClick={sidebar.onSignOut}
            >
              <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              {t.admin.layout.signOut}
            </Button>
          )}
        </div>
      </Panel>
    </MotionConfig>
  );
}
