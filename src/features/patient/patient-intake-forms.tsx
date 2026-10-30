"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  HeartPulse,
  Info,
  Lock,
  Pill,
  Save,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import type { PatientIntakeForm } from "@/data/mock/catalog";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const MEDICAL_CONDITIONS = [
  "Diabetes",
  "High Blood Pressure",
  "Pregnancy",
  "Heart Condition",
  "Asthma",
  "Bleeding Disorder",
] as const;

const ALLERGIES_LIST = [
  "Penicillin / Antibiotics",
  "Local Anesthetics (Lidocaine)",
  "Latex",
  "Aspirin / NSAIDs",
  "Sulfa Drugs",
] as const;

// Placeholder values written by the "no changes" shortcut; stripped when the shortcut is turned off.
const NONE_REPORTED = "None reported";
const NO_KNOWN_ALLERGIES = "No known allergies";

type IntakeStep = 1 | 2 | 3;

const STEP_LABELS: { step: IntakeStep; label: string }[] = [
  { step: 1, label: "1. Personal & Insurance" },
  { step: 2, label: "2. Medical History" },
  { step: 3, label: "3. Consent & Agreement" },
];

export function PatientIntakeForms() {
  const { signedInEmail, name } = useSession();
  const clinic = useClinic();
  const { formatDate, t, locale } = useI18n();

  const patientEmail = signedInEmail || "mariam.a@example.com";
  const patientDisplayName = name || "Mariam Ahmed";

  const initialForm = useMemo(
    () => clinic.getPatientIntakeForm(patientEmail),
    [clinic, patientEmail]
  );

  // Form State
  const [phone, setPhone] = useState(() => initialForm?.phone || "+20 10 1234 5678");
  const [emergencyContact, setEmergencyContact] = useState(
    () => initialForm?.emergencyContact || "Karim Ahmed (+20 10 9876 5432)"
  );
  const [noChangesVerified, setNoChangesVerified] = useState(
    () => Boolean(initialForm?.noChangesVerified)
  );
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceMemberId, setInsuranceMemberId] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    () => [...(initialForm?.conditions || [])]
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    () => [...(initialForm?.allergies || [])]
  );
  const [medications, setMedications] = useState(() => initialForm?.medications || "");
  const [signedByName, setSignedByName] = useState(
    () => initialForm?.signedByName || patientDisplayName
  );
  const [consentSigned, setConsentSigned] = useState(
    () => Boolean(initialForm?.consentSigned)
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(
    () => initialForm?.updatedAt || null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Wizard State
  const [step, setStep] = useState<IntakeStep>(1);
  // A previously signed form unlocks every step so returning patients can jump straight to review.
  const [furthestStep, setFurthestStep] = useState<IntakeStep>(() => (initialForm?.consentSigned ? 3 : 1));
  const stepPrevRef = useRef<IntakeStep>(step);

  // Move focus to the new step heading and scroll it into view (skips the initial mount).
  useEffect(() => {
    if (stepPrevRef.current === step) return;
    stepPrevRef.current = step;
    const heading = document.getElementById(`intake-step-${step}-title`);
    if (!heading) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [step]);

  const phoneAndContactValid = Boolean(phone.trim() && emergencyContact.trim());
  const medicalAnswered =
    noChangesVerified ||
    selectedConditions.length > 0 ||
    selectedAllergies.length > 0 ||
    Boolean(medications.trim());

  // Dynamic progress calculation
  const progressPercent = useMemo(() => {
    let score = 0;
    // Section 1: Phone & Emergency contact
    if (phone.trim() && emergencyContact.trim()) {
      score += 33;
    }
    // Section 2: Medical conditions & Allergies reviewed (even if none, interaction or verified)
    if (noChangesVerified || selectedConditions.length > 0 || selectedAllergies.length > 0 || medications.trim()) {
      score += 33;
    }
    // Section 3: Consent confirmation
    if (consentSigned || signedByName.trim()) {
      score += 34;
    }
    return Math.min(100, score);
  }, [phone, emergencyContact, noChangesVerified, selectedConditions, selectedAllergies, medications, consentSigned, signedByName]);

  const goToStep = (target: IntakeStep) => {
    setValidationError(null);
    setStep(target);
  };

  // Continue: validates the current step before advancing
  const handleContinue = () => {
    if (step === 1 && !phoneAndContactValid) {
      setValidationError(
        locale === "ar"
          ? "يرجى إدخال رقم الهاتف الأساسي وجهة اتصال الطوارئ للمتابعة."
          : "Please enter your primary phone and emergency contact to continue."
      );
      return;
    }
    if (step === 2 && !medicalAnswered) {
      setValidationError(
        locale === "ar"
          ? "يرجى الإجابة عن سؤال واحد على الأقل حول التاريخ الطبي أو تأكيد عدم وجود تغييرات للمتابعة."
          : "Answer at least one medical history question or confirm there are no changes to continue."
      );
      return;
    }
    const next: IntakeStep = step === 1 ? 2 : 3;
    setFurthestStep((prev) => (next > prev ? next : prev));
    goToStep(next);
  };

  // Toggle condition
  const handleToggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
    setSaveSuccess(false);
  };

  // Toggle allergy
  const handleToggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
    setSaveSuccess(false);
  };

  // Quick toggle returning patient
  const handleNoChangesToggle = (checked: boolean) => {
    setNoChangesVerified(checked);
    if (checked) {
      if (selectedConditions.length === 0) {
        setSelectedConditions([NONE_REPORTED]);
      }
      if (selectedAllergies.length === 0) {
        setSelectedAllergies([NO_KNOWN_ALLERGIES]);
      }
      if (!medications) {
        setMedications(NONE_REPORTED);
      }
    } else {
      // Drop placeholder values so the editable controls start clean.
      setSelectedConditions((prev) => prev.filter((c) => c !== NONE_REPORTED));
      setSelectedAllergies((prev) => prev.filter((a) => a !== NO_KNOWN_ALLERGIES));
      setMedications((prev) => (prev === NONE_REPORTED ? "" : prev));
    }
    setSaveSuccess(false);
  };

  // Submit Handler
  const handleSave = async () => {
    setValidationError(null);

    if (!signedByName.trim()) {
      setValidationError("Please enter your legal name to confirm the intake form.");
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: PatientIntakeForm = {
        patientEmail,
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
        noChangesVerified,
        insuranceScaffold: {
          enabled: false,
          providerPlaceholder: insuranceProvider.trim() || "Direct Billing Scaffold (Optional)",
          memberIdPlaceholder: insuranceMemberId.trim() || "ID-00000",
        },
        conditions: selectedConditions.length > 0 ? selectedConditions : [NONE_REPORTED],
        allergies: selectedAllergies.length > 0 ? selectedAllergies : [NO_KNOWN_ALLERGIES],
        medications: medications.trim() || NONE_REPORTED,
        consentSigned: true,
        signedByName: signedByName.trim(),
        updatedAt: now,
      };

      await clinic.savePatientIntakeForm(payload);
      setConsentSigned(true);
      setUpdatedAt(now);
      setSaveSuccess(true);
    } catch {
      setValidationError("Failed to save intake form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasMedicalAlert = selectedAllergies.filter((a) => a !== NO_KNOWN_ALLERGIES).length > 0 ||
    selectedConditions.filter((c) => c !== NONE_REPORTED).length > 0;

  const validationAlert = validationError ? (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Validation Notice</AlertTitle>
      <AlertDescription className="text-xs">{validationError}</AlertDescription>
    </Alert>
  ) : null;

  const backButton = (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => goToStep((step - 1) as IntakeStep)}
      className="min-h-11 gap-2 font-semibold"
    >
      <ArrowLeft className="size-4 rtl:rotate-180" />
      {locale === "ar" ? "رجوع" : "Back"}
    </Button>
  );

  const continueButton = (
    <Button
      type="button"
      variant="accent"
      size="lg"
      onClick={handleContinue}
      className="min-h-11 gap-2 font-semibold"
    >
      {locale === "ar" ? "متابعة" : "Continue"}
      <ArrowRight className="size-4 rtl:rotate-180" />
    </Button>
  );

  const renderSummaryBadges = (items: string[]) => {
    const visible = items.filter((item) => item !== NONE_REPORTED && item !== NO_KNOWN_ALLERGIES);
    if (items.length === 0 || visible.length === 0) {
      return <span className="text-muted-foreground">{items[0] ?? "—"}</span>;
    }
    return visible.map((item) => (
      <Badge key={item} variant="secondary" className="text-xs font-normal">
        {item}
      </Badge>
    ));
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header & Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t.patient.intake.title}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t.patient.intake.subtitle}
            </p>
          </div>
          {updatedAt && (
            <Badge variant="outline" className="text-xs">
              {t.patient.intake.updatedAt.replace(
                "{date}",
                formatDate(updatedAt.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-foreground">
                Pre-Visit Intake Progress — Est. 3 mins
              </span>
              <span className="font-medium text-brand-primary">
                {progressPercent}% Complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2.5 w-full bg-muted" />
            <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0 pt-1 text-center text-xs text-muted-foreground">
              {STEP_LABELS.map(({ step: n, label }) => {
                const isCurrent = n === step;
                const isDone = n < step;
                const isReachable = n <= furthestStep;
                const canNavigate = isReachable && !isCurrent;
                const stepClass = cn(
                  "flex min-h-11 w-full items-center justify-center gap-1 rounded-lg px-1 py-2 leading-tight",
                  isCurrent && "font-semibold text-brand-primary",
                  isDone && "font-medium text-foreground",
                  canNavigate && "cursor-pointer transition-colors hover:bg-muted"
                );
                const content = (
                  <>
                    {isDone && <CheckCircle2 className="size-3.5 shrink-0 text-brand-primary" />}
                    <span>{label}</span>
                  </>
                );
                return (
                  <li key={n}>
                    {canNavigate ? (
                      <button
                        type="button"
                        onClick={() => goToStep(n)}
                        className={cn(stepClass, "outline-none focus-visible:ring-2 focus-visible:ring-ring")}
                      >
                        {content}
                      </button>
                    ) : (
                      <span aria-current={isCurrent ? "step" : undefined} className={stepClass}>
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Save Confirmation Banner */}
      {saveSuccess && (
        <Alert className="border-border bg-brand-subtle text-foreground shadow-xs">
          <CheckCircle2 className="size-5 text-brand-primary" />
          <AlertTitle className="font-semibold text-foreground">
            All Forms Complete ✅ — Synced to Doctor Dashboard & Locked in Chart
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
            {t.patient.intake.savedSuccess} Your clinician will review your medical history and signed e-consent prior to your visit.
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Contact & Insurance Scaffold */}
      {step === 1 && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-brand-primary">
                <User className="size-4" />
              </div>
              <div>
                <CardTitle
                  id="intake-step-1-title"
                  tabIndex={-1}
                  className="scroll-mt-24 text-base sm:text-lg"
                >
                  Step 1: {t.patient.intake.personalInfo}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Verify your contact numbers and emergency notification information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Full Name</Label>
                <Input
                  id="patient-name"
                  value={patientDisplayName}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-email">Email Address</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={patientEmail}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Primary Phone</Label>
                <Input
                  id="patient-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSaveSuccess(false);
                  }}
                  placeholder="+20 10 1234 5678"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-contact">
                  {t.patient.intake.emergencyContact}
                </Label>
                <Input
                  id="emergency-contact"
                  value={emergencyContact}
                  onChange={(e) => {
                    setEmergencyContact(e.target.value);
                    setSaveSuccess(false);
                  }}
                  placeholder="Name & Contact (+20 10 ...)"
                  className="bg-background"
                />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Insurance Scaffold */}
            <div className="space-y-3 rounded-xl bg-brand-subtle/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-brand-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {t.patient.intake.insuranceNotice}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Scaffold Ready — Coming Soon
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.patient.intake.insurancePlaceholder}
              </p>
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-provider" className="text-xs text-muted-foreground">
                    {t.patient.intake.provider}
                  </Label>
                  <Input
                    id="insurance-provider"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. AXA, MetLife, Bupa"
                    className="bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-member-id" className="text-xs text-muted-foreground">
                    {t.patient.intake.memberId}
                  </Label>
                  <Input
                    id="insurance-member-id"
                    value={insuranceMemberId}
                    onChange={(e) => setInsuranceMemberId(e.target.value)}
                    placeholder="e.g. POL-99283-EG"
                    className="bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            {validationAlert}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <span />
            {continueButton}
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Medical History & Allergies */}
      {step === 2 && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-brand-primary">
                <HeartPulse className="size-4" />
              </div>
              <div>
                <CardTitle
                  id="intake-step-2-title"
                  tabIndex={-1}
                  className="scroll-mt-24 text-base sm:text-lg"
                >
                  Step 2: {t.patient.intake.medicalConditions} & {t.patient.intake.allergies}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Select any applicable medical conditions and known medication or material allergies.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* No-changes shortcut */}
            <div className="flex items-start justify-between gap-4 rounded-xl bg-muted/40 p-3 sm:p-4">
              <div className="space-y-1">
                <Label htmlFor="no-changes-toggle" className="text-xs sm:text-sm font-medium leading-none cursor-pointer">
                  {t.patient.intake.noChanges}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Returning patient shortcut to quickly certify prior records.
                </p>
              </div>
              <Switch
                id="no-changes-toggle"
                checked={noChangesVerified}
                onCheckedChange={handleNoChangesToggle}
                aria-label={t.patient.intake.noChanges}
              />
            </div>

            {/* Medical Alert Live Banner */}
            {hasMedicalAlert && (
              <Alert className="border-border bg-destructive/10 text-foreground shadow-xs">
                <ShieldAlert className="size-5 text-destructive" />
                <AlertTitle className="font-semibold text-destructive">
                  ⚠️ Medical Alert will be highlighted on your Dentist&apos;s chart
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                  Your clinical team will take special precautions for:{" "}
                  <strong className="text-foreground">
                    {[...selectedAllergies, ...selectedConditions]
                      .filter((item) => item !== NO_KNOWN_ALLERGIES && item !== NONE_REPORTED)
                      .join(", ")}
                  </strong>
                  .
                </AlertDescription>
              </Alert>
            )}

            {noChangesVerified ? (
              /* Read-only summary while the shortcut is on */
              <div className="space-y-4 rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    {locale === "ar" ? "ملخص السجل الحالي" : "Current record summary"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNoChangesToggle(false)}
                    className="min-h-11 font-medium"
                  >
                    {locale === "ar" ? "تعديل" : "Edit"}
                  </Button>
                </div>
                <dl className="grid gap-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <dt className="font-medium text-muted-foreground">{t.patient.intake.medicalConditions}</dt>
                    <dd className="flex flex-wrap gap-1.5 text-foreground">{renderSummaryBadges(selectedConditions)}</dd>
                  </div>
                  <div className="space-y-1.5">
                    <dt className="font-medium text-muted-foreground">{t.patient.intake.allergies}</dt>
                    <dd className="flex flex-wrap gap-1.5 text-foreground">{renderSummaryBadges(selectedAllergies)}</dd>
                  </div>
                  <div className="space-y-1.5">
                    <dt className="font-medium text-muted-foreground">{t.patient.intake.medications}</dt>
                    <dd className="text-foreground">{medications.trim() || "—"}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <>
                {/* Medical Conditions Multi-Select */}
                <div className="space-y-3">
                  <Label className="text-xs sm:text-sm font-medium text-foreground">
                    {t.patient.intake.medicalConditions}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {MEDICAL_CONDITIONS.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleToggleCondition(cond)}
                          aria-pressed={isSelected}
                          className={cn(
                            "min-h-11 min-w-11 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          )}
                        >
                          {isSelected ? <CheckCircle2 className="size-4 shrink-0" /> : <div className="size-4 shrink-0 rounded-full border border-current opacity-40" />}
                          <span>{cond}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Allergies Multi-Select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-medium text-foreground">
                      {t.patient.intake.allergies} (Triggers Clinical Alert)
                    </Label>
                    <Badge variant="outline" className="text-[11px] text-destructive">
                      High Priority
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES_LIST.map((allergy) => {
                      const isSelected = selectedAllergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => handleToggleAllergy(allergy)}
                          aria-pressed={isSelected}
                          className={cn(
                            "min-h-11 min-w-11 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "border-destructive bg-destructive text-primary-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          )}
                        >
                          {isSelected ? <ShieldAlert className="size-4 shrink-0" /> : <div className="size-4 shrink-0 rounded-full border border-current opacity-40" />}
                          <span>{allergy}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Medications Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Pill className="size-4 text-brand-primary" />
                    <Label htmlFor="medications-input" className="text-xs sm:text-sm font-medium">
                      {t.patient.intake.medications}
                    </Label>
                  </div>
                  <Textarea
                    id="medications-input"
                    value={medications}
                    onChange={(e) => {
                      setMedications(e.target.value);
                      setSaveSuccess(false);
                    }}
                    placeholder={t.patient.intake.medicationsPlaceholder}
                    rows={3}
                    className="resize-none bg-background text-xs sm:text-sm"
                  />
                </div>
              </>
            )}

            {validationAlert}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {backButton}
            {continueButton}
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Digital e-Consent & Signature */}
      {step === 3 && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-brand-primary">
                <Lock className="size-4" />
              </div>
              <div>
                <CardTitle
                  id="intake-step-3-title"
                  tabIndex={-1}
                  className="scroll-mt-24 text-base sm:text-lg"
                >
                  Step 3: {t.patient.intake.consentTitle}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Review the informed clinical agreement and provide your legal confirmation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plain language consent box */}
            <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <FileCheck2 className="size-4 text-brand-primary" />
                <span>Informed Dental Procedure &amp; Diagnostic Privacy Agreement</span>
              </div>
              <p>{t.patient.intake.consentBody}</p>
              <p className="text-[11px] text-muted-foreground">
                By typing your legal name below and saving, you acknowledge having reviewed this consent and confirm that the medical history provided above is accurate and complete to the best of your knowledge.
              </p>
            </div>

            {/* Legal name input */}
            <div className="space-y-2">
              <Label htmlFor="legal-name" className="text-xs sm:text-sm font-medium">
                {t.patient.intake.signedBy} *
              </Label>
              <Input
                id="legal-name"
                value={signedByName}
                onChange={(e) => {
                  setSignedByName(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="e.g. Mariam Ahmed"
                className="max-w-md bg-background"
              />
            </div>

            {validationAlert}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4 text-brand-primary shrink-0" />
              <span>Synced automatically with the clinic&apos;s doctor workstation.</span>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {backButton}
              <Button
                type="button"
                variant="accent"
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto font-semibold"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4 animate-spin" />
                    Saving Intake Form...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="size-4" />
                    {t.patient.intake.save}
                  </span>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
