"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAvailableDates, getAvailableSlots } from "@/data/clinic-repository";
import type { Appointment } from "@/data/mock/catalog";
import { useClinic } from "@/data/use-clinic";
import { errorKeyFrom } from "@/i18n/errors";
import { interpolate } from "@/i18n/format";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/locale-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AppCombobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoldButton } from "@/components/ui/hold-button";
import { Empty, PageTitle, Panel, Status, field, labelClass, useDateLabel } from "@/features/admin/admin-ui";

export function AppointmentRows({
  appointments,
  serviceFor,
  doctorFor,
}: {
  appointments: readonly Appointment[];
  serviceFor: (id: string) => string;
  doctorFor: (id: string) => string;
}) {
  const { locale, t } = useI18n();
  const dateLabel = useDateLabel();
  if (!appointments.length) return <Empty>{t.admin.appointments.noMatch}</Empty>;

  return (
    <>
      <div className="grid min-w-0 gap-3 xl:hidden">
        {appointments.map((item) => (
          <article key={item.id} className="min-w-0 rounded-xl border border-border p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="min-w-0 font-semibold [overflow-wrap:anywhere]">{item.patientName}</h3>
                {item.attendanceConfirmed && (
                  <Badge variant="success" className="mt-1 text-xs">
                    <CheckCircle2 className="size-3 me-1" />
                    Confirmed by Patient ✓
                  </Badge>
                )}
              </div>
              <Status status={item.status} />
            </div>

            <dl className="mt-3 grid min-w-0 gap-2 text-sm">
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">{t.labels.service}</dt>
                <dd className="min-w-0 text-end [overflow-wrap:anywhere]">{serviceFor(item.serviceId)}</dd>
              </div>
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">{t.labels.clinician}</dt>
                <dd className="min-w-0 text-end [overflow-wrap:anywhere]">{doctorFor(item.doctorId)}</dd>
              </div>
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">{t.labels.dateTime}</dt>
                <dd className="min-w-0 text-end tabular-nums">
                  {dateLabel(item.date)} · {interpolate(t.labels.utc, { time: item.time })}
                </dd>
              </div>
              {item.note && (
                <div className="flex min-w-0 justify-between gap-3 border-t border-border/60 pt-1.5">
                  <dt className="shrink-0 text-muted-foreground">{locale === "ar" ? "ملاحظة المريض" : "Patient Note"}</dt>
                  <dd className="min-w-0 text-end text-xs italic text-muted-foreground [overflow-wrap:anywhere]">
                    &ldquo;{item.note}&rdquo;
                  </dd>
                </div>
              )}
            </dl>

            <Link
              className="mt-3 inline-flex min-h-11 min-w-11 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={`/admin/appointments/${item.id}`}
            >
              {t.admin.appointments.viewAppointment}
            </Link>
          </article>
        ))}
      </div>

      <div
        role="region"
        aria-label={t.admin.appointments.tableLabel}
        tabIndex={0}
        className="hidden min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:block"
      >
        <table className="w-full min-w-[900px] table-fixed border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              {t.admin.appointments.columns.map((heading) => (
                <th scope="col" key={heading} className="px-3 py-3 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.map((item) => (
              <tr key={item.id} className="align-middle">
                <td className="break-words px-3 py-4 font-medium">
                  <div>{item.patientName}</div>
                  {item.attendanceConfirmed && (
                    <Badge variant="success" className="mt-1 text-[11px] font-normal">
                      Confirmed by Patient ✓
                    </Badge>
                  )}
                  {item.note && (
                    <p className="mt-1 max-w-[200px] truncate text-xs italic text-muted-foreground" title={item.note}>
                      &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </td>
                <td className="break-words px-3 py-4">{serviceFor(item.serviceId)}</td>
                <td className="break-words px-3 py-4">{doctorFor(item.doctorId)}</td>
                <td className="px-3 py-4 tabular-nums">
                  {dateLabel(item.date)} · {item.time}
                </td>
                <td className="px-3 py-4">
                  <Status status={item.status} />
                </td>
                <td className="px-3 py-4">
                  <Link
                    className="inline-flex min-h-11 min-w-11 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={`/admin/appointments/${item.id}`}
                  >
                    {t.admin.appointments.view}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Appointments({
  appointments,
  serviceFor,
  doctorFor,
}: {
  appointments: readonly Appointment[];
  serviceFor: (id: string) => string;
  doctorFor: (id: string) => string;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date");

  const rows = appointments
    .filter(
      (item) =>
        (status === "all" || item.status === status) &&
        `${item.patientName} ${item.email} ${item.phone} ${serviceFor(item.serviceId)} ${doctorFor(
          item.doctorId
        )} ${item.note ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .slice()
    .sort((a, b) =>
      sort === "patient"
        ? a.patientName.localeCompare(b.patientName)
        : `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

  return (
    <>
      <PageTitle title={t.admin.appointments.title} description={t.admin.appointments.description} />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px] xl:gap-x-6">
          <label className={labelClass}>
            {t.admin.appointments.search}
            <input
              className={field}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.admin.appointments.searchPlaceholder}
            />
          </label>
          <AppCombobox
            label={t.admin.appointments.status}
            options={[
              { value: "all", label: t.admin.appointments.statusAll },
              { value: "confirmed", label: t.admin.appointments.statusConfirmed },
              { value: "cancelled", label: t.admin.appointments.statusCancelled },
            ]}
            value={status}
            onValueChange={setStatus}
            placeholder={t.admin.appointments.filterStatus}
          />
          <AppCombobox
            label={t.admin.appointments.sortBy}
            options={[
              { value: "date", label: t.admin.appointments.sortDate },
              { value: "patient", label: t.admin.appointments.sortPatient },
            ]}
            value={sort}
            onValueChange={setSort}
            placeholder={t.admin.appointments.sortPlaceholder}
          />
        </div>
        {!appointments.length && (
          <div className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
            {t.admin.appointments.none}{" "}
            <Link
              className="mt-2 inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
              href="/book"
            >
              {t.admin.appointments.createLink}
            </Link>{" "}
            {t.admin.appointments.inSession}
          </div>
        )}
        <div className="mt-5">
          <AppointmentRows appointments={rows} serviceFor={serviceFor} doctorFor={doctorFor} />
        </div>
      </Panel>
    </>
  );
}

export function AppointmentDetail({
  id,
  appointments,
  serviceFor,
  doctorFor,
}: {
  id: string;
  appointments: readonly Appointment[];
  serviceFor: (id: string) => string;
  doctorFor: (id: string) => string;
}) {
  const { locale, t } = useI18n();
  const dateLabel = useDateLabel();
  const clinic = useClinic();
  const item = appointments.find((appointment) => appointment.id === id);
  const [date, setDate] = useState(item?.date ?? "");
  const [time, setTime] = useState(item?.time ?? "");
  const [pending, setPending] = useState(false);
  const dates = item ? getAvailableDates(item.serviceId, item.doctorId) : [];
  const slots = item && date ? getAvailableSlots(item.serviceId, item.doctorId, date) : [];
  const [error, setError] = useState<ErrorKey | "">("");
  const [notice, setNotice] = useState<"cancelled" | "rescheduled" | "">("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (!item) {
    return (
      <>
        <PageTitle title={t.admin.detail.notFoundTitle} description={t.admin.detail.notFoundBody} />
        <Link className={buttonVariants({ variant: "outline", className: "min-h-11" })} href="/admin/appointments">
          {t.admin.detail.back}
        </Link>
      </>
    );
  }

  const intake = clinic.getPatientIntakeForm(item.email);
  const hasMedicalAlert = intake && (intake.allergies.length > 0 || intake.conditions.length > 0);

  const reservationDetails: [string, string][] = [
    [t.labels.patient, item.patientName],
    [t.labels.email, item.email],
    [t.labels.phone, item.phone],
    [t.labels.service, serviceFor(item.serviceId)],
    [t.labels.doctor, doctorFor(item.doctorId)],
    [t.labels.dateTime, `${dateLabel(item.date)} · ${interpolate(t.labels.utc, { time: item.time })}`],
    ...(item.note ? [[locale === "ar" ? "ملاحظة المريض" : "Patient Note", item.note] as [string, string]] : []),
  ];

  return (
    <>
      <PageTitle
        title={t.admin.detail.title}
        description={t.admin.detail.body}
        action={
          <Link className={buttonVariants({ variant: "outline", className: "min-h-11" })} href="/admin/appointments">
            {t.admin.detail.back}
          </Link>
        }
      />

      {/* Workflow #3 Step 5 System Sync: Medical Alert Banner */}
      {hasMedicalAlert && (
        <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <AlertTitle className="font-bold text-destructive">
              Medical Alert: High-Risk Clinical Factors
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm font-medium">
              {intake.allergies.length > 0 && (
                <span className="me-3">
                  <strong>Allergies:</strong> {intake.allergies.join(", ")}
                </span>
              )}
              {intake.conditions.length > 0 && (
                <span>
                  <strong>Conditions:</strong> {intake.conditions.join(", ")}
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div aria-live="polite">
        {error && <p className="mb-4 text-sm text-destructive">{t.errors[error]}</p>}
        {notice && <p className="mb-4 rounded-lg bg-brand-subtle p-3 text-sm">{t.admin.detail[notice]}</p>}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.admin.detail.reservation}</h2>
            {item.attendanceConfirmed && (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="size-3 me-1" />
                Confirmed by Patient ✓
              </Badge>
            )}
          </div>

          <dl className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            {reservationDetails.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-1 min-w-0 text-sm [overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t.labels.status}</dt>
              <dd className="mt-1">
                <Status status={item.status} />
              </dd>
            </div>
          </dl>

          {item.status === "confirmed" && (
            <Button
              type="button"
              className="mt-6 min-h-11"
              variant="destructive"
              disabled={pending}
              onClick={() => setCancelDialogOpen(true)}
            >
              {t.admin.detail.cancel}
            </Button>
          )}

          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="rounded-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-destructive">
                  <AlertTriangle className="size-5 text-destructive" />
                  {locale === "ar" ? "تأكيد إلغاء الموعد" : "Confirm Appointment Cancellation"}
                </DialogTitle>
                <DialogDescription className="text-xs pt-1 leading-relaxed">
                  {locale === "ar"
                    ? `هل أنت متأكد من إلغاء موعد المريض (${item.patientName}) في ${dateLabel(item.date)} الساعة ${item.time}؟`
                    : `Are you sure you want to cancel the appointment for ${item.patientName} on ${dateLabel(item.date)} at ${item.time}?`}
                </DialogDescription>
              </DialogHeader>

              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive my-1">
                <AlertTriangle className="size-4 text-destructive" />
                <AlertTitle className="text-xs font-semibold">
                  {locale === "ar" ? "تحذير: إجراء إداري نهائي" : "Warning: Irreversible Admin Action"}
                </AlertTitle>
                <AlertDescription className="text-xs text-destructive/90 mt-1 leading-relaxed">
                  {locale === "ar"
                    ? "سيتم تحرير خانة الطبيب والعيادة فور تأكيد الإلغاء. لمنع الإلغاء العرضي، اضغط مطولاً على الزر لتأكيد العملية."
                    : "This action will permanently cancel the booking and release the clinician's chair and calendar slot. To prevent accidental cancellation, press and hold the button below."}
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2 sm:gap-0 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setCancelDialogOpen(false)}
                  className="min-h-11 rounded-xl text-xs"
                >
                  {locale === "ar" ? "الاحتفاظ بالموعد" : "Keep Appointment"}
                </Button>
                <HoldButton
                  variant="destructive"
                  holdDuration={1500}
                  disabled={pending}
                  holdingLabel={locale === "ar" ? "استمر بالضغط للإلغاء..." : "Keep holding to cancel..."}
                  completeLabel={locale === "ar" ? "تم إلغاء الموعد" : "Appointment Cancelled"}
                  onHoldComplete={async () => {
                    setError("");
                    setNotice("");
                    setPending(true);
                    try {
                      await clinic.cancelAppointment(item.id);
                      setNotice("cancelled");
                      setTimeout(() => {
                        setCancelDialogOpen(false);
                      }, 400);
                    } catch (cause) {
                      setError(errorKeyFrom(cause, "cancel_failed"));
                    } finally {
                      setPending(false);
                    }
                  }}
                  className="min-h-11 rounded-xl text-xs font-semibold"
                >
                  {locale === "ar" ? "اضغط مطولاً لتأكيد الإلغاء" : "Hold to Cancel Appointment"}
                </HoldButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Panel>

        <Panel className="min-w-0">
          <h2 className="text-lg font-semibold">{t.admin.detail.rescheduleTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.admin.detail.rescheduleBody}</p>

          {item.status !== "confirmed" ? (
            <p className="mt-5 text-sm text-muted-foreground">{t.admin.detail.cancelledNote}</p>
          ) : (
            <form
              className="mt-5 grid gap-4"
              onSubmit={async (event: FormEvent) => {
                event.preventDefault();
                setError("");
                setNotice("");
                setPending(true);
                try {
                  await clinic.rescheduleAppointment(item.id, date, time);
                  setNotice("rescheduled");
                } catch (cause) {
                  setError(errorKeyFrom(cause, "reschedule_failed"));
                } finally {
                  setPending(false);
                }
              }}
            >
              <AppCombobox
                label={t.admin.detail.availableDate}
                options={dates.map((day) => ({ value: day, label: dateLabel(day) }))}
                value={date}
                onValueChange={(nextDate) => {
                  setDate(nextDate);
                  setTime("");
                }}
                placeholder={t.admin.detail.chooseDate}
                emptyMessage={t.admin.detail.noDates}
              />
              <AppCombobox
                label={t.admin.detail.availableTime}
                options={slots.map((slot) => ({ value: slot, label: slot }))}
                value={time}
                onValueChange={setTime}
                placeholder={t.admin.detail.chooseTime}
                emptyMessage={t.admin.detail.noTimes}
                disabled={!date}
              />
              <Button
                type="submit"
                variant="accent"
                className="min-h-11 font-semibold"
                disabled={pending || !date || !time || !dates.includes(date) || !slots.includes(time)}
              >
                {t.admin.detail.saveTime}
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </>
  );
}
