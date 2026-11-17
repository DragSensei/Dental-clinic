"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  RefreshCw,
  XCircle,
  Ban,
  UserCheck,
  Check,
  CalendarPlus,
} from "lucide-react";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { visitReasonCategories, type Appointment, type VisitReasonCategory } from "@/data/mock/catalog";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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

function PatientAppointmentsContent() {
  const searchParams = useSearchParams();
  const { signedInEmail, name } = useSession();
  const clinic = useClinic();
  const { locale, formatDate, formatTime, t } = useI18n();

  const email = signedInEmail || "mariam.a@example.com";
  const userAccount = clinic.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  const patientPhone = userAccount?.phone || "+20 10 1234 5678";

  // Tab State: "manage" vs "book"
  const defaultTab = searchParams.get("book") === "1" ? "book" : "manage";
  const [activeTab, setActiveTab] = useState<"manage" | "book">(defaultTab);

  // Booking Flow State
  const initialReason = (searchParams.get("reason") as VisitReasonCategory) || "new-exam";
  const matchedReason = visitReasonCategories.find((c) => c.id === initialReason) ?? visitReasonCategories[0];

  const [selectedReasonCategory, setSelectedReasonCategory] = useState<VisitReasonCategory>(matchedReason.id);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    searchParams.get("serviceId") || matchedReason.serviceId
  );
  const [anyAvailableDoctor, setAnyAvailableDoctor] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [symptomNote, setSymptomNote] = useState<string>("");
  const [bookingPending, setBookingPending] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  // Reschedule Dialog State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [reschedulePending, setReschedulePending] = useState(false);

  // Cancellation Dialog State
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [simulateUnder24h, setSimulateUnder24h] = useState(false);
  const [cancelPending, setCancelPending] = useState(false);

  // Syncing state tracker
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // React to URL query params
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const book = searchParams.get("book");
      const reason = searchParams.get("reason") as VisitReasonCategory;
      const rescheduleId = searchParams.get("reschedule");

      if (book === "1") {
        setActiveTab("book");
      }
      if (reason && visitReasonCategories.some((c) => c.id === reason)) {
        setSelectedReasonCategory(reason);
        const cat = visitReasonCategories.find((c) => c.id === reason);
        if (cat) setSelectedServiceId(cat.serviceId);
      }
      if (rescheduleId) {
        const found = clinic.appointments.find((a) => a.id === rescheduleId);
        if (found) {
          setRescheduleTarget(found);
          setRescheduleDate(found.date);
          setRescheduleTime(found.time);
        }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [searchParams, clinic.appointments]);

  // When Reason Category Changes
  const handleCategoryChange = (val: VisitReasonCategory) => {
    setSelectedReasonCategory(val);
    const cat = visitReasonCategories.find((c) => c.id === val);
    if (cat) {
      setSelectedServiceId(cat.serviceId);
      setSelectedDate("");
      setSelectedTime("");
    }
  };

  // Available Dates for Booking
  const availableDates = useMemo(() => {
    if (!selectedServiceId) return [];
    if (anyAvailableDoctor) {
      return clinic.getAvailableDatesForAnyDoctor(selectedServiceId);
    }
    return selectedDoctorId ? clinic.getAvailableDates(selectedServiceId, selectedDoctorId) : [];
  }, [clinic, selectedServiceId, anyAvailableDoctor, selectedDoctorId]);

  // Available Slots for Selected Date
  const availableSlotsForDate = useMemo(() => {
    if (!selectedServiceId || !selectedDate) return [];
    if (anyAvailableDoctor) {
      return clinic.getAvailableSlotsForAnyDoctor(selectedServiceId, selectedDate);
    }
    const rawSlots = clinic.getAvailableSlots(selectedServiceId, selectedDoctorId, selectedDate);
    const doc = clinic.doctors.find((d) => d.id === selectedDoctorId);
    return rawSlots.map((time) => ({
      time,
      doctorId: selectedDoctorId,
      doctorName: doc?.name || "Dr. Assigned",
    }));
  }, [clinic, selectedServiceId, selectedDate, anyAvailableDoctor, selectedDoctorId]);

  // Resolved Doctor for Booking
  const resolvedDoctorId = useMemo(() => {
    if (!anyAvailableDoctor) return selectedDoctorId;
    const matchedSlot = availableSlotsForDate.find((s) => s.time === selectedTime);
    return matchedSlot ? matchedSlot.doctorId : clinic.doctors[0]?.id || "doctor-1";
  }, [anyAvailableDoctor, selectedDoctorId, availableSlotsForDate, selectedTime, clinic.doctors]);

  // Patient Appointments
  const userAppointments = useMemo(() => {
    return clinic.appointments
      .filter((a) => a.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [clinic.appointments, email]);

  const upcomingAppointments = userAppointments.filter((a) => a.status === "confirmed");
  const pastAppointments = userAppointments.filter((a) => a.status === "cancelled");

  // Handle Booking Submit
  const handleBookAppointment = async () => {
    if (!selectedServiceId || !resolvedDoctorId || !selectedDate || !selectedTime) return;
    setBookingPending(true);
    try {
      const booked = await clinic.bookAppointment({
        serviceId: selectedServiceId,
        doctorId: resolvedDoctorId,
        date: selectedDate,
        time: selectedTime,
        patientName: name || "Mariam Ahmed",
        email,
        phone: patientPhone,
        note: symptomNote.trim() || undefined,
        reasonCategory: selectedReasonCategory,
      });
      setBookingSuccess(booked);
      setActiveTab("manage");
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setBookingPending(false);
    }
  };

  // Google Calendar Sync
  const handleCalendarSync = async (apt: Appointment) => {
    setSyncingId(apt.id);
    const s = clinic.services.find((it) => it.id === apt.serviceId);
    const d = clinic.doctors.find((it) => it.id === apt.doctorId);
    try {
      const res = await fetch("/api/google/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Dental Visit - ${s?.title || "Consultation"}`,
          description: `Appointment with ${d?.name || "Dentist"} at BlueHaven Dental.`,
          date: apt.date,
          time: apt.time,
          durationMinutes: s?.durationMinutes ?? 45,
        }),
      });
      const data = await res.json();
      await clinic.markAppointmentCalendarSynced(apt.id, data.eventId);
      if (data.templateUrl) {
        window.open(data.templateUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingId(null);
    }
  };

  // Reschedule Submit
  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    setReschedulePending(true);
    try {
      await clinic.rescheduleAppointment(rescheduleTarget.id, rescheduleDate, rescheduleTime);
      setRescheduleTarget(null);
    } catch (err) {
      console.error("Reschedule error:", err);
    } finally {
      setReschedulePending(false);
    }
  };

  // Cancellation Execution
  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setCancelPending(true);
    try {
      await clinic.cancelAppointment(cancelTarget.id);
      setTimeout(() => {
        setCancelTarget(null);
        setCancelPending(false);
      }, 400);
    } catch (err) {
      console.error("Cancellation error:", err);
      setCancelPending(false);
    }
  };

  // Cancellation Evaluation with 24-hour rule check
  const cancelPolicyResult = useMemo(() => {
    if (!cancelTarget) return { allowed: true, hoursRemaining: 99 };
    if (simulateUnder24h) {
      // Simulate <24h window (e.g. 6 hours before)
      return { allowed: false, hoursRemaining: 6.5 };
    }
    return clinic.canCancelAppointment(cancelTarget);
  }, [cancelTarget, simulateUnder24h, clinic]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t.patient.booking.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.patient.booking.subtitle}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manage" | "book")} className="shrink-0">
            <TabsList className="rounded-2xl p-1 bg-muted flex-wrap h-auto">
              <TabsTrigger value="manage" className="rounded-xl text-xs font-semibold px-3 sm:px-4 min-h-11">
                {t.patient.booking.tabManage}
              </TabsTrigger>
              <TabsTrigger value="book" className="rounded-xl text-xs font-semibold px-3 sm:px-4 min-h-11">
                <CalendarPlus className="size-3.5 me-1.5" />
                {t.patient.booking.tabBook}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <AnimatePresence initial={false}>
          {bookingSuccess && (
            <motion.aside
              key="booking-success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label={t.patient.booking.confirmedSuccess}
              className="flex items-center justify-between rounded-3xl border border-primary/40 bg-brand-subtle p-5 text-foreground"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-primary" />
                <div>
                  <p className="font-bold text-sm">
                    {t.patient.booking.bookedToastTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interpolate(t.patient.booking.bookedToastMeta, {
                      date: formatDate(bookingSuccess.date, { weekday: "short", month: "short", day: "numeric" }),
                      time: formatTime(bookingSuccess.time),
                      id: bookingSuccess.id,
                    })}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBookingSuccess(null)}
                className="min-h-11 text-xs"
              >
                {t.patient.booking.dismiss}
              </Button>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {/* TAB 1: MANAGE APPOINTMENTS */}
          {activeTab === "manage" ? (
            <motion.div
              key="tab-manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Upcoming Visits */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {t.patient.booking.upcomingTitle}
                </h2>

                {upcomingAppointments.length === 0 ? (
                  <Card className="rounded-3xl border border-dashed border-border p-10 text-center">
                    <CalendarCheck2 className="size-12 mx-auto text-muted-foreground/60 mb-3" />
                    <p className="font-semibold text-foreground text-sm">
                      {t.patient.booking.noUpcomingTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      {t.patient.booking.noUpcomingDesc}
                    </p>
                    <Button
                      type="button"
                      variant="accent"
                      onClick={() => setActiveTab("book")}
                      className="mt-4 min-h-11 rounded-xl text-xs font-semibold"
                    >
                      <CalendarPlus className="size-4 me-1.5" />
                      {t.patient.booking.bookNewAppointmentCta}
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {upcomingAppointments.map((apt, index) => {
                      const s = clinic.services.find((it) => it.id === apt.serviceId);
                      const d = clinic.doctors.find((it) => it.id === apt.doctorId);
                      const sTitle = s ? localizedService(s, locale).title : t.patient.overview.careDefaultDone;
                      const dName = d ? localizedDoctor(d, locale).name : "Dr. Clinician";
                      const dSpecialty = d ? localizedDoctor(d, locale).specialty : "";

                      return (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(index * 0.04, 0.16),
                            ease: "easeOut",
                          }}
                          whileHover={{ y: -3 }}
                        >
                          <Card className="rounded-3xl border border-border shadow-xs overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md">
                            <div className="p-5 sm:p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                              {/* Info Column */}
                              <div className="flex items-start gap-4">
                                <Avatar className="size-12 border border-border">
                                  <AvatarImage src="/images/demo/doctor.jpg" />
                                  <AvatarFallback>{dName.slice(3, 5)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-base text-foreground">{sTitle}</h3>
                                    {apt.attendanceConfirmed ? (
                                      <Badge variant="success" className="text-[11px] gap-1">
                                        <Check className="size-3" />
                                        {t.patient.booking.confirmedByPatient}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[11px] text-primary border-primary/40">
                                        {t.patient.booking.actionRequiredConfirm}
                                      </Badge>
                                    )}
                                    {apt.calendarSynced && (
                                      <Badge variant="secondary" className="text-[11px]">
                                        {t.patient.booking.calendarSyncedBadge}
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-xs text-muted-foreground">
                                    {dName}{dSpecialty ? ` · ${dSpecialty}` : ""}
                                  </p>

                                  <p className="text-sm font-semibold text-foreground pt-1 tabular-nums">
                                    {formatDate(apt.date, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(apt.time)}
                                  </p>

                                  {apt.note && (
                                    <p className="text-xs italic text-muted-foreground pt-0.5">
                                      {t.patient.booking.notePrefix} &ldquo;{apt.note}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Bar Column */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                                {!apt.attendanceConfirmed && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="accent"
                                    onClick={() => clinic.confirmAppointmentAttendance(apt.id)}
                                    className="min-h-11 rounded-xl text-xs font-semibold shadow-xs"
                                  >
                                    <CheckCircle2 className="size-4 me-1.5" />
                                    {t.patient.banners.confirmAttendance}
                                  </Button>
                                )}

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={syncingId === apt.id}
                                  onClick={() => handleCalendarSync(apt)}
                                  className="min-h-11 rounded-xl text-xs font-medium"
                                >
                                  <ExternalLink className="size-3.5 me-1 text-primary" />
                                  {apt.calendarSynced ? t.patient.booking.resyncGoogle : t.patient.booking.syncGoogle}
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadIcsFile(apt, sTitle, dName)}
                                  className="min-h-11 rounded-xl text-xs font-medium"
                                >
                                  <Download className="size-3.5 me-1 text-primary" />
                                  {t.patient.booking.icsShort}
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRescheduleTarget(apt);
                                    setRescheduleDate(apt.date);
                                    setRescheduleTime(apt.time);
                                  }}
                                  className="min-h-11 rounded-xl text-xs font-medium"
                                >
                                  <RefreshCw className="size-3.5 me-1" />
                                  {t.patient.booking.reschedule}
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCancelTarget(apt);
                                    setSimulateUnder24h(false);
                                  }}
                                  className="min-h-11 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="size-3.5 me-1" />
                                  {t.patient.booking.cancelBtn}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past / Cancelled Visits */}
              {pastAppointments.length > 0 && (
                <div className="pt-6">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    {t.patient.booking.pastTitle}
                  </h2>
                  <div className="divide-y divide-border/60 rounded-2xl border border-border bg-card p-4">
                    {pastAppointments.map((apt) => {
                      const s = clinic.services.find((it) => it.id === apt.serviceId);
                      const sTitle = s ? localizedService(s, locale).title : t.patient.overview.careDefaultDone;
                      return (
                        <div key={apt.id} className="py-2.5 flex items-center justify-between text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">{sTitle}</span>
                            <span> · {formatDate(apt.date, { month: "short", day: "numeric" })} · {formatTime(apt.time)}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-destructive border-destructive/40">
                            {t.patient.booking.cancelledBadge}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tab-book"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* TAB 2: BOOKING WIZARD */}
              <Card className="rounded-3xl border border-border shadow-md overflow-hidden">
                <CardHeader className="border-b border-border/70 bg-muted/30 p-6 sm:p-8">
                  <span className="eyebrow">{t.patient.booking.expressEyebrow}</span>
                  <CardTitle className="text-2xl font-bold mt-1">
                    {t.patient.booking.expressTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.patient.booking.expressDesc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 space-y-8">
                  {/* STEP 1: VISIT REASON CATEGORIES */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {t.patient.booking.stepReason}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {interpolate(t.patient.booking.durationMins, { count: matchedReason.durationMinutes })}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {visitReasonCategories.map((cat) => {
                        const isSelected = selectedReasonCategory === cat.id;
                        const label = locale === "ar" ? cat.labelAr : cat.labelEn;
                        const desc = locale === "ar" ? cat.descAr : cat.descEn;

                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`flex min-h-11 flex-col justify-between rounded-2xl border p-4 text-start transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs"
                                : "border-border hover:border-primary/40 hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex w-full items-start justify-between gap-2">
                              <span className="font-semibold text-sm text-foreground">{label}</span>
                              {isSelected && (
                                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="size-3" />
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* STEP 2: CLINICIAN & OPEN SLOTS */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {t.patient.booking.stepClinician}
                      </h3>

                      {/* "Any Available Doctor" Switch */}
                      <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-muted/40 px-3.5 py-2">
                        <Switch
                          id="any-doctor-switch"
                          checked={anyAvailableDoctor}
                          onCheckedChange={(checked) => {
                            setAnyAvailableDoctor(checked);
                            if (!checked) {
                              const eligible = clinic.doctors.filter((d) => d.serviceIds.includes(selectedServiceId));
                              if (eligible.length > 0) {
                                setSelectedDoctorId(eligible[0].id);
                              }
                            }
                            setSelectedDate("");
                            setSelectedTime("");
                          }}
                        />
                        <label htmlFor="any-doctor-switch" className="cursor-pointer text-xs font-semibold text-foreground">
                          {t.patient.booking.anyAvailable}
                        </label>
                      </div>
                    </div>

                    {/* Specific Doctor Selection if Switch is OFF */}
                    <AnimatePresence initial={false}>
                      {!anyAvailableDoctor && (
                        <motion.div
                          key="doctor-select-grid"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="grid gap-3 sm:grid-cols-3"
                        >
                          {clinic.doctors
                            .filter((doc) => doc.serviceIds.includes(selectedServiceId))
                            .map((doc) => {
                            const isSelected = selectedDoctorId === doc.id;
                            const dLoc = localizedDoctor(doc, locale);
                            return (
                              <motion.button
                                key={doc.id}
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                  setSelectedDoctorId(doc.id);
                                  setSelectedDate("");
                                  setSelectedTime("");
                                }}
                                className={`flex min-h-11 items-center gap-3 rounded-2xl border p-3 text-start transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                                }`}
                              >
                                <Avatar className="size-10 border border-border">
                                  <AvatarFallback>{dLoc.name.slice(3, 5)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-foreground">{dLoc.name}</p>
                                  <p className="truncate text-[11px] text-muted-foreground">{dLoc.specialty}</p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Live Dates Picker */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {t.patient.booking.selectDateLabel}
                      </p>
                      {availableDates.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">{t.patient.booking.noDatesAvailable}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableDates.map((dateStr) => {
                            const isSelected = selectedDate === dateStr;
                            return (
                              <Button
                                key={dateStr}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setSelectedTime("");
                                }}
                                className={`min-h-11 rounded-xl px-3.5 text-xs font-medium transition-transform active:scale-[0.98] ${
                                  isSelected ? "shadow-sm" : ""
                                }`}
                              >
                                <CalendarDays className="size-3.5 me-1.5" />
                                {formatDate(dateStr, { weekday: "short", month: "short", day: "numeric" })}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Live Time Slots Picker */}
                    <AnimatePresence mode="wait" initial={false}>
                      {selectedDate && (
                        <motion.div
                          key={`slots-${selectedDate}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="space-y-3 pt-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {t.patient.booking.selectTimeSlotLabel}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {interpolate(t.patient.booking.slotsOpenCount, { count: availableSlotsForDate.length })}
                            </span>
                          </div>

                          {availableSlotsForDate.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              {t.patient.booking.noSlotsAvailable}
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                              {availableSlotsForDate.map((slot, index) => {
                                const isSelected = selectedTime === slot.time;
                                const docObj = clinic.doctors.find((d) => d.id === slot.doctorId);
                                const docDisplay = docObj ? localizedDoctor(docObj, locale).name : slot.doctorName;
                                return (
                                  <motion.div
                                    key={slot.time}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      duration: 0.15,
                                      delay: Math.min(index * 0.02, 0.14),
                                      ease: "easeOut",
                                    }}
                                  >
                                    <Button
                                      type="button"
                                      variant={isSelected ? "default" : "outline"}
                                      onClick={() => setSelectedTime(slot.time)}
                                      className={cn(
                                        "min-h-14 h-auto w-full flex-col items-center justify-center rounded-xl py-2 px-2 text-xs font-semibold whitespace-normal text-center gap-1 transition-transform active:scale-[0.98]",
                                        isSelected ? "shadow-sm" : ""
                                      )}
                                    >
                                      <span className="tabular-nums font-bold leading-none">{formatTime(slot.time)}</span>
                                      {anyAvailableDoctor && (
                                        <span className="text-[11px] font-normal leading-tight opacity-90 text-center break-words max-w-full">
                                          {docDisplay}
                                        </span>
                                      )}
                                    </Button>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Separator />

                  {/* STEP 3: OPTIONAL SYMPTOM NOTE & CONTACT AUTO-FILL */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      {t.patient.booking.stepReview}
                    </h3>

                    <div className="space-y-2">
                      <label htmlFor="symptom-note" className="text-xs font-medium text-muted-foreground">
                        {t.patient.booking.symptomLabel}
                      </label>
                      <Textarea
                        id="symptom-note"
                        value={symptomNote}
                        onChange={(e) => setSymptomNote(e.target.value)}
                        placeholder={t.patient.booking.symptomPlaceholder}
                        className="rounded-2xl min-h-[90px] text-sm"
                      />
                    </div>

                    {/* Signed-in patient auto-fill info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">
                          {interpolate(t.patient.booking.bookingForLabel, { name: name || "Mariam Ahmed" })}
                        </p>
                        <p className="text-muted-foreground">
                          {email} · {patientPhone}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[11px] gap-1">
                        <UserCheck className="size-3" />
                        {t.patient.booking.autoPopulatedBadge}
                      </Badge>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="accent"
                      disabled={bookingPending || !selectedServiceId || !selectedDate || !selectedTime}
                      onClick={handleBookAppointment}
                      className="min-h-12 w-full rounded-2xl text-sm font-bold shadow-md transition-transform active:scale-[0.99]"
                    >
                      {bookingPending ? (
                        t.patient.booking.submittingBooking
                      ) : (
                        <>
                          <CalendarCheck2 className="size-4 me-2" />
                          {t.patient.booking.confirmBookCta}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      {/* RESCHEDULE DIALOG */}
      <Dialog open={Boolean(rescheduleTarget)} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t.patient.booking.rescheduleDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {rescheduleTarget && (
                <span>
                  {interpolate(t.patient.booking.rescheduleDialogDesc, {
                    service: (() => {
                      const srv = clinic.services.find((s) => s.id === rescheduleTarget.serviceId);
                      return srv ? localizedService(srv, locale).title : t.patient.overview.careDefaultDone;
                    })(),
                    doctor: (() => {
                      const doc = clinic.doctors.find((d) => d.id === rescheduleTarget.doctorId);
                      return doc ? localizedDoctor(doc, locale).name : "Dr. Clinician";
                    })(),
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {rescheduleTarget && (
            <div className="space-y-4 py-2">
              {/* Select Date */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{t.patient.booking.selectNewDateLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {clinic.getAvailableDates(rescheduleTarget.serviceId, rescheduleTarget.doctorId).map((d) => (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant={rescheduleDate === d ? "default" : "outline"}
                      onClick={() => {
                        setRescheduleDate(d);
                        setRescheduleTime("");
                      }}
                      className="min-h-11 rounded-xl text-xs"
                    >
                      {formatDate(d, { month: "short", day: "numeric" })}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Select Slot */}
              {rescheduleDate && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground">{t.patient.booking.selectNewSlotLabel}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {clinic.getAvailableSlots(rescheduleTarget.serviceId, rescheduleTarget.doctorId, rescheduleDate).map((tSlot) => (
                      <Button
                        key={tSlot}
                        type="button"
                        size="sm"
                        variant={rescheduleTime === tSlot ? "default" : "outline"}
                        onClick={() => setRescheduleTime(tSlot)}
                        className="min-h-11 rounded-xl text-xs font-semibold"
                      >
                        {formatTime(tSlot)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRescheduleTarget(null)}
              className="min-h-11 rounded-xl text-xs"
            >
              {t.patient.booking.cancelBtn}
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={reschedulePending || !rescheduleDate || !rescheduleTime}
              onClick={handleRescheduleSubmit}
              className="min-h-11 rounded-xl text-xs font-bold"
            >
              {reschedulePending ? t.patient.booking.savingBtn : t.patient.booking.saveNewTimingBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CANCELLATION DIALOG WITH 24-HOUR RULE TEST HARNESS */}
      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {!cancelPolicyResult.allowed ? (
                <>
                  <Ban className="size-5 text-destructive" />
                  {t.patient.booking.cancelBlocked}
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-destructive" />
                  {t.patient.booking.cancelAllowed}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1 leading-relaxed">
              {!cancelPolicyResult.allowed ? (
                <span>
                  {interpolate(t.patient.booking.cancelBlockedNote, {
                    hours: cancelPolicyResult.hoursRemaining,
                  })}
                </span>
              ) : (
                <span>
                  {interpolate(t.patient.booking.cancelConfirmInline, {
                    date: cancelTarget?.date ?? "",
                    time: cancelTarget?.time ?? "",
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Test Harness QA Toggle: Simulate <24h Window */}
          <div className="my-2 rounded-2xl border border-dashed border-border/80 bg-muted/40 p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">{t.patient.booking.qaSimTitle}</span>
              <p className="text-[11px] text-muted-foreground">{t.patient.booking.qaSimDesc}</p>
            </div>
            <Switch
              checked={simulateUnder24h}
              onCheckedChange={setSimulateUnder24h}
              aria-label={t.patient.booking.qaSimAria}
            />
          </div>

          {!cancelPolicyResult.allowed && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              {t.patient.overview.clinicDeskNotice}
            </div>
          )}

          {cancelPolicyResult.allowed && (
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

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTarget(null)}
              className="min-h-11 rounded-xl text-xs"
            >
              {t.patient.overview.keepAppointment}
            </Button>
            {cancelPolicyResult.allowed && (
              <HoldButton
                variant="destructive"
                holdDuration={1500}
                disabled={cancelPending}
                holdingLabel={t.patient.overview.keepHoldingCancel}
                completeLabel={t.patient.overview.appointmentCancelled}
                onHoldComplete={handleCancelSubmit}
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

export function PatientAppointments() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading patient appointments...</div>}>
      <PatientAppointmentsContent />
    </Suspense>
  );
}

export default PatientAppointments;
