"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import { interpolate } from "@/i18n/format";
import { localizedService } from "@/data/mock/localized-copy";
import type { ToothRecord, ToothStatus, TreatmentPhase } from "@/data/mock/catalog";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignaturePad } from "@/components/shared/signature-pad";

// Styling classes mapped outside className attributes to adhere cleanly to lint standards
const toothStatusStyles: Record<ToothStatus, string> = {
  urgent: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  restorative: "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25",
  elective: "bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/25",
  treated: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25",
  healthy: "bg-muted text-muted-foreground hover:bg-muted/70",
};

const legendDotStyles: Record<ToothStatus, string> = {
  urgent: "bg-destructive",
  restorative: "bg-amber-500",
  elective: "bg-sky-500",
  treated: "bg-emerald-500",
  healthy: "bg-muted-foreground/30",
};

const toothStatusBadgeVariants: Record<ToothStatus, "destructive" | "secondary" | "outline" | "success" | "default"> = {
  urgent: "destructive",
  restorative: "secondary",
  elective: "default",
  treated: "success",
  healthy: "outline",
};

const UPPER_RIGHT_QUAD = [18, 17, 16, 15, 14, 13, 12, 11] as const;
const UPPER_LEFT_QUAD = [21, 22, 23, 24, 25, 26, 27, 28] as const;
const LOWER_RIGHT_QUAD = [48, 47, 46, 45, 44, 43, 42, 41] as const;
const LOWER_LEFT_QUAD = [31, 32, 33, 34, 35, 36, 37, 38] as const;

export function PatientTreatmentPlan() {
  const { signedInEmail, name } = useSession();
  const clinic = useClinic();
  const { locale, formatDate, formatTime, t } = useI18n();

  const patientEmail = signedInEmail || "mariam.a@example.com";
  const patientDisplayName = name || t.patient.nav.defaultUserName;

  const toothStatusLabels: Record<ToothStatus, string> = {
    healthy: t.patient.treatment.statusHealthy,
    urgent: t.patient.treatment.statusUrgent,
    restorative: t.patient.treatment.statusRestorative,
    elective: t.patient.treatment.statusElective,
    treated: t.patient.treatment.statusTreated,
  };

  const priorityLabels: Record<string, string> = {
    urgent: t.patient.treatment.statusUrgent,
    restorative: t.patient.treatment.statusRestorative,
    elective: t.patient.treatment.statusElective,
  };

  const plan = clinic.getPatientTreatmentPlan(patientEmail);
  const teethMap = useMemo(() => {
    const map = new Map<number, ToothRecord>();
    plan.teeth.forEach((tooth) => {
      map.set(tooth.toothNumber, tooth);
    });
    return map;
  }, [plan.teeth]);

  const getToothRecord = (num: number): ToothRecord =>
    teethMap.get(num) ?? {
      toothNumber: num,
      label: "",
      status: "healthy",
      condition: t.patient.treatment.healthyConditionDefault,
      proposedTreatment: t.patient.treatment.healthyTreatmentDefault,
    };

  // Selected tooth for inspection
  const [selectedToothNumber, setSelectedToothNumber] = useState<number>(36);
  const selectedTooth = getToothRecord(selectedToothNumber);

  // Plan approval modal state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approvalName, setApprovalName] = useState(patientDisplayName);
  const [approvalSignature, setApprovalSignature] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Phase scheduling modal state
  const [schedulePhase, setSchedulePhase] = useState<TreatmentPhase | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ time: string; doctorId: string; doctorName: string } | null>(null);
  const [isBookingPhase, setIsBookingPhase] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedSuccessInfo, setBookedSuccessInfo] = useState<{ date: string; time: string; id: string } | null>(null);

  // Calculate pricing totals
  const pricingTotals = useMemo(() => {
    const totalFee = plan.phases.reduce((sum, phase) => sum + phase.totalFeeEgp, 0);
    const totalOutOfPocket = plan.phases.reduce((sum, phase) => sum + phase.outOfPocketEgp, 0);
    const scheduledPhasesCount = plan.phases.filter((p) => Boolean(p.scheduledAppointmentId)).length;
    return {
      totalFee,
      totalOutOfPocket,
      insuranceCoverage: 0,
      totalPhases: plan.phases.length,
      scheduledPhasesCount,
      progressPercent: plan.phases.length > 0 ? Math.round((scheduledPhasesCount / plan.phases.length) * 100) : 0,
    };
  }, [plan.phases]);

  // Available dates & slots for selected phase
  const availablePhaseDates = useMemo(() => {
    if (!schedulePhase) return [];
    return clinic.getAvailableDatesForAnyDoctor(schedulePhase.serviceId);
  }, [clinic, schedulePhase]);

  const availablePhaseSlots = useMemo(() => {
    if (!schedulePhase || !selectedDate) return [];
    return clinic.getAvailableSlotsForAnyDoctor(schedulePhase.serviceId, selectedDate);
  }, [clinic, schedulePhase, selectedDate]);

  // Handle Plan Approval
  const handleApprovePlan = async () => {
    setApprovalError(null);
    if (!approvalName.trim()) {
      setApprovalError(t.patient.treatment.nameRequiredError);
      return;
    }
    if (!approvalSignature) {
      setApprovalError(t.patient.treatment.signatureRequiredError);
      return;
    }

    setIsApproving(true);
    try {
      await clinic.approveTreatmentPlan(plan.id, approvalName.trim(), approvalSignature, patientEmail);
      setApproveDialogOpen(false);
    } catch {
      setApprovalError(t.patient.treatment.approveFailedError);
    } finally {
      setIsApproving(false);
    }
  };

  // Open phase schedule dialog
  const handleOpenScheduleModal = (phase: TreatmentPhase) => {
    setSchedulePhase(phase);
    setSelectedDate("");
    setSelectedTimeSlot(null);
    setBookingError(null);
    setBookedSuccessInfo(null);
  };

  // Handle phase appointment booking
  const handleConfirmPhaseBooking = async () => {
    if (!schedulePhase || !selectedDate || !selectedTimeSlot) {
      setBookingError(t.patient.treatment.slotRequiredError);
      return;
    }

    setIsBookingPhase(true);
    setBookingError(null);
    try {
      const booked = await clinic.bookAppointment({
        serviceId: schedulePhase.serviceId,
        doctorId: selectedTimeSlot.doctorId,
        date: selectedDate,
        time: selectedTimeSlot.time,
        patientName: patientDisplayName,
        email: patientEmail,
        phone: "+20 10 1234 5678",
      });

      await clinic.linkPhaseAppointment(plan.id, schedulePhase.id, booked.id, patientEmail);
      setBookedSuccessInfo({
        date: selectedDate,
        time: selectedTimeSlot.time,
        id: booked.id,
      });
    } catch {
      setBookingError(t.patient.treatment.slotUnavailableError);
    } finally {
      setIsBookingPhase(false);
    }
  };

  const defaultDateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  const isApproved = plan.status === "approved";

  const schedulePhaseService = schedulePhase ? clinic.services.find((s) => s.id === schedulePhase.serviceId) : undefined;
  const schedulePhaseTitle = schedulePhase
    ? schedulePhaseService
      ? localizedService(schedulePhaseService, locale).title
      : schedulePhase.title
    : "";

  const renderToothQuadrant = (nums: readonly number[]) => (
    <div className="flex gap-1 sm:gap-1.5">
      {nums.map((num) => {
        const tooth = getToothRecord(num);
        const isSelected = selectedToothNumber === num;
        const toothTitle = tooth.label
          ? `${interpolate(t.patient.treatment.toothNumberTitle, { number: num })} — ${tooth.label}`
          : interpolate(t.patient.treatment.toothNumberTitle, { number: num });
        return (
          <motion.button
            key={num}
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedToothNumber(num)}
            className={cn(
              "min-h-11 min-w-11 relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
              toothStatusStyles[tooth.status],
              isSelected && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-md font-bold"
            )}
            title={`${toothTitle} - ${tooth.condition}`}
          >
            <span className="text-[11px] leading-tight">{num}</span>
            {tooth.status !== "healthy" && (
              <span className="size-1.5 rounded-full bg-current mt-0.5" />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl space-y-8">
        {/* Header and Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.patient.treatment.title}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {t.patient.treatment.subtitle}
              </p>
            </div>
            <div>
              {isApproved ? (
                <Badge variant="success" className="gap-1.5 py-1 px-3 text-xs sm:text-sm font-semibold">
                  <ShieldCheck className="size-4" />
                  {t.patient.treatment.planStatusApproved}
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs sm:text-sm font-semibold">
                  <Clock className="size-4 text-brand-primary" />
                  {t.patient.treatment.planStatusProposed}
                </Badge>
              )}
            </div>
          </div>

          {/* Approval Banner / CTA */}
          {isApproved ? (
            <Alert className="border-border bg-brand-subtle text-foreground shadow-xs">
              <CheckCircle2 className="size-5 text-brand-primary" />
              <AlertTitle className="font-semibold text-foreground">
                {interpolate(t.patient.treatment.planApprovedOn, {
                  date: plan.approvedAt ? formatDate(plan.approvedAt.slice(0, 10), defaultDateOpts) : formatDate("2026-10-19", defaultDateOpts),
                  name: plan.signedByName || patientDisplayName,
                })}
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                {t.patient.treatment.planApprovedDesc}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">
                  {t.patient.treatment.actionRequiredTitle}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t.patient.treatment.actionRequiredDesc}
                </p>
              </div>
              <Button
                variant="accent"
                size="default"
                onClick={() => {
                  setApprovalError(null);
                  setApproveDialogOpen(true);
                }}
                className="min-h-11 font-semibold shrink-0"
              >
                <PenTool className="size-4 me-1.5" />
                {t.patient.treatment.approvePlan}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Overview Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
        >
          <Card className="border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {t.patient.treatment.overallProgressLabel}
                  </span>
                  <div className="text-2xl font-bold text-foreground">
                    {interpolate(t.patient.treatment.phasesFraction, {
                      scheduled: pricingTotals.scheduledPhasesCount,
                      total: pricingTotals.totalPhases,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pricingTotals.scheduledPhasesCount === pricingTotals.totalPhases
                      ? t.patient.treatment.allPhasesBooked
                      : t.patient.treatment.nextPhaseAwaiting}
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{t.patient.treatment.roadmapCompletion}</span>
                    <span className="text-brand-primary">{pricingTotals.progressPercent}%</span>
                  </div>
                  <Progress value={pricingTotals.progressPercent} className="h-3 w-full bg-muted" />
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>{t.patient.treatment.phaseShort1}</span>
                    <span>{t.patient.treatment.phaseShort2}</span>
                    <span>{t.patient.treatment.phaseShort3}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visual FDI 32-Tooth Map */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08, ease: "easeOut" }}
        >
          <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {t.patient.treatment.fdiChartTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.patient.treatment.fdiChartSubtitle}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {t.patient.treatment.fdiStandardBadge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t.patient.treatment.legendLabel}</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-full", legendDotStyles.urgent)} />
              <span>{t.patient.treatment.statusUrgent}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-full", legendDotStyles.restorative)} />
              <span>{t.patient.treatment.statusRestorative}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-full", legendDotStyles.elective)} />
              <span>{t.patient.treatment.statusElective}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-full", legendDotStyles.treated)} />
              <span>{t.patient.treatment.statusTreated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-full", legendDotStyles.healthy)} />
              <span>{t.patient.treatment.statusHealthy}</span>
            </div>
          </div>

          {/* Dental Arches Grid (FDI anatomy stays left-to-right regardless of document dir) */}
          <div dir="ltr" className="space-y-6 overflow-x-auto pb-2">
            {/* Maxilla (Upper Jaw) */}
            <div className="space-y-2 min-w-[580px]">
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span>{t.patient.treatment.upperRightQ1}</span>
                <span className="text-foreground uppercase tracking-wider">{t.patient.treatment.upperJaw}</span>
                <span>{t.patient.treatment.upperLeftQ2}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {renderToothQuadrant(UPPER_RIGHT_QUAD)}
                <div className="h-10 w-px bg-border/80 mx-1 shrink-0" />
                {renderToothQuadrant(UPPER_LEFT_QUAD)}
              </div>
            </div>

            {/* Mandible (Lower Jaw) */}
            <div className="space-y-2 min-w-[580px]">
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span>{t.patient.treatment.lowerRightQ4}</span>
                <span className="text-foreground uppercase tracking-wider">{t.patient.treatment.lowerJaw}</span>
                <span>{t.patient.treatment.lowerLeftQ3}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {renderToothQuadrant(LOWER_RIGHT_QUAD)}
                <div className="h-10 w-px bg-border/80 mx-1 shrink-0" />
                {renderToothQuadrant(LOWER_LEFT_QUAD)}
              </div>
            </div>
          </div>

          {/* Interactive Tooth Inspector Card */}
          <div className="rounded-xl bg-brand-subtle/40 p-4 sm:p-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedTooth.toothNumber}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-foreground">
                        {interpolate(t.patient.treatment.toothNumberTitle, { number: selectedTooth.toothNumber })}
                        {selectedTooth.label ? ` — ${selectedTooth.label}` : ""}
                      </span>
                      <Badge variant={toothStatusBadgeVariants[selectedTooth.status]}>
                        {toothStatusLabels[selectedTooth.status]}
                      </Badge>
                      {selectedTooth.phaseOrder && (
                        <Badge variant="outline" className="text-xs">
                          {interpolate(t.patient.treatment.phasePriorityBadge, { order: selectedTooth.phaseOrder })}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground font-medium">
                      {selectedTooth.condition}
                    </p>
                  </div>

                  {selectedTooth.phaseOrder && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const phase = plan.phases.find((p) => p.order === selectedTooth.phaseOrder);
                        if (phase) handleOpenScheduleModal(phase);
                      }}
                      className="min-h-11 text-xs"
                    >
                      <Calendar className="size-3.5 me-1" />
                      {interpolate(t.patient.treatment.jumpToPhaseBtn, { order: selectedTooth.phaseOrder })}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-card p-3">
                    <span className="font-semibold text-foreground block mb-1">
                      {t.patient.treatment.proposedCareLabel}
                    </span>
                    <span className="text-muted-foreground">
                      {selectedTooth.proposedTreatment}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <span className="font-semibold text-foreground block mb-1">
                      {t.patient.treatment.xrayNoteLabel}
                    </span>
                    <span className="text-muted-foreground italic">
                      {selectedTooth.xrayNote || t.patient.treatment.xrayNoteDefault}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
        </motion.div>

      {/* Phased Breakdown & Transparent Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.12, ease: "easeOut" }}
      >
      <Card className="border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {t.patient.treatment.phasesTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.patient.treatment.phasesSubtitle}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {interpolate(t.patient.treatment.phasesCountBadge, { count: plan.phases.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accordion Phased Breakdown */}
          <Accordion defaultValue={["phase-1"]} className="w-full">
            {plan.phases.map((phase) => {
              const isScheduled = Boolean(phase.scheduledAppointmentId);
              const service = clinic.services.find((s) => s.id === phase.serviceId);
              const serviceTitle = service ? localizedService(service, locale).title : phase.title;
              const phasePriorityLabel = priorityLabels[phase.priority.toLowerCase()] ?? phase.priority;

              return (
                <AccordionItem key={phase.id} value={phase.id} className="py-2">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-3 text-start pe-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-full bg-brand-subtle text-brand-primary text-xs font-bold">
                          {phase.order}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            {serviceTitle}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {interpolate(t.patient.treatment.phasePriorityDuration, {
                              priority: phasePriorityLabel,
                              minutes: phase.durationMinutes,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isScheduled ? (
                          <Badge variant="success" className="text-xs">
                            {t.patient.treatment.scheduledBadge}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t.patient.treatment.notScheduledBadge}
                          </Badge>
                        )}
                        <span className="text-sm font-bold text-foreground">
                          {phase.outOfPocketEgp} {t.patient.overview.currencyEgp}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 text-xs sm:text-sm text-muted-foreground space-y-4">
                    <p className="leading-relaxed">{phase.description}</p>

                    {/* Financial & Clinical Details Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">{t.patient.treatment.totalClinicFee}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {phase.totalFeeEgp} {t.patient.overview.currencyEgp}
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">{t.patient.treatment.insuranceScaffoldLabel}</span>
                        <span className="text-xs font-medium text-brand-primary">
                          {phase.insuranceScaffoldNote} (0 {t.patient.overview.currencyEgp})
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">{t.patient.treatment.outOfPocketLabel}</span>
                        <span className="text-sm font-bold text-foreground">
                          {phase.outOfPocketEgp} {t.patient.overview.currencyEgp}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Phase CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-muted-foreground">
                        {isScheduled ? (
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <Check className="size-4 text-brand-primary" />
                            {interpolate(t.patient.treatment.confirmedCalendarRef, {
                              id: phase.scheduledAppointmentId ?? "",
                            })}
                          </span>
                        ) : (
                          <span>{t.patient.treatment.earliestSlotHint}</span>
                        )}
                      </div>

                      {!isScheduled && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenScheduleModal(phase)}
                          className="min-h-11 font-medium"
                        >
                          <Calendar className="size-3.5 me-1.5" />
                          {interpolate(t.patient.treatment.schedulePhaseBtn, { order: phase.order })}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
      </motion.div>

      {/* Approve Plan Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5 text-brand-primary" />
              {t.patient.treatment.approvePlan}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t.patient.treatment.approveDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground block">
                {t.patient.treatment.termsHeading}
              </span>
              <p>
                {t.patient.treatment.termsBody}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approve-name" className="text-xs sm:text-sm font-medium">
                {t.patient.treatment.fullLegalNameLabel}
              </Label>
              <Input
                id="approve-name"
                value={approvalName}
                onChange={(e) => setApprovalName(e.target.value)}
                placeholder={t.patient.treatment.fullLegalNameLabel.replace(" *", "")}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                {t.patient.treatment.signatureLabel}
              </Label>
              <div className="rounded-xl border border-border bg-card p-2">
                <SignaturePad
                  value={approvalSignature}
                  onChange={setApprovalSignature}
                  instructions={t.patient.intake.signatureInstructions}
                />
              </div>
            </div>

            {approvalError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>{t.patient.intake.validationNotice}</AlertTitle>
                <AlertDescription className="text-xs">{approvalError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isApproving}
            >
              {t.patient.booking.cancelBtn}
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleApprovePlan}
              disabled={isApproving}
              className="font-semibold"
            >
              {isApproving ? t.patient.treatment.recordingApproval : t.patient.treatment.authorizePlanBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1-Click Schedule Phase Dialog */}
      <Dialog open={Boolean(schedulePhase)} onOpenChange={(open) => !open && setSchedulePhase(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-brand-primary" />
              {schedulePhase
                ? interpolate(t.patient.treatment.scheduleDialogTitle, {
                    order: schedulePhase.order,
                    title: schedulePhaseTitle,
                  })
                : ""}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t.patient.treatment.scheduleDialogDesc}
            </DialogDescription>
          </DialogHeader>

          {bookedSuccessInfo ? (
            <div className="space-y-4 py-4">
              <Alert className="border-border bg-brand-subtle text-foreground shadow-xs">
                <CheckCircle2 className="size-5 text-brand-primary" />
                <AlertTitle className="font-semibold text-foreground">
                  {schedulePhase
                    ? interpolate(t.patient.treatment.phaseReservedTitle, { order: schedulePhase.order })
                    : ""}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-1">
                  <p>
                    {interpolate(t.patient.treatment.phaseReservedBody, {
                      date: formatDate(bookedSuccessInfo.date, defaultDateOpts),
                      time: formatTime(bookedSuccessInfo.time),
                    })}
                  </p>
                  <p className="text-[11px]">
                    {interpolate(t.patient.treatment.confirmationRef, { id: bookedSuccessInfo.id })}
                  </p>
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setSchedulePhase(null)}
                  className="w-full"
                >
                  {t.patient.treatment.doneBtn}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Service & Duration summary */}
              <div className="rounded-lg bg-muted/40 p-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground block">
                    {interpolate(t.patient.treatment.durationMinutesLabel, {
                      minutes: schedulePhase?.durationMinutes ?? 0,
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    {interpolate(t.patient.treatment.outOfPocketLine, {
                      amount: schedulePhase?.outOfPocketEgp ?? 0,
                    })}
                  </span>
                </div>
                <Badge variant="outline">{t.patient.treatment.chairsideCareBadge}</Badge>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">{t.patient.treatment.chooseDateStep}</Label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {availablePhaseDates.length > 0 ? (
                    availablePhaseDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTimeSlot(null);
                        }}
                        className={cn(
                          "min-h-11 min-w-11 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                          selectedDate === date
                            ? "bg-primary text-primary-foreground ring-2 ring-primary"
                            : "bg-muted text-foreground hover:bg-muted/70"
                        )}
                      >
                        {formatDate(date, { weekday: "short", month: "short", day: "numeric" })}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground py-2">
                      {t.patient.treatment.noPhaseDates}
                    </span>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">{t.patient.treatment.chooseSlotStep}</Label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                    {availablePhaseSlots.length > 0 ? (
                      availablePhaseSlots.map((slot) => {
                        const isChosen = selectedTimeSlot?.time === slot.time && selectedTimeSlot?.doctorId === slot.doctorId;
                        return (
                          <button
                            key={`${slot.doctorId}-${slot.time}`}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={cn(
                              "min-h-11 min-w-11 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                              isChosen
                                ? "bg-primary text-primary-foreground ring-2 ring-primary"
                                : "bg-muted text-foreground hover:bg-muted/70"
                            )}
                          >
                            <span>{formatTime(slot.time)}</span>
                            <span className="block text-[10px] opacity-75">{slot.doctorName}</span>
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground py-2">
                        {t.patient.treatment.noPhaseSlots}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {bookingError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>{t.patient.treatment.bookingErrorTitle}</AlertTitle>
                  <AlertDescription className="text-xs">{bookingError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSchedulePhase(null)}
                  disabled={isBookingPhase}
                >
                  {t.patient.booking.cancelBtn}
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleConfirmPhaseBooking}
                  disabled={isBookingPhase || !selectedDate || !selectedTimeSlot}
                  className="min-h-11 font-semibold"
                >
                  {isBookingPhase ? t.patient.treatment.reservingBtn : t.patient.treatment.confirmPhaseBtn}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </MotionConfig>
  );
}
