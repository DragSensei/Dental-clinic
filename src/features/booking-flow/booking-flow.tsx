"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Sparkles, Stethoscope, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/data/use-clinic";
import { useSession } from "@/data/use-session";
import {
  getAvailableDatesForAnyDoctor,
  getAvailableSlots,
  getAvailableSlotsForAnyDoctor,
} from "@/data/clinic-repository";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { Appointment, BookingDetails } from "@/data/mock/catalog";
import { errorKeyFrom } from "@/i18n/errors";
import { interpolate } from "@/i18n/format";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/locale-provider";
import { AlertErrorWithEverything } from "@/components/shared/alert-error";

function focusBelowStickyHeader(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: "start", behavior: "auto" });
}

function focusBookingStep(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({
    block: "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

export function BookingFallback() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-background p-6">
      <p role="status" className="mx-auto max-w-5xl text-muted-foreground">
        {t.booking.loading}
      </p>
    </main>
  );
}

type AnyDoctorSlot = { time: string; doctorId: string; doctorName: string };

const isValidName = (value: string) => value.trim().length > 0;
const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
const isValidPhone = (value: string) => /^[+0-9 ()-]{6,24}$/.test(value.trim());

export function BookingFlow() {
  const router = useRouter();
  const query = useSearchParams();
  const { appointments, services, doctors, accounts, bookAppointment } = useClinic();
  const { signedInEmail, name: sessionName, isLoggedIn } = useSession();
  const { locale, t } = useI18n();
  const steps = t.booking.steps;
  const requestedService = query.get("serviceId") || query.get("service") || "";
  const requestedDoctor = query.get("doctorId") || query.get("doctor") || "";
  const requestedDate = query.get("date") || "";
  const requestedTime = query.get("time") || "";
  const requestStep = query.get("step") ?? "0";
  const entryParamsRef = useRef({
    service: requestedService,
    doctor: requestedDoctor,
    date: requestedDate,
    time: requestedTime,
  });

  const [serviceId, setServiceId] = useState(() =>
    services.some((item) => item.id === requestedService) ? requestedService : (services[0]?.id ?? "")
  );
  const [doctorId, setDoctorId] = useState(() => {
    const resolvedServiceId = services.some((item) => item.id === requestedService)
      ? requestedService
      : (services[0]?.id ?? "");
    const doctor = doctors.find((item) => item.id === requestedDoctor);
    return doctor && (!resolvedServiceId || doctor.serviceIds.includes(resolvedServiceId))
      ? requestedDoctor
      : "";
  });
  const [date, setDate] = useState(requestedDate);
  const [time, setTime] = useState(requestedTime);
  const [contact, setContact] = useState({ patientName: "", email: "", phone: "" });
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<ErrorKey | "">("");
  const [highlightContactErrors, setHighlightContactErrors] = useState(false);
  const [pending, setPending] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slotResult, setSlotResult] = useState<{ key: string; slots: AnyDoctorSlot[] } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedStepRef = useRef(false);

  const service = services.find((item) => item.id === serviceId);
  const parsedStep = Number(requestStep);
  const step = Number.isInteger(parsedStep) && parsedStep >= 0 && parsedStep < steps.length ? parsedStep : 0;
  const selectedDate = useMemo(() => (availableDates.includes(date) ? date : ""), [availableDates, date]);
  const slotKey = `${serviceId}|${selectedDate}`;
  const anyDoctorSlots = useMemo(
    () => (slotResult?.key === slotKey ? slotResult.slots : []),
    [slotResult, slotKey]
  );
  const availableSlots = useMemo(() => anyDoctorSlots.map((slot) => slot.time), [anyDoctorSlots]);

  const resolvedDoctorId = useMemo(() => {
    if (!serviceId) return "";
    const currentDoctor = doctors.find((item) => item.id === doctorId);
    const matchesSelectedService = Boolean(currentDoctor && currentDoctor.serviceIds.includes(serviceId));
    if (
      matchesSelectedService &&
      (!selectedDate || !time || getAvailableSlots(serviceId, doctorId, selectedDate).includes(time))
    ) {
      return doctorId;
    }
    const slotMatch = anyDoctorSlots.find((slot) => slot.time === time);
    if (slotMatch) return slotMatch.doctorId;
    return doctors.find((item) => item.serviceIds.includes(serviceId))?.id ?? "";
  }, [serviceId, doctorId, doctors, selectedDate, time, anyDoctorSlots]);

  const doctor = doctors.find((item) => item.id === resolvedDoctorId);

  // When logged in via useSession(), auto-populate contact from the signed-in account
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (signedInEmail && !contact.email) {
        const matched = accounts.find((a) => a.email.toLowerCase() === signedInEmail.toLowerCase());
        setContact((prev) => ({
          patientName: prev.patientName || sessionName || matched?.name || "",
          email: prev.email || signedInEmail,
          phone: prev.phone || matched?.phone || "",
        }));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [signedInEmail, sessionName, accounts, contact.email]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const previous = entryParamsRef.current;
      const serviceChanged = requestedService !== previous.service;
      const doctorChanged = requestedDoctor !== previous.doctor;
      const dateChanged = requestedDate !== previous.date;
      const timeChanged = requestedTime !== previous.time;
      if (!serviceChanged && !doctorChanged && !dateChanged && !timeChanged) return;
      entryParamsRef.current = {
        service: requestedService,
        doctor: requestedDoctor,
        date: requestedDate,
        time: requestedTime,
      };

      let nextServiceId = serviceId;
      let nextDoctorId = doctorId;
      let nextDate = date;
      let nextTime = time;

      if (requestedService && (serviceChanged || !nextServiceId)) {
        if (services.some((item) => item.id === requestedService)) {
          nextServiceId = requestedService;
        }
      }

      if (doctorChanged && requestedDoctor) {
        nextDoctorId = doctors.some((item) => item.id === requestedDoctor) ? requestedDoctor : "";
      }

      const nextDoctor = doctors.find((item) => item.id === nextDoctorId);
      if (nextDoctor && nextServiceId && !nextDoctor.serviceIds.includes(nextServiceId)) {
        nextDoctorId = "";
      }

      if (dateChanged && requestedDate) nextDate = requestedDate;
      if (timeChanged && requestedTime) nextTime = requestedTime;

      if (
        nextServiceId !== serviceId ||
        nextDoctorId !== doctorId ||
        nextDate !== date ||
        nextTime !== time
      ) {
        setServiceId(nextServiceId);
        setDoctorId(nextDoctorId);
        setDate(nextDate);
        setTime(nextTime);
        setError("");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    requestedService,
    requestedDoctor,
    requestedDate,
    requestedTime,
    serviceId,
    doctorId,
    date,
    time,
    services,
    doctors,
  ]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!serviceId && services.length > 0) {
        setServiceId(services[0].id);
      } else if (serviceId && !services.some((item) => item.id === serviceId)) {
        setServiceId(services[0]?.id ?? "");
        setDoctorId("");
        setDate("");
        setTime("");
        setError("service_removed");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [serviceId, services]);

  const setStep = (next: number) => {
    const params = new URLSearchParams({ step: String(next) });
    if (serviceId) params.set("serviceId", serviceId);
    if (resolvedDoctorId) params.set("doctorId", resolvedDoctorId);
    if (selectedDate || date) params.set("date", selectedDate || date);
    if (time) params.set("time", time);
    router.push(`/book?${params.toString()}`, { scroll: false });
    setError("");
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (step === 4 && !appointment) {
        setStep(contact.patientName && contact.email && contact.phone ? 3 : 2);
      } else if (step > 0 && !service) {
        setStep(0);
      } else if (step > 1 && (!date || !time)) {
        setStep(1);
      } else if (step > 2 && (!contact.patientName || !contact.email || !contact.phone)) {
        setStep(2);
      }
    });
    return () => cancelAnimationFrame(frame);
    // The current URL is authoritative; selections stay in component memory on query navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!hasMountedStepRef.current) {
      hasMountedStepRef.current = true;
      return;
    }
    if (step === 4) return;
    const frame = requestAnimationFrame(() => focusBookingStep(headingRef.current));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (!serviceId) return;
    const frame = requestAnimationFrame(() => {
      const dates = getAvailableDatesForAnyDoctor(serviceId);
      setAvailableDates(dates);
      if (dates.length > 0 && (!date || !dates.includes(date))) {
        setDate(dates[0]);
        setTime("");
        setDoctorId("");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [serviceId, services, doctors, date]);

  useEffect(() => {
    if (!selectedDate || !serviceId) return;
    const key = slotKey;
    const frame = requestAnimationFrame(() => {
      setSlotResult({ key, slots: getAvailableSlotsForAnyDoctor(serviceId, selectedDate) });
    });
    return () => cancelAnimationFrame(frame);
  }, [appointments, services, doctors, selectedDate, serviceId, slotKey]);

  const retry = () => {
    if (
      error === "invalid_contact" ||
      !isValidName(contact.patientName) ||
      !isValidEmail(contact.email) ||
      !isValidPhone(contact.phone)
    ) {
      setHighlightContactErrors(true);
      setStep(2);
      return;
    }
    setError("");
    if (selectedDate && serviceId) {
      setSlotResult({ key: slotKey, slots: getAvailableSlotsForAnyDoctor(serviceId, selectedDate) });
    }
    focusBelowStickyHeader(headingRef.current);
  };

  const submit = async () => {
    if (!service || !resolvedDoctorId || !selectedDate || !time) return;
    setPending(true);
    setError("");
    const input: BookingDetails = {
      serviceId,
      doctorId: resolvedDoctorId,
      date: selectedDate,
      time,
      ...contact,
    };
    try {
      setAppointment(await bookAppointment(input));
      setStep(4);
    } catch (cause) {
      setError(errorKeyFrom(cause, "submit_failed"));
    } finally {
      setPending(false);
    }
  };

  if (step === 4 && appointment && service && doctor) {
    return (
      <Confirmation
        appointment={appointment}
        service={localizedService(service, locale).title}
        doctor={localizedDoctor(doctor, locale).name}
        onRestart={() => {
          setAppointment(null);
          setServiceId(services[0]?.id ?? "");
          setDoctorId("");
          setDate("");
          setTime("");
          setContact({ patientName: "", email: "", phone: "" });
          setHighlightContactErrors(false);
          setStep(0);
        }}
      />
    );
  }

  if (step === 4) {
    return (
      <main className="min-h-screen bg-background p-6">
        <p role="status" className="mx-auto max-w-5xl text-muted-foreground">
          {t.booking.returning}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-brand-primary">{t.booking.brandLine}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.booking.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{t.booking.lead}</p>
        </header>

        {/* Subtle Shortcut Banner when Logged In */}
        {isLoggedIn && (
          <aside
            aria-label="Signed-in Patient Shortcut"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <UserCheck className="size-4" />
              </span>
              <p className="text-sm text-foreground">
                <strong className="font-semibold">
                  {locale === "ar" ? "حساب مريض نشط:" : "Active Patient Portal:"}
                </strong>{" "}
                <span className="text-muted-foreground">
                  {locale === "ar"
                    ? `مرحبًا، ${sessionName || signedInEmail}. يمكنك إدارة مواعيدك مباشرة.`
                    : `Signed in as ${sessionName || signedInEmail}. You can manage appointments directly.`}
                </span>
              </p>
            </div>
            <Link
              href="/patient/appointments"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring"
            >
              {locale === "ar" ? "الانتقال لمواعيدي ←" : "Go to Patient Appointments →"}
            </Link>
          </aside>
        )}

        <BookingProgress step={step} onSelect={setStep} disabled={pending} />
        <section
          aria-labelledby="step-title"
          className={`mx-auto w-full rounded-3xl border border-border bg-card p-5 text-card-foreground ${
            step === 2 ? "max-w-xl sm:p-8" : "sm:p-9"
          }`}
        >
          <div className="mb-7">
            <p className="text-sm font-medium text-muted-foreground">
              {interpolate(t.booking.stepCounter, { step: step + 1 })}
            </p>
            <h2
              id="step-title"
              ref={headingRef}
              tabIndex={-1}
              className="mt-2 scroll-mt-24 text-2xl font-semibold tracking-tight outline-none sm:text-3xl"
            >
              {steps[step]}
            </h2>
          </div>
          <div key={step} className="booking-step-enter">
            {error && (
              <div className="mb-6">
                <AlertErrorWithEverything
                  title={locale === "ar" ? "تعذر إكمال الحجز" : "Booking Notice"}
                  description={t.errors[error]}
                  onRetry={retry}
                  retryLabel={t.booking.tryAgain}
                  onDismiss={() => setError("")}
                  dismissLabel={locale === "ar" ? "تجاهل" : "Dismiss"}
                />
              </div>
            )}
            {step === 0 && (
              <ServiceChoices
                services={services}
                selectedId={serviceId}
                onSelect={(id) => {
                  setServiceId(id);
                  setDoctorId("");
                  setDate("");
                  setTime("");
                  setError("");
                }}
              />
            )}
            {step === 1 && (
              <DateChoices
                dates={availableDates}
                slots={availableSlots}
                date={selectedDate}
                time={time}
                assignedDoctorName={doctor ? localizedDoctor(doctor, locale).name : ""}
                onDate={(value) => {
                  setDate(value);
                  setTime("");
                  setDoctorId("");
                }}
                onTime={(value) => {
                  const matched = anyDoctorSlots.find((s) => s.time === value);
                  setTime(value);
                  setDoctorId(matched?.doctorId ?? "");
                }}
              />
            )}
            {step === 2 && (
              <ContactFields
                contact={contact}
                highlightErrors={highlightContactErrors}
                onChange={setContact}
                onSubmit={() => {
                  setHighlightContactErrors(false);
                  setStep(3);
                }}
              />
            )}
            {step === 3 && service && doctor && (
              <Review
                service={localizedService(service, locale).title}
                doctor={localizedDoctor(doctor, locale).name}
                date={selectedDate}
                time={time}
                contact={contact}
              />
            )}
          </div>
          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={step === 0 || pending}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft aria-hidden="true" className="rtl:-scale-x-100" />
              {t.booking.back}
            </Button>
            {step < 2 && (
              <Button
                type="button"
                className="min-h-11"
                disabled={
                  (step === 0 && !service) ||
                  (step === 1 && (!service || !resolvedDoctorId || !selectedDate || !availableSlots.includes(time)))
                }
                onClick={() => setStep(step + 1)}
              >
                {t.booking.continue}
                <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" form="contact-details" className="min-h-11">
                {t.booking.continue}
                <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
              </Button>
            )}
            {step === 3 && (
              <Button
                type="button"
                className="min-h-11"
                disabled={pending || !resolvedDoctorId}
                onClick={() => void submit()}
              >
                {pending ? t.booking.submitting : t.booking.confirm}
                <Stethoscope aria-hidden="true" />
              </Button>
            )}
          </footer>
        </section>
        <p role="note" className="mt-5 text-center text-sm text-muted-foreground">
          {t.booking.simulationNote}
        </p>
      </div>
    </main>
  );
}

function BookingProgress({
  step,
  onSelect,
  disabled,
}: {
  step: number;
  onSelect: (step: number) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  const steps = t.booking.steps;
  return (
    <nav aria-label={t.booking.progressLabel} className="mb-8 overflow-x-auto">
      <ol
        className="flex min-w-max gap-2"
        aria-label={interpolate(t.booking.stepOfFive, { step: Math.min(step + 1, 4) })}
      >
        {steps.slice(0, 4).map((label, index) => (
          <li key={label} aria-current={step === index ? "step" : undefined}>
            {index < step ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(index)}
                aria-label={interpolate(t.booking.returnTo, { label })}
                className="flex min-h-11 items-center gap-2 rounded-full bg-muted px-3 text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="grid size-6 place-items-center rounded-full border border-current text-xs">
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ) : (
              <span
                className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${
                  step === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="grid size-6 place-items-center rounded-full border border-current text-xs">
                  {index + 1}
                </span>
                <span className={step === index ? "" : "hidden sm:inline"}>{label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ServiceChoices({
  services,
  selectedId,
  onSelect,
}: {
  services: ReturnType<typeof useClinic>["services"];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { locale, t } = useI18n();
  if (!services.length) {
    return (
      <p role="status" className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
        {t.booking.noServices}{" "}
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
        >
          {t.booking.browseServices}
        </Link>{" "}
        {t.booking.orReturnHome}
      </p>
    );
  }

  const [defaultService, ...otherServices] = services;
  const defaultCopy = localizedService(defaultService, locale);

  return (
    <div>
      <div className="rounded-2xl border-2 border-brand-primary/40 bg-brand-subtle/40 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-primary">
            <Sparkles aria-hidden="true" className="size-3.5" />
            {t.booking.generalSetupBadge}
          </span>
        </div>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">{t.booking.generalSetupHint}</p>
        <div className="grid">
          <Choice
            selected={selectedId === defaultService.id}
            onClick={() => onSelect(defaultService.id)}
            title={defaultCopy.title}
            detail={interpolate(t.booking.serviceDetail, {
              count: defaultService.durationMinutes,
              description: defaultCopy.description,
            })}
          />
        </div>
      </div>

      {otherServices.length > 0 && (
        <>
          <div className="my-6 border-t border-border" />
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.booking.otherTreatmentsLabel}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherServices.map((service) => {
              const copy = localizedService(service, locale);
              return (
                <Choice
                  key={service.id}
                  selected={selectedId === service.id}
                  onClick={() => onSelect(service.id)}
                  title={copy.title}
                  detail={interpolate(t.booking.serviceDetail, {
                    count: service.durationMinutes,
                    description: copy.description,
                  })}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DateChoices({
  dates,
  slots,
  date,
  time,
  assignedDoctorName,
  onDate,
  onTime,
}: {
  dates: string[];
  slots: string[];
  date: string;
  time: string;
  assignedDoctorName: string;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
}) {
  const { formatDate, formatTime, t } = useI18n();
  const prettyDate = (value: string) =>
    formatDate(value, { weekday: "long", month: "long", day: "numeric" });
  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-muted p-4 text-sm">
        <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-primary" />
        <p>{t.booking.dateNote}</p>
      </div>
      {!dates.length && (
        <p role="status" className="mb-5 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
          {t.booking.noDates}
        </p>
      )}
      <h3 className="mb-3 font-medium">{t.booking.chooseDate}</h3>
      <div className="flex flex-wrap gap-2">
        {dates.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={date === value}
            className={`min-h-11 rounded-xl border px-4 text-sm focus-visible:outline-2 focus-visible:outline-ring ${
              date === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            }`}
            onClick={() => onDate(value)}
          >
            {prettyDate(value)}
          </button>
        ))}
      </div>
      <h3 className="mb-3 mt-7 font-medium">{t.booking.chooseTime}</h3>
      {date ? (
        <>
          <div className="flex flex-wrap gap-2">
            {slots.length ? (
              slots.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={time === value}
                  className={`min-h-11 rounded-xl border px-4 text-sm focus-visible:outline-2 focus-visible:outline-ring ${
                    time === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                  }`}
                  onClick={() => onTime(value)}
                >
                  <Clock3 aria-hidden="true" className="me-2 inline size-4" />
                  {formatTime(value)}
                </button>
              ))
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {t.booking.noTimes}
              </p>
            )}
          </div>
          {time && assignedDoctorName && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <Stethoscope aria-hidden="true" className="size-4 text-brand-primary" />
              <span>{interpolate(t.booking.autoAssignedNote, { doctor: assignedDoctorName })}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t.booking.chooseDateFirst}</p>
      )}
    </div>
  );
}

function ContactFields({
  contact,
  highlightErrors = false,
  onChange,
  onSubmit,
}: {
  contact: { patientName: string; email: string; phone: string };
  highlightErrors?: boolean;
  onChange: (contact: { patientName: string; email: string; phone: string }) => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const update = (key: keyof typeof contact, value: string) => onChange({ ...contact, [key]: value });
  const nameInvalid = Boolean(highlightErrors && !isValidName(contact.patientName));
  const emailInvalid = Boolean(highlightErrors && !isValidEmail(contact.email));
  const phoneInvalid = Boolean(highlightErrors && !isValidPhone(contact.phone));
  const inputClass = (invalid: boolean) =>
    `min-h-12 rounded-xl border bg-background px-4 text-base font-normal outline-none transition-colors focus-visible:ring-3 ${
      invalid
        ? "border-destructive bg-destructive/5 ring-2 ring-destructive/20 focus-visible:ring-destructive/40"
        : "border-input focus-visible:ring-ring/40"
    }`;
  const errorDot = (invalid: boolean) =>
    invalid ? (
      <span className="ms-1.5 inline-block size-2 rounded-full bg-destructive align-middle" aria-hidden="true" />
    ) : null;

  return (
    <form
      id="contact-details"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mx-auto grid w-full gap-5"
    >
      <label className={`grid gap-2 text-sm font-medium ${nameInvalid ? "text-destructive" : ""}`}>
        <span>
          {t.booking.contact.name}
          {errorDot(nameInvalid)}
        </span>
        <input
          autoComplete="name"
          required
          maxLength={100}
          aria-invalid={nameInvalid || undefined}
          value={contact.patientName}
          onChange={(event) => update("patientName", event.target.value)}
          className={inputClass(nameInvalid)}
        />
      </label>
      <label className={`grid gap-2 text-sm font-medium ${emailInvalid ? "text-destructive" : ""}`}>
        <span>
          {t.booking.contact.email}
          {errorDot(emailInvalid)}
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          aria-invalid={emailInvalid || undefined}
          value={contact.email}
          onChange={(event) => update("email", event.target.value)}
          className={inputClass(emailInvalid)}
        />
      </label>
      <label className={`grid gap-2 text-sm font-medium ${phoneInvalid ? "text-destructive" : ""}`}>
        <span>
          {t.booking.contact.phone}
          {errorDot(phoneInvalid)}
        </span>
        <input
          type="tel"
          autoComplete="tel"
          required
          maxLength={32}
          aria-invalid={phoneInvalid || undefined}
          value={contact.phone}
          onChange={(event) => update("phone", event.target.value)}
          className={inputClass(phoneInvalid)}
        />
      </label>
      <p className="text-sm leading-6 text-muted-foreground">{t.booking.contact.note}</p>
    </form>
  );
}

function Review({
  service,
  doctor,
  date,
  time,
  contact,
}: {
  service: string;
  doctor: string;
  date: string;
  time: string;
  contact: { patientName: string; email: string; phone: string };
}) {
  const { formatDate, formatTime, t } = useI18n();
  return (
    <>
      <p className="mb-5 text-muted-foreground">{t.booking.review.intro}</p>
      <dl className="grid min-w-0 gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2">
        <Info label={t.labels.service} value={service} />
        <Info label={t.labels.clinician} value={doctor} />
        <Info
          label={t.labels.date}
          value={formatDate(date, { weekday: "long", month: "long", day: "numeric" })}
        />
        <Info label={t.labels.time} value={t.labels.utc.replace("{time}", formatTime(time))} />
        <Info label={t.labels.name} value={contact.patientName} />
        <Info label={t.labels.email} value={contact.email} />
        <Info label={t.labels.phone} value={contact.phone} />
      </dl>
      <p className="mt-5 text-sm font-medium text-brand-primary">{t.booking.review.notice}</p>
    </>
  );
}

function Confirmation({
  appointment,
  service,
  doctor,
  onRestart,
}: {
  appointment: Appointment;
  service: string;
  doctor: string;
  onRestart: () => void;
}) {
  const { formatDate, formatTime, t } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    focusBelowStickyHeader(headingRef.current);
  }, []);
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-8 sm:py-16">
      <section
        className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 text-card-foreground sm:p-10"
        aria-labelledby="booking-title"
      >
        <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-subtle text-brand-primary">
          <Check aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t.booking.confirmation.eyebrow}
        </p>
        <h1
          id="booking-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 scroll-mt-24 text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
        >
          {t.booking.confirmation.title}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t.booking.confirmation.body}</p>
        <dl className="mt-8 grid min-w-0 gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2">
          <Info label={t.labels.reference} value={appointment.id} />
          <Info label={t.labels.service} value={service} />
          <Info label={t.labels.clinician} value={doctor} />
          <Info
            label={t.labels.date}
            value={formatDate(appointment.date, { weekday: "long", month: "long", day: "numeric" })}
          />
          <Info label={t.labels.time} value={t.labels.utc.replace("{time}", formatTime(appointment.time))} />
          <Info label={t.labels.name} value={appointment.patientName} />
          <Info label={t.labels.email} value={appointment.email} />
          <Info label={t.labels.phone} value={appointment.phone} />
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="min-h-11" onClick={onRestart}>
            {t.booking.confirmation.startAnother}
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t.booking.confirmation.home}
          </Link>
          <Link
            href="/admin/overview"
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t.booking.confirmation.staff}
          </Link>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">{value}</dd>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  title,
  detail,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group relative min-h-20 rounded-2xl border p-4 text-start transition-all motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-ring ${
        selected
          ? "border-brand-primary bg-brand-subtle ring-1 ring-brand-primary/50 shadow-xs"
          : "border-border bg-background hover:bg-muted/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`font-semibold transition-colors ${
            selected ? "text-brand-primary" : "text-foreground group-hover:text-foreground"
          }`}
        >
          {title}
        </span>
        {selected ? (
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary text-white dark:text-primary-foreground shadow-xs">
            <Check aria-hidden="true" className="size-3 stroke-[2.5]" />
          </span>
        ) : (
          <span className="size-5 shrink-0 rounded-full border border-brand-border/80 group-hover:border-brand-primary/50" />
        )}
      </div>
      <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{detail}</span>
    </button>
  );
}
