"use client";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useClinic } from "@/shared/data/use-clinic";
import { useI18n } from "@/shared/i18n/locale-provider";
import { PageTitle, Panel } from "@/features/admin/admin-ui";
export function AdminSettings({ clinic }: { clinic: ReturnType<typeof useClinic> }) {
  const { t } = useI18n();
  const [resetDone, setResetDone] = useState(false);
  return <><PageTitle title={t.admin.settings.title} description={t.admin.settings.description}/><Panel><h2 className="text-lg font-semibold">{t.admin.settings.resetTitle}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t.admin.settings.resetBody}</p><p className="mt-3 text-sm text-muted-foreground">{t.admin.settings.styling}</p>{resetDone && <p className="mt-4 rounded-lg bg-brand-subtle p-3 text-sm" aria-live="polite">{t.admin.settings.resetDone}</p>}<Button type="button" className="mt-5 min-h-11 font-semibold shadow-xs" variant="accent" onClick={() => { clinic.resetDemo(); setResetDone(true); }}>{t.admin.settings.reset}</Button></Panel></>;
}
