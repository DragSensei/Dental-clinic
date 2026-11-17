"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import {
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  AlertTriangle,
  Stethoscope,
  CreditCard,
  FileCheck2,
  FileWarning,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Ban,
} from "lucide-react";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { Appointment } from "@/data/mock/catalog";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HoldButton } from "@/components/ui/hold-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function downloadIcsFile(appointment: Appointment, serviceTitle: string, doctorName: string) {
  const start = new Date(`${appointment.date}T${appointment.time}:00Z`);
  const end = new Date(start.getTime() + 45 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toIcs = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
      d.getUTCMinutes()
    )}${pad(d.getUTCSeconds())}Z`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BlueHaven Dental//Appointment//EN",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@bluehaven.clinic`,
    `DTSTAMP:${toIcs(new Date())}`,
    `DTSTART:${toIcs(start)}`,
    `DTEND:${toIcs(end)}`,
    `SUMMARY:Dental Appointment - ${serviceTitle}`,
    `DESCRIPTION:Appointment with ${doctorName} at BlueHaven Dental Clinic.`,
    "LOCATION:BlueHaven Dental Clinic, Makram Ebeid, Nasr City, Cairo",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `appointment-${appointment.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function PatientOverview() {
  const { signedInEmail, name } = useSession();
  const clinic = useClinic();
  const { locale, formatDate, formatTime, t } = useI18n();

  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelPolicyBlocked, setCancelPolicyBlocked] = useState(false);
  const [remainingHoursNotice, setRemainingHoursNotice] = useState(0);

  const email = signedInEmail || "mariam.a@example.com";
  const dateOpts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
  const shortDateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  // Patient appointments
  const patientAppointments = useMemo(() => {
    return clinic.appointments
      .filter((a) => a.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [clinic.appointments, email]);

  const nextAppointment = useMemo(() => {
    return patientAppointments.find((a) => a.status === "confirmed");
  }, [patientAppointments]);

  // Only one solid (accent) button on the page: when attendance is pending, Confirm takes that role.
  const needsConfirmation = !!nextAppointment && !nextAppointment.attendanceConfirmed;

  // Intake Form
  const intakeForm = clinic.getPatientIntakeForm(email);

  // Treatment Plan
  const treatmentPlan = clinic.getPatientTreatmentPlan(email);

  // Care Summaries
  const visitSummaries = clinic.getPatientVisitSummaries(email);
  const latestVisit = visitSummaries[0];

  // Invoices
  const invoices = clinic.getPatientInvoices(email);
  const outstandingInvoices = invoices.filter((inv) => inv.status === "balance_due");
  const totalBalanceDue = outstandingInvoices.reduce((sum, inv) => sum + inv.balanceEgp, 0);

  // Hygiene Recall Date
  const lastCleaningDate = clinic.getLastCleaningDate(email);

  const service = nextAppointment ? clinic.services.find((s) => s.id === nextAppointment.serviceId) : null;
  const doctor = nextAppointment ? clinic.doctors.find((d) => d.id === nextAppointment.doctorId) : null;

  const serviceTitle = service ? localizedService(service, locale).title : "General Consultation";
  const doctorName = doctor ? localizedDoctor(doctor, locale).name : "Dr. Clinician";
  const doctorSpecialty = doctor ? localizedDoctor(doctor, locale).specialty : "General Dentistry";

  const handleConfirmAttendance = async () => {
    if (!nextAppointment) return;
    await clinic.confirmAppointmentAttendance(nextAppointment.id);
  };

  const handleSyncGoogleCalendar = async () => {
    if (!nextAppointment) return;
    setSyncingCalendar(true);
    try {
      const res = await fetch("/api/google/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Dental Care - ${serviceTitle}`,
          description: `Appointment with ${doctorName} at BlueHaven Dental.`,
          date: nextAppointment.date,
          time: nextAppointment.time,
          durationMinutes: service?.durationMinutes ?? 45,
        }),
      });
      const data = await res.json();
      await clinic.markAppointmentCalendarSynced(nextAppointment.id, data.eventId);
      if (data.templateUrl) {
        window.open(data.templateUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Calendar sync error:", err);
    } finally {
      setSyncingCalendar(false);
    }
  };

  const handleCancelClick = () => {
    if (!nextAppointment) return;
    const { allowed, hoursRemaining } = clinic.canCancelAppointment(nextAppointment);
    setRemainingHoursNotice(hoursRemaining);
    if (!allowed) {
      setCancelPolicyBlocked(true);
    } else {
      setCancelPolicyBlocked(false);
    }
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!nextAppointment) return;
    await clinic.cancelAppointment(nextAppointment.id);
    setTimeout(() => {
      setCancelDialogOpen(false);
    }, 400);
  };

  // Treatment Plan Progress
  const approvedPhasesCount = treatmentPlan.phases.filter((p) => p.scheduledAppointmentId).length;
  const planProgressPercent =
    treatmentPlan.status === "approved"
      ? Math.max(35, Math.round((approvedPhasesCount / treatmentPlan.phases.length) * 100))
      : 15;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {interpolate(t.patient.nav.welcome, { name: name || "Mariam Ahmed" })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.patient.nav.subtitle}
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Link
              href="/patient/appointments?book=1"
              className={buttonVariants({
                variant: "accent",
                className: "min-h-11 shadow-sm rounded-xl px-4 font-semibold transition-transform active:scale-[0.98]",
              })}
            >
              <CalendarPlus className="size-4 me-2" />
              {t.patient.overview.bookAppointmentCta}
            </Link>
          </div>
        </motion.div>

        {/* 1. MAIN CARD: NEXT VISIT (ATTENDANCE CONFIRMATION + RESCHEDULE/CANCEL) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <Card className="overflow-hidden rounded-3xl border border-border shadow-md transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-lg">
        <CardHeader className="flex flex-col gap-2 bg-muted/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">{t.patient.overview.nextVisitEyebrow}</span>
            <CardTitle className="mt-1 text-xl font-bold">
              {nextAppointment ? serviceTitle : t.patient.overview.noUpcomingTitle}
            </CardTitle>
          </div>
          {nextAppointment && (
            <Badge variant="outline" className="h-7 text-xs font-medium">
              <Clock className="size-3 me-1" />
              {interpolate(t.patient.overview.durationMins, { count: service?.durationMinutes ?? 45 })}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {nextAppointment ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Clinician, Time & Attendance */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src="/images/demo/doctor.jpg" />
                    <AvatarFallback>{doctorName.slice(3, 5).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{doctorName}</p>
                    <p className="text-xs text-muted-foreground">{doctorSpecialty}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t.patient.overview.attendanceLabel}</span>
                    {nextAppointment.attendanceConfirmed ? (
                      <Badge variant="success" className="gap-1 py-1 px-2.5 text-xs">
                        <ShieldCheck className="size-3.5" />
                        {t.patient.overview.confirmedBadge}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="py-1 px-2.5 text-xs">
                        {t.patient.overview.unconfirmedBadge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.patient.overview.dateLabel}</span>
                    <span className="font-semibold text-foreground">{formatDate(nextAppointment.date, dateOpts)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.patient.overview.timeLabel}</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatTime(nextAppointment.time)}
                    </span>
                  </div>

                  {needsConfirmation && (
                    <Button
                      type="button"
                      variant="accent"
                      onClick={handleConfirmAttendance}
                      className="min-h-11 w-full rounded-xl px-4 font-semibold"
                    >
                      <CheckCircle2 className="size-4 me-2" />
                      {t.patient.banners.confirmAttendance}
                    </Button>
                  )}
                </div>

                {nextAppointment.note && (
                  <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">{t.patient.overview.yourNoteLabel}</strong> &ldquo;{nextAppointment.note}&rdquo;
                  </div>
                )}
              </div>

              {/* Right Column: Calendar Sync & Visit Actions */}
              <div className="flex flex-col justify-between space-y-4 rounded-2xl bg-muted/40 p-5">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {t.patient.overview.calendarSyncTitle}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.patient.overview.calendarSyncDesc}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={syncingCalendar}
                    onClick={handleSyncGoogleCalendar}
                    className="min-h-11 w-full justify-start rounded-xl text-xs font-semibold"
                  >
                    <ExternalLink className="size-4 me-2 text-primary" />
                    {nextAppointment.calendarSynced
                      ? t.patient.overview.synced
                      : t.patient.overview.syncGoogleCalendar}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadIcsFile(nextAppointment, serviceTitle, doctorName)}
                    className="min-h-11 w-full justify-start rounded-xl text-xs font-semibold"
                  >
                    <Download className="size-4 me-2 text-primary" />
                    {t.patient.overview.downloadIcs}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Link
                    href={`/patient/appointments?reschedule=${nextAppointment.id}`}
                    className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 flex-1 rounded-xl text-xs font-semibold justify-center" })}
                  >
                    {t.patient.booking.reschedule}
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCancelClick}
                    className="min-h-11 flex-1 rounded-xl text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 shadow-xs"
                  >
                    {t.patient.booking.cancelBtn}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarCheck2 className="size-12 text-muted-foreground/60 mb-3" />
              <p className="text-base font-semibold text-foreground">
                {t.patient.overview.noUpcoming}
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {t.patient.overview.noUpcomingDesc}
              </p>
              <Link
                href="/patient/appointments?book=1"
                className={buttonVariants({ variant: "outline", className: "mt-5 min-h-11 rounded-xl px-5 font-semibold" })}
              >
                <CalendarPlus className="size-4 me-2" />
                {t.patient.overview.bookNowCta}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
        </motion.div>

      {/* 2. TO-DO (REPLACES HYGIENE RECALL BANNER + PRE-VISIT FORMS BANNER) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: "easeOut" }}
      >
      <Card className="rounded-3xl border border-border shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-md">
        <CardHeader className="pb-2">
          <span className="eyebrow">{t.patient.overview.todoEyebrow}</span>
          <CardTitle className="mt-1 text-lg font-bold">{t.patient.overview.todoTitle}</CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-4 pt-0">
          <ul className="divide-y divide-border">
            {/* Hygiene recall */}
            <motion.li
              whileHover={{ y: -1 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/35"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {t.patient.overview.hygieneDueTitle}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {interpolate(t.patient.overview.hygieneDueDesc, {
                    date: formatDate(lastCleaningDate, shortDateOpts),
                  })}
                </p>
              </div>
              <Link
                href="/patient/appointments?reason=cleaning&book=1"
                className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-semibold transition-transform active:scale-[0.98]" })}
              >
                {t.patient.overview.bookCleaningCta}
                <ArrowRight className="size-3.5 ms-1.5 rtl:rotate-180" />
              </Link>
            </motion.li>

            {/* Pre-visit forms */}
            {!intakeForm.consentSigned ? (
              <motion.li
                whileHover={{ y: -1 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/35"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileWarning className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t.patient.overview.formsPendingTitle}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.patient.overview.formsPendingDesc}
                  </p>
                </div>
                <Link
                  href="/patient/forms"
                  className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-semibold transition-transform active:scale-[0.98]" })}
                >
                  <FileCheck2 className="size-4 me-1.5" />
                  {t.patient.overview.fillFormsCta}
                </Link>
              </motion.li>
            ) : (
              <motion.li
                whileHover={{ y: -1 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/35"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.patient.overview.formsDoneTitle}
                  </p>
                </div>
                <Link
                  href="/patient/forms"
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-medium" })}
                >
                  {t.patient.overview.reviewCta}
                </Link>
              </motion.li>
            )}
          </ul>
        </CardContent>
      </Card>
      </motion.div>

      {/* 3. MIDDLE SECTION: ACTIVE CARE (WORKFLOWS #4 & #5) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Workflow #4: Active Treatment Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.12, ease: "easeOut" }}
          whileHover={{ y: -3 }}
          className="h-full"
        >
        <Card className="flex h-full flex-col justify-between rounded-3xl border border-border shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{t.patient.overview.treatmentEyebrow}</span>
                <Badge
                  variant={treatmentPlan.status === "approved" ? "success" : "secondary"}
                  className="text-xs capitalize"
                >
                  {treatmentPlan.status === "approved"
                    ? t.patient.overview.treatmentStatusApproved
                    : t.patient.overview.treatmentStatusProposed}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-lg font-bold">
                {t.patient.overview.treatmentTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                {interpolate(t.patient.overview.treatmentSummary, { count: treatmentPlan.phases.length })}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                  <span>{t.patient.overview.treatmentProgress}</span>
                  <span>{planProgressPercent}%</span>
                </div>
                <Progress value={planProgressPercent} className="h-2 rounded-full" />
              </div>

              {/* Phased summary */}
              <div className="space-y-1 rounded-2xl bg-muted/40 p-3.5 text-xs">
                {treatmentPlan.phases.map((phase) => (
                  <div key={phase.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${
                        phase.priority === "urgent" ? "bg-destructive" : phase.priority === "restorative" ? "bg-primary" : "bg-chart-3"
                      }`} />
                      <span className="font-semibold text-foreground">
                        {interpolate(t.patient.overview.phaseLabel, { order: phase.order, title: phase.title })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-2 pb-5 px-6">
            <Link
              href="/patient/treatment-plan"
              className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-xl text-xs font-semibold justify-center transition-transform active:scale-[0.98]" })}
            >
              <Stethoscope className="size-4 me-2" />
              {t.patient.overview.reviewApprovePlanCta}
            </Link>
          </CardFooter>
        </Card>
        </motion.div>

        {/* Workflow #5: Recent Visit Care & e-Prescription Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.16, ease: "easeOut" }}
          whileHover={{ y: -3 }}
          className="h-full"
        >
        <Card className="flex h-full flex-col justify-between rounded-3xl border border-border shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{t.patient.overview.careEyebrow}</span>
                <Badge variant="outline" className="text-xs">
                  {latestVisit ? formatDate(latestVisit.visitDate, shortDateOpts) : t.patient.overview.careRecentBadge}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-lg font-bold">
                {t.patient.overview.careTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                {latestVisit ? latestVisit.whatWasDone : t.patient.overview.careDefaultDone}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Post-Op Instructions preview */}
              <div className="rounded-2xl bg-muted/40 p-3.5 space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  {t.patient.overview.recoveryPreviewLabel}
                </p>
                <ul className="list-disc ps-4 space-y-1 text-muted-foreground">
                  {(latestVisit?.postOpInstructions ?? t.patient.overview.defaultRecoveryRules).slice(0, 2).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Active e-Prescriptions badge count */}
              <div className="flex items-center justify-between rounded-xl bg-brand-primary/10 px-3.5 py-2.5 text-xs text-brand-primary">
                <span className="font-medium">
                  {interpolate(t.patient.overview.activeRxCount, { count: latestVisit?.prescriptions?.length ?? 1 })}
                </span>
                <span className="font-semibold">
                  {latestVisit?.prescriptions?.map((p) => p.medication).slice(0, 2).join(" & ") || "Amoxicillin & Ibuprofen"}
                </span>
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-2 pb-5 px-6">
            <Link
              href="/patient/care"
              className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-xl text-xs font-semibold justify-center transition-transform active:scale-[0.98]" })}
            >
              {t.patient.overview.viewCarePrintRxCta}
            </Link>
          </CardFooter>
        </Card>
        </motion.div>
      </div>

      {/* 4. BOTTOM SECTION: ACCOUNT & BILLING (WORKFLOW #5) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.2, ease: "easeOut" }}
        whileHover={{ y: -2 }}
      >
      <Card className="rounded-3xl border border-border shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <span className="eyebrow">{t.patient.overview.billingEyebrow}</span>
            <CardTitle className="mt-1 text-lg font-bold">
              {t.patient.overview.billingTitle}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-xs text-muted-foreground">{t.patient.overview.balanceDue}</p>
              <p className="text-xl font-extrabold text-foreground font-mono">
                {totalBalanceDue.toLocaleString()} {t.patient.overview.currencyEgp}
              </p>
            </div>
            {totalBalanceDue > 0 && (
              <Link
                href="/patient/billing?pay=1"
                className="min-h-11 rounded-xl px-4 text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 shadow-xs inline-flex items-center justify-center transition-transform active:scale-[0.98]"
              >
                <CreditCard className="size-4 me-1.5" />
                {t.patient.overview.payNow}
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0">
          <div className="divide-y divide-border/60">
            {invoices.slice(0, 2).map((inv) => (
              <div key={inv.id} className="-mx-2 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl px-2 py-3 gap-2 transition-colors hover:bg-muted/35">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {interpolate(t.patient.billing.invoiceNumber, { id: inv.id })}
                    </span>
                    <Badge variant={inv.status === "paid" ? "success" : "secondary"} className="text-[10px]">
                      {inv.status === "paid" ? t.patient.billing.statusPaid : t.patient.billing.statusBalanceDue}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {interpolate(t.patient.overview.invoiceIssued, { date: formatDate(inv.issuedDate, shortDateOpts) })} · {inv.items.map((it) => it.procedure).join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold tabular-nums text-foreground">
                    {inv.totalFeeEgp.toLocaleString()} {t.patient.overview.currencyEgp}
                  </div>
                  <Link
                    href={`/patient/billing`}
                    className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 text-xs" })}
                  >
                    {t.patient.overview.detailsCta}
                    <ChevronRight className="size-3.5 ms-1 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* 24-Hour Policy Lock Warning / Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {cancelPolicyBlocked ? (
                <>
                  <Ban className="size-5 text-destructive" />
                  {t.patient.overview.cancelLockedTitle}
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-destructive" />
                  {t.patient.overview.cancelConfirmTitle}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm pt-2">
              {cancelPolicyBlocked ? (
                <span>
                  {interpolate(t.patient.overview.cancelLockedDesc, { hours: remainingHoursNotice })}
                </span>
              ) : (
                <span>
                  {interpolate(t.patient.overview.cancelConfirmDesc, {
                    service: serviceTitle,
                    date: nextAppointment?.date ?? "",
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {cancelPolicyBlocked && (
            <div className="rounded-2xl bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
              {t.patient.overview.clinicDeskNotice}
            </div>
          )}

          {!cancelPolicyBlocked && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive my-1">
              <AlertTriangle className="size-4 text-destructive" />
              <AlertTitle className="text-xs font-semibold">
                {t.patient.overview.cancelWarningTitle}
              </AlertTitle>
              <AlertDescription className="text-xs text-destructive/90 mt-1 leading-relaxed">
                {t.patient.overview.cancelWarningDesc}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="min-h-11 rounded-xl text-xs"
            >
              {t.patient.overview.keepAppointment}
            </Button>
            {!cancelPolicyBlocked && (
              <HoldButton
                variant="destructive"
                holdDuration={1500}
                holdingLabel={t.patient.overview.keepHoldingCancel}
                completeLabel={t.patient.overview.appointmentCancelled}
                onHoldComplete={handleConfirmCancel}
                className="min-h-11 rounded-xl text-xs font-semibold"
              >
                {t.patient.overview.holdToCancel}
              </HoldButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </MotionConfig>
  );
}

export default PatientOverview;
