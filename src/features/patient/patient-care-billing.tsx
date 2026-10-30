"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  Pill,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { useSession } from "@/data/use-session";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { PatientInvoice, VisitCareSummary } from "@/data/mock/catalog";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Separator } from "@/components/ui/separator";

const defaultDateOpts: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};

const shortDateOpts: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

// ============================================================================
// Workflow #5: Part A — PatientCareView
// ============================================================================

export function PatientCareView() {
  const session = useSession();
  const { signedInEmail, name } = session;
  const clinic = useClinic();
  const { locale, formatDate, t } = useI18n();

  const patientEmail = signedInEmail || "mariam.a@example.com";
  const patientDisplayName = name || "Mariam Ahmed";

  const visitSummaries = clinic.getPatientVisitSummaries(patientEmail);

  // Active visit selected for printable e-Prescription modal
  const [activePrescriptionVisit, setActivePrescriptionVisit] = useState<VisitCareSummary | null>(null);

  // Interactive recovery checklist tracking
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});

  const toggleRule = (ruleKey: string) => {
    setCheckedRules((prev) => ({ ...prev, [ruleKey]: !prev[ruleKey] }));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.patient.care.title}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t.patient.care.subtitle}
        </p>
      </div>

      {visitSummaries.length === 0 ? (
        <Card className="border-border bg-card p-8 text-center text-muted-foreground">
          <Stethoscope className="mx-auto size-10 text-brand-primary opacity-60 mb-3" />
          <p className="text-base font-semibold text-foreground">No Visit Summaries On File</p>
          <p className="text-xs sm:text-sm mt-1">
            Clinical summaries and doctor post-op recovery notes appear here immediately following your appointments.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {visitSummaries.map((visit) => {
            const doctor = clinic.doctors.find((d) => d.id === visit.doctorId);
            const doctorName = doctor ? localizedDoctor(doctor, locale).name : "Dr. Clinician";
            const doctorSpecialty = doctor ? localizedDoctor(doctor, locale).specialty : "General Dentistry";
            const service = clinic.services.find((s) => s.id === visit.serviceId);
            const serviceTitle = service ? localizedService(service, locale).title : "Comprehensive Clinical Visit";

            const hasPrescriptions = visit.prescriptions && visit.prescriptions.length > 0;

            return (
              <Card key={visit.id} className="border-border bg-card shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold">
                          Visit Summary #{visit.id.slice(-6).toUpperCase()}
                        </Badge>
                        <Badge variant="success" className="text-xs">
                          Completed Visit ✓
                        </Badge>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold pt-1">
                        {serviceTitle}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          {formatDate(visit.visitDate, defaultDateOpts)}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-foreground">
                          {t.patient.care.doctorSigned.replace("{name}", `${doctorName} (${doctorSpecialty})`)}
                        </span>
                      </CardDescription>
                    </div>

                    {hasPrescriptions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePrescriptionVisit(visit)}
                        className="font-medium"
                      >
                        <Printer className="size-3.5 mr-1.5" />
                        {t.patient.care.printSummary}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-5">
                  {/* What Was Done */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="size-4 text-brand-primary" />
                      <span>{t.patient.care.whatWasDone}</span>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 text-xs sm:text-sm leading-relaxed text-foreground">
                      {visit.whatWasDone}
                    </div>
                  </div>

                  <Separator />

                  {/* Post-Op Instructions Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ShieldCheck className="size-4 text-brand-primary" />
                        <span>{t.patient.care.postOpRules}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Click rule to check off during recovery
                      </span>
                    </div>

                    <div className="space-y-2">
                      {visit.postOpInstructions.map((rule, idx) => {
                        const ruleKey = `${visit.id}-rule-${idx}`;
                        const isChecked = Boolean(checkedRules[ruleKey]);

                        return (
                          <button
                            key={ruleKey}
                            type="button"
                            onClick={() => toggleRule(ruleKey)}
                            className={cn(
                              "w-full text-left flex items-start gap-3 rounded-lg p-3 text-xs sm:text-sm transition-colors cursor-pointer",
                              isChecked
                                ? "bg-muted/20 text-muted-foreground line-through"
                                : "bg-muted/40 text-foreground hover:bg-muted/70"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-md border mt-0.5",
                                isChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background"
                              )}
                            >
                              {isChecked && <Check className="size-3.5" />}
                            </div>
                            <span className="leading-snug">{rule}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* e-Prescriptions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Pill className="size-4 text-brand-primary" />
                        <span>{t.patient.care.prescriptions}</span>
                      </div>
                      {hasPrescriptions && (
                        <Badge variant="secondary" className="text-xs">
                          {visit.prescriptions.length} Active Rx
                        </Badge>
                      )}
                    </div>

                    {hasPrescriptions ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {visit.prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="rounded-xl bg-muted/40 p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-foreground">
                                {rx.medication}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {t.patient.care.duration.replace("{days}", String(rx.durationDays))}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p className="text-foreground">
                                <strong>{t.patient.care.dosage.replace("{dosage}", rx.dosage)}</strong> •{" "}
                                {t.patient.care.frequency.replace("{frequency}", rx.frequency)}
                              </p>
                              <p className="italic text-muted-foreground pt-0.5">
                                {t.patient.care.instructions.replace("{instructions}", rx.instructions)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                        No prescription medications were required for this visit.
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/20 border-t border-border py-3 px-6 flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Chart signed &amp; archived in clinic repository
                  </span>
                  {hasPrescriptions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePrescriptionVisit(visit)}
                      className="text-xs font-semibold text-brand-primary hover:text-brand-hover"
                    >
                      Print e-Prescription →
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Printable Clinical Prescription Dialog */}
      <Dialog
        open={Boolean(activePrescriptionVisit)}
        onOpenChange={(open) => !open && setActivePrescriptionVisit(null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden min-w-0 w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="size-5 text-brand-primary" />
              Official Clinical e-Prescription
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Digitally validated prescription signed by your attending dental specialist.
            </DialogDescription>
          </DialogHeader>

          {activePrescriptionVisit && (
            <div className="space-y-5 py-2 min-w-0">
              {/* Clinic Letterhead */}
              <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between items-start gap-2 min-w-0">
                <div>
                  <h3 className="font-bold text-base text-foreground tracking-tight">
                    BlueHaven Dental Clinic
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Oral Health &amp; Specialized Dental Surgery
                  </p>
                  <p className="text-[11px] text-muted-foreground break-words">
                    Synapsys Office, Makram Ebeid, Nasr City, Cairo • Tel: +20 2 2270 9988
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono shrink-0">
                  RX-{activePrescriptionVisit.id.slice(-6).toUpperCase()}
                </Badge>
              </div>

              {/* Patient & Doctor metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Patient Name:</span>
                  <span className="font-semibold text-foreground">{patientDisplayName}</span>
                  <span className="text-[11px] text-muted-foreground block">{patientEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Attending Doctor:</span>
                  <span className="font-semibold text-foreground">
                    {clinic.doctors.find((d) => d.id === activePrescriptionVisit.doctorId)?.name || "Dr. Clinician"}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Issue Date: {formatDate(activePrescriptionVisit.visitDate, shortDateOpts)}
                  </span>
                </div>
              </div>

              {/* Rx Items Table */}
              <div className="space-y-2 min-w-0">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span className="text-brand-primary font-serif italic text-base">℞</span>
                  Prescribed Formulations:
                </span>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal">Medication</TableHead>
                      <TableHead className="whitespace-normal">Dosage</TableHead>
                      <TableHead className="whitespace-normal">Frequency</TableHead>
                      <TableHead className="whitespace-nowrap">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePrescriptionVisit.prescriptions.map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-medium text-foreground whitespace-normal break-words align-top min-w-[130px]">
                          <div>
                            <span className="font-semibold">{rx.medication}</span>
                            <span className="block text-[11px] text-muted-foreground italic break-words">
                              {rx.instructions}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal break-words align-top">{rx.dosage}</TableCell>
                        <TableCell className="whitespace-normal break-words align-top">{rx.frequency}</TableCell>
                        <TableCell className="whitespace-nowrap align-top">{rx.durationDays} days</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Digital Signature & Seal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-border text-xs min-w-0">
                <div className="text-muted-foreground space-y-0.5 break-words">
                  <span className="font-semibold text-foreground block">Clinician Verification:</span>
                  <span className="break-words">Licensed by Ministry of Health &amp; Dental Syndicate</span>
                  <span className="block text-[10px] font-mono break-all">Verification Hash: 8F2A-09C3-DENTAL-VALID</span>
                </div>
                <div className="shrink-0 sm:text-right">
                  <Badge variant="success" className="text-xs">
                    Digital Seal Valid ✓
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActivePrescriptionVisit(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handlePrint}
              className="font-semibold"
            >
              <Printer className="size-4 mr-1.5" />
              Print e-Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Workflow #5: Part B — PatientBillingView
// ============================================================================

export function PatientBillingView() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl p-6 text-sm text-muted-foreground animate-pulse">
          Loading billing records and invoices...
        </div>
      }
    >
      <PatientBillingViewContent />
    </Suspense>
  );
}

function PatientBillingViewContent() {
  const session = useSession();
  const { signedInEmail, name } = session;
  const clinic = useClinic();
  const { locale, formatDate, t } = useI18n();
  const searchParams = useSearchParams();

  const patientEmail = signedInEmail || "mariam.a@example.com";
  const patientDisplayName = name || "Mariam Ahmed";

  const invoices = clinic.getPatientInvoices(patientEmail);

  // Auto-open pay modal if query param ?pay=1 is present
  const defaultPayableInvoice = useMemo(() => {
    return invoices.find((inv) => inv.status === "balance_due") || invoices[0];
  }, [invoices]);

  // Checkout modal state (auto-opens if ?pay=1 is present)
  const [checkoutInvoice, setCheckoutInvoice] = useState<PatientInvoice | null>(() => {
    if (searchParams.get("pay") === "1" && defaultPayableInvoice?.status === "balance_due") {
      return defaultPayableInvoice;
    }
    return null;
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_wallet">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Mock checkout input state
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("789");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("+20 10 1234 5678");

  // Official receipt modal state
  const [receiptInvoice, setReceiptInvoice] = useState<PatientInvoice | null>(null);

  // Summary KPIs
  const kpis = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalFeeEgp, 0);
    const paidToDate = invoices.reduce((sum, inv) => sum + inv.paidAmountEgp, 0);
    const remainingBalance = invoices.reduce((sum, inv) => sum + inv.balanceEgp, 0);
    const nextInstallment = invoices.find((inv) => inv.nextInstallmentDate)?.nextInstallmentDate;

    return {
      totalBilled,
      paidToDate,
      remainingBalance,
      nextInstallment,
    };
  }, [invoices]);

  // Handle Checkout submission
  const handleCompletePayment = async () => {
    if (!checkoutInvoice) return;

    setIsProcessingPayment(true);
    try {
      const updated = await clinic.payPatientInvoice(checkoutInvoice.id, paymentMethod, patientEmail);
      setCheckoutInvoice(null);
      setReceiptInvoice(updated);
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.patient.billing.title}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t.patient.billing.subtitle}
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Billed */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Total Billed
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {kpis.totalBilled} EGP
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All clinical services to date
            </p>
          </CardContent>
        </Card>

        {/* Paid to Date */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Paid to Date
            </span>
            <div className="text-2xl font-bold text-brand-primary mt-1">
              {kpis.paidToDate} EGP
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified received receipts
            </p>
          </CardContent>
        </Card>

        {/* Balance Due */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Remaining Balance Due
            </span>
            <div className={cn("text-2xl font-bold mt-1", kpis.remainingBalance > 0 ? "text-destructive" : "text-foreground")}>
              {kpis.remainingBalance} EGP
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.remainingBalance > 0 ? "Payment pending" : "All accounts current ✓"}
            </p>
          </CardContent>
        </Card>

        {/* Next Installment */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Next Installment Date
            </span>
            <div className="text-lg font-bold text-foreground mt-1 truncate">
              {kpis.nextInstallment ? formatDate(kpis.nextInstallment, shortDateOpts) : "None Due"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Phased treatment plan billing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">
          Itemized Dental Invoices
        </h2>

        {invoices.map((inv) => {
          const isPaid = inv.status === "paid";
          const doctor = clinic.doctors.find((d) => d.id === inv.doctorId);
          const doctorName = doctor ? localizedDoctor(doctor, locale).name : "Dr. Clinician";

          return (
            <Card key={inv.id} className="border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-foreground">
                        {t.patient.billing.invoiceNumber.replace("{id}", inv.id.replace("inv-", "").toUpperCase())}
                      </span>
                      {isPaid ? (
                        <Badge variant="success" className="text-xs font-semibold">
                          {t.patient.billing.statusPaid} ✓
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs font-semibold">
                          {t.patient.billing.statusBalanceDue} ({inv.balanceEgp} EGP)
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        {t.patient.billing.issuedOn.replace("{date}", formatDate(inv.issuedDate, shortDateOpts))}
                      </span>
                      <span>•</span>
                      <span>Attending: {doctorName}</span>
                      {inv.receiptNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-brand-primary">
                            Receipt: {inv.receiptNumber}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiptInvoice(inv)}
                        className="font-medium"
                      >
                        <Receipt className="size-3.5 mr-1.5" />
                        {t.patient.billing.downloadReceipt}
                      </Button>
                    ) : (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setCheckoutInvoice(inv)}
                        className="font-semibold"
                      >
                        <CreditCard className="size-3.5 mr-1.5" />
                        Pay Now ({inv.balanceEgp} EGP)
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.patient.billing.itemDescription}</TableHead>
                      <TableHead className="w-[120px]">{t.patient.billing.itemTooth}</TableHead>
                      <TableHead className="text-right w-[150px]">{t.patient.billing.itemFee}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">
                          {item.procedure}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.tooth || "General Arch"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {item.feeEgp} EGP
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="font-semibold text-foreground">
                        {t.patient.billing.total}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {inv.totalFeeEgp} EGP
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">
                        {t.patient.billing.paid}
                      </TableCell>
                      <TableCell className="text-right text-brand-primary font-medium">
                        {inv.paidAmountEgp} EGP
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold text-foreground">
                        {t.patient.billing.balanceDue}
                      </TableCell>
                      <TableCell className={cn("text-right font-bold text-base", inv.balanceEgp > 0 ? "text-destructive" : "text-brand-primary")}>
                        {inv.balanceEgp} EGP
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>

                {inv.nextInstallmentDate && inv.balanceEgp > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Calendar className="size-4 text-brand-primary shrink-0" />
                    <span>
                      {t.patient.billing.installmentNote.replace(
                        "{date}",
                        formatDate(inv.nextInstallmentDate, shortDateOpts)
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pay Now Checkout Dialog */}
      <Dialog
        open={Boolean(checkoutInvoice)}
        onOpenChange={(open) => !open && setCheckoutInvoice(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-brand-primary" />
              Secure Online Checkout
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Complete payment for Invoice #{checkoutInvoice?.id.replace("inv-", "").toUpperCase()}.
            </DialogDescription>
          </DialogHeader>

          {checkoutInvoice && (
            <div className="space-y-5 py-2">
              {/* Balance Summary Box */}
              <div className="flex items-center justify-between rounded-xl bg-brand-subtle p-4">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Amount Outstanding:
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {checkoutInvoice.balanceEgp} EGP
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Instant Settlement
                </Badge>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <Label className="text-xs sm:text-sm font-semibold">
                  Select Payment Method
                </Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as typeof paymentMethod)}
                  className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                >
                  {/* Credit / Debit Card */}
                  <label
                    htmlFor="pay-card"
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 text-xs sm:text-sm cursor-pointer transition-colors",
                      paymentMethod === "card"
                        ? "bg-primary/5 ring-2 ring-primary font-semibold text-foreground"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    <RadioGroupItem value="card" id="pay-card" />
                    <CreditCard className="size-4 shrink-0 text-brand-primary" />
                    <span>Credit / Debit Card</span>
                  </label>

                  {/* Local Mobile Wallet */}
                  <label
                    htmlFor="pay-wallet"
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 text-xs sm:text-sm cursor-pointer transition-colors",
                      paymentMethod === "mobile_wallet"
                        ? "bg-primary/5 ring-2 ring-primary font-semibold text-foreground"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    <RadioGroupItem value="mobile_wallet" id="pay-wallet" />
                    <Wallet className="size-4 shrink-0 text-brand-primary" />
                    <span>InstaPay / Vodafone</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Dynamic Mock Inputs */}
              {paymentMethod === "card" && (
                <div className="space-y-3 rounded-xl bg-muted/20 p-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-card" className="text-xs">Card Number</Label>
                    <Input
                      id="checkout-card"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• 4242"
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-expiry" className="text-xs">Expiry</Label>
                      <Input
                        id="checkout-expiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-cvv" className="text-xs">CVV</Label>
                      <Input
                        id="checkout-cvv"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        type="password"
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "mobile_wallet" && (
                <div className="space-y-2 rounded-xl bg-muted/20 p-4">
                  <Label htmlFor="checkout-mobile" className="text-xs">
                    Registered Mobile Wallet Number (Vodafone Cash / InstaPay)
                  </Label>
                  <Input
                    id="checkout-mobile"
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    placeholder="+20 10 1234 5678"
                    className="bg-background text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    A secure payment prompt request will be transmitted directly to your mobile wallet app.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-4 text-brand-primary shrink-0" />
                <span>256-bit TLS encrypted transaction processed via Central Bank of Egypt sandbox gateway.</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCheckoutInvoice(null)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleCompletePayment}
              disabled={isProcessingPayment}
              className="font-semibold"
            >
              {isProcessingPayment ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Complete Payment (${checkoutInvoice?.balanceEgp} EGP)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Payment Receipt Modal */}
      <Dialog
        open={Boolean(receiptInvoice)}
        onOpenChange={(open) => !open && setReceiptInvoice(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-brand-primary" />
              {t.patient.billing.paymentSuccess}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {receiptInvoice && t.patient.billing.receipt.replace("{number}", receiptInvoice.receiptNumber || "RCPT-DEMO")}
            </DialogDescription>
          </DialogHeader>

          {receiptInvoice && (
            <div className="space-y-4 py-2">
              {/* Receipt Clinic Header */}
              <div className="border-b border-border pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    BlueHaven Dental Clinic
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Commercial Registry #109843 • Tax ID #492-881
                  </p>
                </div>
                <Badge variant="success" className="text-xs">
                  PAID IN FULL ✓
                </Badge>
              </div>

              {/* Receipt Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Patient Name:</span>
                  <span className="font-semibold text-foreground">{patientDisplayName}</span>
                  <span className="text-[11px] text-muted-foreground block">{patientEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Settlement Details:</span>
                  <span className="font-semibold text-foreground">
                    Method: {receiptInvoice.paymentMethod?.toUpperCase() || "ONLINE"}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {formatDate(receiptInvoice.paidAt ? receiptInvoice.paidAt.slice(0, 10) : "2026-10-18", shortDateOpts)}
                  </span>
                </div>
              </div>

              {/* Itemized Paid Breakdown */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.procedure}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.feeEgp} EGP
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold text-foreground">
                      Total Paid Settlement
                    </TableCell>
                    <TableCell className="text-right font-bold text-brand-primary text-base">
                      {receiptInvoice.totalFeeEgp} EGP
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReceiptInvoice(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handlePrintReceipt}
              className="font-semibold"
            >
              <Printer className="size-4 mr-1.5" />
              Download / Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
