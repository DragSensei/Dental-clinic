"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { useI18n } from "@/i18n/locale-provider";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { Appointment } from "@/data/mock/catalog";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    setCancelDialogOpen(false);
  };

  // Treatment Plan Progress
  const approvedPhasesCount = treatmentPlan.phases.filter((p) => p.scheduledAppointmentId).length;
  const planProgressPercent =
    treatmentPlan.status === "approved"
      ? Math.max(35, Math.round((approvedPhasesCount / treatmentPlan.phases.length) * 100))
      : 15;

  return (
    <div className="max-w-7xl space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {locale === "ar"
              ? `مرحبًا بك، ${name || "مريم أحمد"}`
              : `Welcome back, ${name || "Mariam Ahmed"}`}
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
              className: "min-h-11 shadow-sm rounded-xl px-4 font-semibold",
            })}
          >
            <CalendarPlus className="size-4 me-2" />
            {locale === "ar" ? "حجز موعد جديد" : "+ Book Appointment"}
          </Link>
        </div>
      </div>

      {/* 1. MAIN CARD: NEXT VISIT (ATTENDANCE CONFIRMATION + RESCHEDULE/CANCEL) */}
      <Card className="overflow-hidden rounded-3xl border border-border shadow-md">
        <CardHeader className="flex flex-col gap-2 bg-muted/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">{locale === "ar" ? "الزيارة القادمة" : "Next Scheduled Visit"}</span>
            <CardTitle className="mt-1 text-xl font-bold">
              {nextAppointment ? serviceTitle : (locale === "ar" ? "لا توجد مواعيد قادمة" : "No Upcoming Visit")}
            </CardTitle>
          </div>
          {nextAppointment && (
            <Badge variant="outline" className="h-7 text-xs font-medium">
              <Clock className="size-3 me-1" />
              {service?.durationMinutes ?? 45} mins
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
                    <AvatarImage src={`https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80`} />
                    <AvatarFallback>{doctorName.slice(3, 5).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{doctorName}</p>
                    <p className="text-xs text-muted-foreground">{doctorSpecialty}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{locale === "ar" ? "حالة التأكيد:" : "Attendance:"}</span>
                    {nextAppointment.attendanceConfirmed ? (
                      <Badge variant="success" className="gap-1 py-1 px-2.5 text-xs">
                        <ShieldCheck className="size-3.5" />
                        {locale === "ar" ? "مؤكد ✓" : "Confirmed ✓"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="py-1 px-2.5 text-xs">
                        {locale === "ar" ? "غير مؤكد" : "Unconfirmed"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{locale === "ar" ? "التاريخ:" : "Date:"}</span>
                    <span className="font-semibold text-foreground">{formatDate(nextAppointment.date, dateOpts)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{locale === "ar" ? "التوقيت:" : "Time:"}</span>
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
                      {locale === "ar" ? "تأكيد الحضور" : "Confirm Attendance"}
                    </Button>
                  )}
                </div>

                {nextAppointment.note && (
                  <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">{locale === "ar" ? "ملاحظتك:" : "Your Note:"}</strong> &ldquo;{nextAppointment.note}&rdquo;
                  </div>
                )}
              </div>

              {/* Right Column: Calendar Sync & Visit Actions */}
              <div className="flex flex-col justify-between space-y-4 rounded-2xl bg-muted/40 p-5">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {locale === "ar" ? "المزامنة مع تقويمك الشخصي" : "Personal Calendar Sync"}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {locale === "ar"
                      ? "أضف الموعد مباشرة إلى Google Calendar أو حمل ملف .ics المتوافق مع Apple وOutlook."
                      : "Directly sync to your Google Calendar or download a standard .ics file for Apple & Outlook."}
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
                      ? (locale === "ar" ? "تمت المزامنة مع Google Calendar ✓" : "Synced to Google Calendar ✓")
                      : (locale === "ar" ? "إضافة إلى Google Calendar" : "Add to Google Calendar")}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadIcsFile(nextAppointment, serviceTitle, doctorName)}
                    className="min-h-11 w-full justify-start rounded-xl text-xs font-semibold"
                  >
                    <Download className="size-4 me-2 text-primary" />
                    {locale === "ar" ? "تحميل ملف التقويم (.ics)" : "Download Apple / Outlook (.ics)"}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Link
                    href={`/patient/appointments?reschedule=${nextAppointment.id}`}
                    className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 flex-1 rounded-xl text-xs font-semibold justify-center" })}
                  >
                    {locale === "ar" ? "تعديل الموعد" : "Reschedule"}
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCancelClick}
                    className="min-h-11 flex-1 rounded-xl text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 shadow-xs"
                  >
                    {locale === "ar" ? "إلغاء الموعد" : "Cancel"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarCheck2 className="size-12 text-muted-foreground/60 mb-3" />
              <p className="text-base font-semibold text-foreground">
                {locale === "ar" ? "ليس لديك أي زيارات مجدولة حاليًا" : "No upcoming visits scheduled"}
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {locale === "ar"
                  ? "احجز فحصًا روتينيًا، أو كشفًا للألم، أو جلسة تنظيف اللثة بسهولة."
                  : "Book a new exam, toothache triage, or routine cleaning in under 2 minutes."}
              </p>
              <Link
                href="/patient/appointments?book=1"
                className={buttonVariants({ variant: "outline", className: "mt-5 min-h-11 rounded-xl px-5 font-semibold" })}
              >
                <CalendarPlus className="size-4 me-2" />
                {locale === "ar" ? "حجز موعد الآن" : "Book an Appointment Now"}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. TO-DO (REPLACES HYGIENE RECALL BANNER + PRE-VISIT FORMS BANNER) */}
      <Card className="rounded-3xl border border-border shadow-xs">
        <CardHeader className="pb-2">
          <span className="eyebrow">{locale === "ar" ? "قائمة المهام" : "Your Tasks"}</span>
          <CardTitle className="mt-1 text-lg font-bold">{locale === "ar" ? "مهام" : "To-do"}</CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-4 pt-0">
          <ul className="divide-y divide-border">
            {/* Hygiene recall */}
            <li className="flex items-center gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {locale === "ar" ? "حان موعد فحص وتنظيف الأسنان الدوري (6 أشهر)" : "6-Month Hygiene & Cleaning Due"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {locale === "ar"
                    ? `آخر جلسة تنظيف كانت في ${formatDate(lastCleaningDate, shortDateOpts)}.`
                    : `Your last professional cleaning was on ${formatDate(lastCleaningDate, shortDateOpts)}.`}
                </p>
              </div>
              <Link
                href="/patient/appointments?reason=cleaning&book=1"
                className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-semibold" })}
              >
                {locale === "ar" ? "حجز جلسة التنظيف" : "Book My Cleaning"}
                <ArrowRight className="size-3.5 ms-1.5 rtl:rotate-180" />
              </Link>
            </li>

            {/* Pre-visit forms */}
            {!intakeForm.consentSigned ? (
              <li className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileWarning className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {locale === "ar" ? "يرجى استكمال النماذج الطبية قبل الزيارة" : "Complete Your Pre-Visit Forms"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {locale === "ar"
                      ? "استكمل التاريخ الصحي، الحساسية، والتوقيع الرقمي لتسريع إجراءات الاستقبال."
                      : "Medical history, allergies and digital consent for express check-in (~3 mins)."}
                  </p>
                </div>
                <Link
                  href="/patient/forms"
                  className={buttonVariants({ variant: "accent", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-semibold" })}
                >
                  <FileCheck2 className="size-4 me-1.5" />
                  {locale === "ar" ? "تعبئة النماذج الآن" : "Fill Out Forms"}
                </Link>
              </li>
            ) : (
              <li className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {locale === "ar" ? "كافة النماذج الطبية والتوقيع الرقمي مكتملة" : "Pre-Visit Medical Forms & Consent Signed"}
                  </p>
                </div>
                <Link
                  href="/patient/forms"
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 shrink-0 rounded-xl px-3 text-xs font-medium" })}
                >
                  {locale === "ar" ? "مراجعة" : "Review"}
                </Link>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* 3. MIDDLE SECTION: ACTIVE CARE (WORKFLOWS #4 & #5) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Workflow #4: Active Treatment Plan Card */}
        <Card className="rounded-3xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{locale === "ar" ? "الخطة العلاجية" : "Treatment Plan"}</span>
                <Badge
                  variant={treatmentPlan.status === "approved" ? "success" : "secondary"}
                  className="text-xs capitalize"
                >
                  {treatmentPlan.status === "approved" ? "Active / Approved" : "Proposed Plan"}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-lg font-bold">
                {locale === "ar" ? "خطة التأهيل والعناية الشاملة" : "Comprehensive Restorative Plan"}
              </CardTitle>
              <CardDescription className="text-xs">
                {treatmentPlan.phases.length} Phases · FDI 32-Teeth Chart Integrated
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                  <span>{locale === "ar" ? "نسبة إنجاز الخطة:" : "Plan Progress:"}</span>
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
                      <span className="font-semibold text-foreground">Phase {phase.order}: {phase.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-2 pb-5 px-6">
            <Link
              href="/patient/treatment-plan"
              className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-xl text-xs font-semibold justify-center" })}
            >
              <Stethoscope className="size-4 me-2" />
              {locale === "ar" ? "مراجعة الخطة واعتمادها ←" : "Review & Approve Plan →"}
            </Link>
          </CardFooter>
        </Card>

        {/* Workflow #5: Recent Visit Care & e-Prescription Card */}
        <Card className="rounded-3xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{locale === "ar" ? "ملخص الزيارة والروشتة" : "Recent Care & Rx"}</span>
                <Badge variant="outline" className="text-xs">
                  {latestVisit ? formatDate(latestVisit.visitDate, shortDateOpts) : "Recent"}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-lg font-bold">
                {locale === "ar" ? "تقرير الإجراءات والتعليمات" : "Post-Op Care & e-Prescription"}
              </CardTitle>
              <CardDescription className="text-xs">
                {latestVisit ? latestVisit.whatWasDone : "Routine Oral Examination"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Post-Op Instructions preview */}
              <div className="rounded-2xl bg-muted/40 p-3.5 space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  {locale === "ar" ? "تعليمات التعافي بعد الجلسة:" : "Recovery Rules Preview:"}
                </p>
                <ul className="list-disc ps-4 space-y-1 text-muted-foreground">
                  {(latestVisit?.postOpInstructions ?? [
                    "Avoid hot beverages and chewing on treated side for 2 hours",
                    "Do not vigorously rinse mouth for 24 hours",
                  ]).slice(0, 2).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Active e-Prescriptions badge count */}
              <div className="flex items-center justify-between rounded-xl bg-brand-primary/10 px-3.5 py-2.5 text-xs text-brand-primary">
                <span className="font-medium">
                  {latestVisit?.prescriptions?.length ?? 1} {locale === "ar" ? "أدوية موصوفة نشطة" : "Active e-Prescriptions"}
                </span>
                <span className="font-semibold">Amoxicillin & Ibuprofen</span>
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-2 pb-5 px-6">
            <Link
              href="/patient/care"
              className={buttonVariants({ variant: "accent", className: "min-h-11 w-full rounded-xl text-xs font-semibold justify-center" })}
            >
              {locale === "ar" ? "عرض التعليمات وطباعة الروشتة ←" : "View Care & Print Rx →"}
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* 4. BOTTOM SECTION: ACCOUNT & BILLING (WORKFLOW #5) */}
      <Card className="rounded-3xl border border-border shadow-xs">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <span className="eyebrow">{locale === "ar" ? "الحسابات والفواتير" : "Billing & Account"}</span>
            <CardTitle className="mt-1 text-lg font-bold">
              {locale === "ar" ? "الرصيد المستحق وسجل المدفوعات" : "Balance Due & Invoices"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-xs text-muted-foreground">{locale === "ar" ? "إجمالي المستحق:" : "Total Balance:"}</p>
              <p className="text-xl font-extrabold text-foreground font-mono">
                {totalBalanceDue.toLocaleString()} EGP
              </p>
            </div>
            {totalBalanceDue > 0 && (
              <Link
                href="/patient/billing?pay=1"
                className="min-h-11 rounded-xl px-4 text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 shadow-xs inline-flex items-center justify-center"
              >
                <CreditCard className="size-4 me-1.5" />
                {locale === "ar" ? "دفع الآن" : "Pay Now"}
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0">
          <div className="divide-y divide-border/60">
            {invoices.slice(0, 2).map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">Invoice #{inv.id}</span>
                    <Badge variant={inv.status === "paid" ? "success" : "secondary"} className="text-[10px]">
                      {inv.status === "paid" ? "Paid in Full" : "Balance Due"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Issued {formatDate(inv.issuedDate, shortDateOpts)} · {inv.items.map((it) => it.procedure).join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold tabular-nums text-foreground">
                    {inv.totalFeeEgp.toLocaleString()} EGP
                  </div>
                  <Link
                    href={`/patient/billing`}
                    className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 text-xs" })}
                  >
                    {locale === "ar" ? "التفاصيل" : "Details"}
                    <ChevronRight className="size-3.5 ms-1 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 24-Hour Policy Lock Warning / Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {cancelPolicyBlocked ? (
                <>
                  <Ban className="size-5 text-destructive" />
                  {locale === "ar" ? "إلغاء الموعد مقفل (أقل من 24 ساعة)" : "Cancellation Locked (< 24h)"}
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-destructive" />
                  {locale === "ar" ? "تأكيد إلغاء الموعد" : "Confirm Appointment Cancellation"}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm pt-2">
              {cancelPolicyBlocked ? (
                <span>
                  {locale === "ar"
                    ? `وفقًا لسياسة العيادة، لا يمكن إلغاء الموعد ذاتيًا قبل أقل من 24 ساعة (${remainingHoursNotice} ساعة متبقية). يرجى الاتصال بمكتب الاستقبال مباشرة على الرقم 9988 2270 2 20+ لتعديل جدول الطبيب.`
                    : `According to clinic policy, appointments within 24 hours cannot be cancelled online (${remainingHoursNotice} hours remaining). Please call the clinic reception desk directly at +20 2 2270 9988 so staff can release the clinician slot.`}
                </span>
              ) : (
                <span>
                  {locale === "ar"
                    ? `هل أنت متأكد من رغبتك في إلغاء هذا الموعد (${serviceTitle})؟ سيتم تحرير هذا التوقيت تلقائيًا لمرضى العيادة الآخرين.`
                    : `Are you sure you want to cancel your appointment for ${serviceTitle} on ${nextAppointment?.date}? Your reserved clinician slot will be immediately freed.`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {cancelPolicyBlocked && (
            <div className="rounded-2xl bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
              Clinic Contact Desk: +20 2 2270 9988 / Makram Ebeid, Nasr City, Cairo
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="min-h-11 rounded-xl text-xs"
            >
              {locale === "ar" ? "إغلاق" : "Close"}
            </Button>
            {!cancelPolicyBlocked && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmCancel}
                className="min-h-11 rounded-xl text-xs font-semibold"
              >
                {locale === "ar" ? "تأكيد الإلغاء" : "Yes, Cancel Visit"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientOverview;
