"use client";

import { useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const patientDisplayName = name || "Mariam Ahmed";

  const plan = clinic.getPatientTreatmentPlan(patientEmail);
  const teethMap = useMemo(() => {
    const map = new Map<number, ToothRecord>();
    plan.teeth.forEach((tooth) => {
      map.set(tooth.toothNumber, tooth);
    });
    return map;
  }, [plan.teeth]);

  // Selected tooth for inspection
  const [selectedToothNumber, setSelectedToothNumber] = useState<number>(36);
  const selectedTooth = teethMap.get(selectedToothNumber) ?? {
    toothNumber: selectedToothNumber,
    label: `Tooth #${selectedToothNumber}`,
    status: "healthy" as ToothStatus,
    condition: "Sound anatomical structure with no active pathologies.",
    proposedTreatment: "Routine preventive maintenance and observation.",
  };

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
      setApprovalError("Please provide your full legal name.");
      return;
    }
    if (!approvalSignature) {
      setApprovalError("Please sign within the box to confirm your digital acceptance.");
      return;
    }

    setIsApproving(true);
    try {
      await clinic.approveTreatmentPlan(plan.id, approvalName.trim(), approvalSignature, patientEmail);
      setApproveDialogOpen(false);
    } catch {
      setApprovalError("Failed to record plan approval. Please try again.");
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
      setBookingError("Please select an available date and time slot.");
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
      setBookingError("This time slot is no longer available. Please select another slot.");
    } finally {
      setIsBookingPhase(false);
    }
  };

  const defaultDateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  const isApproved = plan.status === "approved";

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header and Status */}
      <div className="space-y-3">
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
              {t.patient.treatment.planApprovedOn
                .replace("{date}", plan.approvedAt ? formatDate(plan.approvedAt.slice(0, 10), defaultDateOpts) : "Oct 19, 2026")
                .replace("{name}", plan.signedByName || patientDisplayName)}
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
              Your clinical roadmap is locked. You can now schedule upcoming phases directly in sequence below.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-foreground">
                Action Required: Digital Plan Acceptance
              </span>
              <p className="text-xs text-muted-foreground">
                Review the diagnosed dental chart and phased procedures below, then sign electronically to authorize care.
              </p>
            </div>
            <Button
              variant="accent"
              size="default"
              onClick={() => {
                setApprovalError(null);
                setApproveDialogOpen(true);
              }}
              className="font-semibold shrink-0"
            >
              <PenTool className="size-4 mr-1.5" />
              {t.patient.treatment.approvePlan}
            </Button>
          </div>
        )}
      </div>

      {/* Overview Progress Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Overall Phased Progress
              </span>
              <div className="text-2xl font-bold text-foreground">
                {pricingTotals.scheduledPhasesCount} of {pricingTotals.totalPhases} Phases
              </div>
              <p className="text-xs text-muted-foreground">
                {pricingTotals.scheduledPhasesCount === pricingTotals.totalPhases
                  ? "All phases booked into clinical calendar."
                  : "Next phase awaiting reservation."}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Roadmap Completion</span>
                <span className="text-brand-primary">{pricingTotals.progressPercent}%</span>
              </div>
              <Progress value={pricingTotals.progressPercent} className="h-3 w-full bg-muted" />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Phase 1 (Urgent)</span>
                <span>Phase 2 (Restorative)</span>
                <span>Phase 3 (Elective)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual FDI 32-Tooth Map */}
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
              Adult FDI 2-Digit Standard
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Legend:</span>
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

          {/* Dental Arches Grid */}
          <div className="space-y-6 overflow-x-auto pb-2">
            {/* Maxilla (Upper Jaw) */}
            <div className="space-y-2 min-w-[580px]">
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span>Upper Right (Q1)</span>
                <span className="text-foreground uppercase tracking-wider">{t.patient.treatment.upperJaw}</span>
                <span>Upper Left (Q2)</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {/* Upper Right Quadrant 1: 18 down to 11 */}
                <div className="flex gap-1 sm:gap-1.5">
                  {UPPER_RIGHT_QUAD.map((num) => {
                    const tooth = teethMap.get(num) ?? {
                      toothNumber: num,
                      label: `Tooth #${num}`,
                      status: "healthy" as ToothStatus,
                      condition: "Sound",
                      proposedTreatment: "Preventive",
                    };
                    const isSelected = selectedToothNumber === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedToothNumber(num)}
                        className={cn(
                          "min-h-11 min-w-11 relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          toothStatusStyles[tooth.status],
                          isSelected && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-md font-bold"
                        )}
                        title={`${tooth.label} - ${tooth.condition}`}
                      >
                        <span className="text-[11px] leading-tight">{num}</span>
                        {tooth.status !== "healthy" && (
                          <span className="size-1.5 rounded-full bg-current mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Arch Midline Divider */}
                <div className="h-10 w-px bg-border/80 mx-1 shrink-0" />

                {/* Upper Left Quadrant 2: 21 up to 28 */}
                <div className="flex gap-1 sm:gap-1.5">
                  {UPPER_LEFT_QUAD.map((num) => {
                    const tooth = teethMap.get(num) ?? {
                      toothNumber: num,
                      label: `Tooth #${num}`,
                      status: "healthy" as ToothStatus,
                      condition: "Sound",
                      proposedTreatment: "Preventive",
                    };
                    const isSelected = selectedToothNumber === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedToothNumber(num)}
                        className={cn(
                          "min-h-11 min-w-11 relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          toothStatusStyles[tooth.status],
                          isSelected && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-md font-bold"
                        )}
                        title={`${tooth.label} - ${tooth.condition}`}
                      >
                        <span className="text-[11px] leading-tight">{num}</span>
                        {tooth.status !== "healthy" && (
                          <span className="size-1.5 rounded-full bg-current mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mandible (Lower Jaw) */}
            <div className="space-y-2 min-w-[580px]">
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span>Lower Right (Q4)</span>
                <span className="text-foreground uppercase tracking-wider">{t.patient.treatment.lowerJaw}</span>
                <span>Lower Left (Q3)</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {/* Lower Right Quadrant 4: 48 down to 41 */}
                <div className="flex gap-1 sm:gap-1.5">
                  {LOWER_RIGHT_QUAD.map((num) => {
                    const tooth = teethMap.get(num) ?? {
                      toothNumber: num,
                      label: `Tooth #${num}`,
                      status: "healthy" as ToothStatus,
                      condition: "Sound",
                      proposedTreatment: "Preventive",
                    };
                    const isSelected = selectedToothNumber === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedToothNumber(num)}
                        className={cn(
                          "min-h-11 min-w-11 relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          toothStatusStyles[tooth.status],
                          isSelected && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-md font-bold"
                        )}
                        title={`${tooth.label} - ${tooth.condition}`}
                      >
                        <span className="text-[11px] leading-tight">{num}</span>
                        {tooth.status !== "healthy" && (
                          <span className="size-1.5 rounded-full bg-current mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Arch Midline Divider */}
                <div className="h-10 w-px bg-border/80 mx-1 shrink-0" />

                {/* Lower Left Quadrant 3: 31 up to 38 */}
                <div className="flex gap-1 sm:gap-1.5">
                  {LOWER_LEFT_QUAD.map((num) => {
                    const tooth = teethMap.get(num) ?? {
                      toothNumber: num,
                      label: `Tooth #${num}`,
                      status: "healthy" as ToothStatus,
                      condition: "Sound",
                      proposedTreatment: "Preventive",
                    };
                    const isSelected = selectedToothNumber === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedToothNumber(num)}
                        className={cn(
                          "min-h-11 min-w-11 relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          toothStatusStyles[tooth.status],
                          isSelected && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-md font-bold"
                        )}
                        title={`${tooth.label} - ${tooth.condition}`}
                      >
                        <span className="text-[11px] leading-tight">{num}</span>
                        {tooth.status !== "healthy" && (
                          <span className="size-1.5 rounded-full bg-current mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tooth Inspector Card */}
          <div className="rounded-xl bg-brand-subtle/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-foreground">
                    Tooth #{selectedTooth.toothNumber} — {selectedTooth.label}
                  </span>
                  <Badge variant={toothStatusBadgeVariants[selectedTooth.status]}>
                    {selectedTooth.status.toUpperCase()}
                  </Badge>
                  {selectedTooth.phaseOrder && (
                    <Badge variant="outline" className="text-xs">
                      Phase {selectedTooth.phaseOrder} Priority
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
                  className="text-xs"
                >
                  <Calendar className="size-3.5 mr-1" />
                  Jump to Phase {selectedTooth.phaseOrder}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-card p-3">
                <span className="font-semibold text-foreground block mb-1">
                  Proposed Clinical Care:
                </span>
                <span className="text-muted-foreground">
                  {selectedTooth.proposedTreatment}
                </span>
              </div>
              <div className="rounded-lg bg-card p-3">
                <span className="font-semibold text-foreground block mb-1">
                  Clinician Diagnostic &amp; X-Ray Note:
                </span>
                <span className="text-muted-foreground italic">
                  {selectedTooth.xrayNote || "No periapical bone loss or restorative defects detected."}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phased Breakdown & Transparent Pricing */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {t.patient.treatment.phasesTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Step-by-step phased care planned in order of clinical urgency, functionality, and aesthetic results.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              3 Structured Clinical Phases
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

              return (
                <AccordionItem key={phase.id} value={phase.id} className="py-2">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-3 text-left pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-full bg-brand-subtle text-brand-primary text-xs font-bold">
                          {phase.order}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            {serviceTitle}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            Priority: {phase.priority.toUpperCase()} • Approx {phase.durationMinutes} mins
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isScheduled ? (
                          <Badge variant="success" className="text-xs">
                            Scheduled ✓
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not Scheduled
                          </Badge>
                        )}
                        <span className="text-sm font-bold text-foreground">
                          {phase.outOfPocketEgp} EGP
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 text-xs sm:text-sm text-muted-foreground space-y-4">
                    <p className="leading-relaxed">{phase.description}</p>

                    {/* Financial & Clinical Details Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">Total Clinic Fee</span>
                        <span className="text-sm font-semibold text-foreground">
                          {phase.totalFeeEgp} EGP
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">Insurance Scaffold</span>
                        <span className="text-xs font-medium text-brand-primary">
                          {phase.insuranceScaffoldNote} (0 EGP)
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <span className="text-xs text-muted-foreground block">Patient Out-of-Pocket</span>
                        <span className="text-sm font-bold text-foreground">
                          {phase.outOfPocketEgp} EGP
                        </span>
                      </div>
                    </div>

                    {/* Schedule Phase CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-muted-foreground">
                        {isScheduled ? (
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <Check className="size-4 text-brand-primary" />
                            Confirmed in booking calendar (Reference: #{phase.scheduledAppointmentId})
                          </span>
                        ) : (
                          <span>Earliest available dental chair slot can be reserved now.</span>
                        )}
                      </div>

                      {!isScheduled && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenScheduleModal(phase)}
                          className="font-medium"
                        >
                          <Calendar className="size-3.5 mr-1.5" />
                          Schedule Phase {phase.order}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Transparent Pricing Summary Table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-semibold text-foreground">
              Transparent Financial Summary
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Phase</TableHead>
                  <TableHead>Clinical Procedure</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Clinic Fee</TableHead>
                  <TableHead className="text-right">Insurance</TableHead>
                  <TableHead className="text-right font-bold">Out-of-Pocket</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.phases.map((phase) => (
                  <TableRow key={phase.id}>
                    <TableCell className="font-medium">#{phase.order}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-foreground">{phase.title}</span>
                        {phase.toothNumber && (
                          <span className="text-xs text-muted-foreground block">
                            Tooth #{phase.toothNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{phase.durationMinutes} mins</TableCell>
                    <TableCell className="text-right">{phase.totalFeeEgp} EGP</TableCell>
                    <TableCell className="text-right text-xs text-brand-primary">
                      Scaffold (0 EGP)
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {phase.outOfPocketEgp} EGP
                    </TableCell>
                    <TableCell className="text-right">
                      {phase.scheduledAppointmentId ? (
                        <Badge variant="success" className="text-xs">
                          Booked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold text-foreground">
                    Grand Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {pricingTotals.totalFee} EGP
                  </TableCell>
                  <TableCell className="text-right text-xs text-brand-primary">
                    0 EGP (Scaffold)
                  </TableCell>
                  <TableCell className="text-right font-bold text-brand-primary text-base">
                    {pricingTotals.totalOutOfPocket} EGP
                  </TableCell>
                  <TableCell className="text-right" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Plan Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5 text-brand-primary" />
              {t.patient.treatment.approvePlan}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review and sign electronically to accept the proposed phased care course and transparent estimates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground block">
                Digital Informed Acceptance Terms:
              </span>
              <p>
                I have reviewed the diagnostic dental chart and recommended phased treatments. I understand the estimated fees and authorize BlueHaven Dental clinicians to carry out these agreed procedures.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approve-name" className="text-xs sm:text-sm font-medium">
                Full Legal Name *
              </Label>
              <Input
                id="approve-name"
                value={approvalName}
                onChange={(e) => setApprovalName(e.target.value)}
                placeholder="Full Legal Name"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Digital Signature (Mouse, Pen or Finger) *
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
                <AlertTitle>Validation Notice</AlertTitle>
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
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleApprovePlan}
              disabled={isApproving}
              className="font-semibold"
            >
              {isApproving ? "Recording Approval..." : "Sign & Authorize Treatment Plan"}
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
              Schedule Phase #{schedulePhase?.order}: {schedulePhase?.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Select your preferred appointment date and clinician time slot.
            </DialogDescription>
          </DialogHeader>

          {bookedSuccessInfo ? (
            <div className="space-y-4 py-4">
              <Alert className="border-border bg-brand-subtle text-foreground shadow-xs">
                <CheckCircle2 className="size-5 text-brand-primary" />
                <AlertTitle className="font-semibold text-foreground">
                  Phase #{schedulePhase?.order} Successfully Reserved!
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-1">
                  <p>
                    Your appointment has been confirmed for{" "}
                    <strong>{formatDate(bookedSuccessInfo.date, defaultDateOpts)}</strong> at{" "}
                    <strong>{formatTime(bookedSuccessInfo.time)}</strong>.
                  </p>
                  <p className="text-[11px]">Confirmation reference: #{bookedSuccessInfo.id}</p>
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setSchedulePhase(null)}
                  className="w-full"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Service & Duration summary */}
              <div className="rounded-lg bg-muted/40 p-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground block">
                    Duration: {schedulePhase?.durationMinutes} minutes
                  </span>
                  <span className="text-muted-foreground">
                    Out-of-Pocket: {schedulePhase?.outOfPocketEgp} EGP
                  </span>
                </div>
                <Badge variant="outline">Chairside Care</Badge>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">1. Choose Date</Label>
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
                      No open calendar slots found for this procedure.
                    </span>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">2. Choose Time Slot</Label>
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
                        All slots on this date are fully booked.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {bookingError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Booking Error</AlertTitle>
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
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleConfirmPhaseBooking}
                  disabled={isBookingPhase || !selectedDate || !selectedTimeSlot}
                  className="font-semibold"
                >
                  {isBookingPhase ? "Reserving..." : "Confirm Phase Reservation"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
