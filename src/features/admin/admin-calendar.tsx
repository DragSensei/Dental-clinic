"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Appointment } from "@/data/mock/catalog";
import { getAvailableDates } from "@/data/clinic-repository";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { AppointmentRows } from "@/features/admin/admin-appointments";
import { PageTitle, Panel, useDateLabel } from "@/features/admin/admin-ui";
import { AppCombobox } from "@/components/ui/combobox";

export function Calendar({ appointments, serviceFor, doctorFor }: { appointments: readonly Appointment[]; serviceFor: (id: string) => string; doctorFor: (id: string) => string }) {
  const { services, doctors } = useClinic();
  const { t } = useI18n();
  const dateLabel = useDateLabel();
  const days = useMemo(() => Array.from(new Set(services.flatMap((service) => doctors.filter((doctor) => doctor.serviceIds.includes(service.id)).flatMap((doctor) => getAvailableDates(service.id, doctor.id))).concat(appointments.filter((item) => item.status === "confirmed").map((item) => item.date)))).sort(), [appointments, doctors, services]);
  const [date, setDate] = useState(days[0] ?? "");
  const rows = appointments.filter((item) => item.status === "confirmed" && item.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const quickDays = days.slice(0, 7);

  return (
    <MotionConfig reducedMotion="user">
      <PageTitle title={t.admin.calendar.title} description={t.admin.calendar.description} />
      <Panel>
        <div className="flex flex-col gap-4">
          <div className="max-w-sm">
            <AppCombobox
              label={t.admin.calendar.dateLabel}
              options={days.map((day) => ({ value: day, label: dateLabel(day) }))}
              value={date}
              onValueChange={setDate}
              placeholder={t.admin.calendar.choose}
              emptyMessage={t.admin.calendar.noMatch}
            />
          </div>
          {quickDays.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickDays.map((day) => {
                const active = date === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDate(day)}
                    className={`relative inline-flex min-h-11 items-center overflow-hidden rounded-full px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      active
                        ? "text-primary-foreground font-semibold"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-calendar-date-pill"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-primary shadow-xs"
                      />
                    )}
                    <span className="relative z-10 tabular-nums">{dateLabel(day)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={date || "none"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <h2 className="mt-6 text-lg font-semibold">
              {date ? interpolate(t.admin.calendar.dateUtc, { date: dateLabel(date) }) : t.admin.calendar.none}
            </h2>
            <div className="mt-3">
              <AppointmentRows appointments={rows} serviceFor={serviceFor} doctorFor={doctorFor} />
            </div>
          </motion.div>
        </AnimatePresence>
      </Panel>
    </MotionConfig>
  );
}
