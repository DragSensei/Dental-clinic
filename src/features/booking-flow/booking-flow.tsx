"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Stethoscope } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useClinic } from "@/shared/data/use-clinic";
import { getAvailableDates, getAvailableSlots } from "@/shared/data/clinic-repository";
import type { Appointment, BookingDetails } from "@/shared/data/mock/catalog";

const steps = ["Service", "Clinician", "Date & time", "Your details", "Review", "Confirmed"] as const;
const prettyDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const prettyTime = (time: string) => new Date(`2000-01-01T${time}:00Z`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

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

export function BookingFlow() {
  const router = useRouter();
  const query = useSearchParams();
  const { appointments, services, doctors, bookAppointment } = useClinic();
  const requestedService = query.get("serviceId") ?? "";
  const requestedDoctor = query.get("doctorId") ?? "";
  const requestStep = query.get("step") ?? "0";
  const entryParamsRef = useRef({ service: requestedService, doctor: requestedDoctor });
  const [serviceId, setServiceId] = useState(() => services.some((item) => item.id === requestedService) ? requestedService : "");
  const [doctorId, setDoctorId] = useState(() => {
    const service = services.find((item) => item.id === requestedService);
    const doctor = doctors.find((item) => item.id === requestedDoctor);
    return doctor && (!service || doctor.serviceIds.includes(service.id)) ? requestedDoctor : "";
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contact, setContact] = useState({ patientName: "", email: "", phone: "" });
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slotResult, setSlotResult] = useState<{ key: string; slots: string[] } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedStepRef = useRef(false);
  const service = services.find((item) => item.id === serviceId);
  const doctor = doctors.find((item) => item.id === doctorId);
  const parsedStep = Number(requestStep);
  const step = Number.isInteger(parsedStep) && parsedStep >= 0 && parsedStep < steps.length ? parsedStep : 0;
  const selectedDate = useMemo(() => availableDates.includes(date) ? date : "", [availableDates, date]);
  const slotKey = `${serviceId}|${doctorId}|${date}`;
  const availableSlots = slotResult?.key === slotKey ? slotResult.slots : [];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const previous = entryParamsRef.current;
      const serviceChanged = requestedService !== previous.service;
      const doctorChanged = requestedDoctor !== previous.doctor;
      if (!serviceChanged && !doctorChanged) return;
      entryParamsRef.current = { service: requestedService, doctor: requestedDoctor };

      let nextServiceId = serviceId;
      let nextDoctorId = doctorId;
      if (serviceChanged && requestedService) {
        nextServiceId = services.some((item) => item.id === requestedService) ? requestedService : "";
      }

      if (doctorChanged && requestedDoctor) {
        nextDoctorId = doctors.some((item) => item.id === requestedDoctor) ? requestedDoctor : "";
      }

      const nextDoctor = doctors.find((item) => item.id === nextDoctorId);
      if (nextDoctor && nextServiceId && !nextDoctor.serviceIds.includes(nextServiceId)) {
        if (doctorChanged && requestedDoctor) nextServiceId = "";
        else nextDoctorId = "";
      }

      if (nextServiceId !== serviceId || nextDoctorId !== doctorId) {
        setServiceId(nextServiceId);
        setDoctorId(nextDoctorId);
        setDate("");
        setTime("");
        setError("");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [requestedService, requestedDoctor, serviceId, doctorId, services, doctors]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (serviceId && !services.some((item) => item.id === serviceId)) {
        setServiceId("");
        setDoctorId("");
        setDate("");
        setTime("");
        setError("This demo service is no longer available. Please choose another service.");
      } else if (doctorId && (!doctors.some((item) => item.id === doctorId) || (serviceId && !doctors.find((item) => item.id === doctorId)?.serviceIds.includes(serviceId)))) {
        setDoctorId("");
        setDate("");
        setTime("");
        setError("The selected clinician is no longer available for this service. Please choose another clinician.");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [serviceId, doctorId, services, doctors]);

  const setStep = (next: number) => {
    const params = new URLSearchParams({ step: String(next) });
    if (serviceId) params.set("serviceId", serviceId);
    if (doctorId) params.set("doctorId", doctorId);
    router.push(`/book?${params.toString()}`, { scroll: false });
    setError("");
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (step === 5 && !appointment) setStep(contact.patientName && contact.email && contact.phone ? 4 : 3);
      else if (step > 0 && !service) setStep(0);
      else if (step > 1 && (!doctor || !doctor.serviceIds.includes(service?.id ?? ""))) setStep(1);
      else if (step > 2 && (!date || !time)) setStep(2);
      else if (step > 3 && (!contact.patientName || !contact.email || !contact.phone)) setStep(3);
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
    if (step === 5) return;
    const frame = requestAnimationFrame(() => focusBookingStep(headingRef.current));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (!serviceId || !doctorId) return;
    const frame = requestAnimationFrame(() => setAvailableDates(getAvailableDates(serviceId, doctorId)));
    return () => cancelAnimationFrame(frame);
  }, [serviceId, doctorId, services, doctors]);

  useEffect(() => {
    if (!date || !serviceId || !doctorId) return;
    const key = slotKey;
    const frame = requestAnimationFrame(() => setSlotResult({ key, slots: getAvailableSlots(serviceId, doctorId, date) }));
    return () => cancelAnimationFrame(frame);
  }, [appointments, services, date, serviceId, doctorId, slotKey]);

  const retry = () => {
    setError("");
    if (date && serviceId && doctorId) setSlotResult({ key: slotKey, slots: getAvailableSlots(serviceId, doctorId, date) });
    focusBelowStickyHeader(headingRef.current);
  };

  const submit = async () => {
    if (!service || !doctor || !selectedDate || !time) return;
    setPending(true);
    setError("");
    const input: BookingDetails = { serviceId, doctorId, date: selectedDate, time, ...contact };
    try {
      setAppointment(await bookAppointment(input));
      setStep(5);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not complete the demo request. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (step === 5 && appointment && service && doctor) {
    return <Confirmation appointment={appointment} service={service.title} doctor={doctor.name} onRestart={() => {
      setAppointment(null);
      setServiceId("");
      setDoctorId("");
      setDate("");
      setTime("");
      setContact({ patientName: "", email: "", phone: "" });
      setStep(0);
    }} />;
  }

  if (step === 5) return <main className="min-h-screen bg-background p-6"><p role="status" className="mx-auto max-w-5xl text-muted-foreground">Returning to the last valid booking step…</p></main>;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-brand-primary">BLUEHAVEN DENTAL · DEMO</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Book a visit</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Explore the simulated appointment flow. Your contact details stay in memory for this visit and are not saved.</p>
        </header>
        <BookingProgress step={step} onSelect={setStep} disabled={pending} />
        <section aria-labelledby="step-title" className="rounded-3xl border border-border bg-card p-5 text-card-foreground sm:p-9">
          <div className="mb-7">
            <p className="text-sm font-medium text-muted-foreground">Simulated booking · Step {step + 1} of 5</p>
            <h2 id="step-title" ref={headingRef} tabIndex={-1} className="mt-2 scroll-mt-24 text-2xl font-semibold tracking-tight outline-none sm:text-3xl">{steps[step]}</h2>
          </div>
          <div key={step} className="booking-step-enter">
            {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><span>{error}</span><Button type="button" variant="outline" className="min-h-11" onClick={retry}>Try again</Button></div>}
            {step === 0 && <ServiceChoices services={services} selectedId={serviceId} onSelect={(id) => { const currentDoctor = doctors.find((item) => item.id === doctorId); setServiceId(id); if (currentDoctor && !currentDoctor.serviceIds.includes(id)) { setDoctorId(""); setError("Your selected clinician does not offer this service. Please choose a clinician for it."); } setDate(""); setTime(""); }} />}
            {step === 1 && <DoctorChoices doctors={doctors.filter((item) => !service || item.serviceIds.includes(service.id))} selectedId={doctorId} onSelect={(id) => { setDoctorId(id); setDate(""); setTime(""); }} />}
            {step === 2 && <DateChoices dates={availableDates} slots={availableSlots} date={date} time={time} onDate={(value) => { setDate(value); setTime(""); }} onTime={setTime} />}
            {step === 3 && <ContactFields contact={contact} onChange={setContact} onSubmit={() => setStep(4)} />}
            {step === 4 && service && doctor && <Review service={service.title} doctor={doctor.name} date={selectedDate} time={time} contact={contact} />}
          </div>
          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" className="min-h-11" disabled={step === 0 || pending} onClick={() => setStep(step - 1)}><ArrowLeft aria-hidden="true" />Back</Button>
            {step < 3 && <Button type="button" className="min-h-11" disabled={(step === 0 && !service) || (step === 1 && (!service || !doctor || !doctor.serviceIds.includes(service.id))) || (step === 2 && (!selectedDate || !availableSlots.includes(time)))} onClick={() => setStep(step + 1)}>Continue<ArrowRight aria-hidden="true" /></Button>}
            {step === 3 && <Button type="submit" form="contact-details" className="min-h-11">Continue<ArrowRight aria-hidden="true" /></Button>}
            {step === 4 && <Button type="button" className="min-h-11" disabled={pending} onClick={() => void submit()}>{pending ? "Submitting demo…" : "Confirm demo request"}<Stethoscope aria-hidden="true" /></Button>}
          </footer>
        </section>
        <p role="note" className="mt-5 text-center text-sm text-muted-foreground">Simulation only · No real reservation or contact will be made.</p>
      </div>
    </main>
  );
}

function BookingProgress({ step, onSelect, disabled }: { step: number; onSelect: (step: number) => void; disabled: boolean }) {
  return <nav aria-label="Booking progress" className="mb-8 overflow-x-auto">
    <ol className="flex min-w-max gap-2" aria-label={`Step ${Math.min(step + 1, 5)} of 5`}>
      {steps.slice(0, 5).map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined}>
        {index < step ? <button type="button" disabled={disabled} onClick={() => onSelect(index)} aria-label={`Return to ${label}`} className="flex min-h-11 items-center gap-2 rounded-full bg-muted px-3 text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"><span className="grid size-6 place-items-center rounded-full border border-current text-xs">{index + 1}</span><span className="hidden sm:inline">{label}</span></button> : <span className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${step === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><span className="grid size-6 place-items-center rounded-full border border-current text-xs">{index + 1}</span><span className={step === index ? "" : "hidden sm:inline"}>{label}</span></span>}
      </li>)}
    </ol>
  </nav>;
}

function ServiceChoices({ services, selectedId, onSelect }: { services: ReturnType<typeof useClinic>["services"]; selectedId: string; onSelect: (id: string) => void }) {
  if (!services.length) return <p role="status" className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">No demo services are currently available. <Link href="/services" className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4">Browse services</Link> or return home.</p>;
  return <div className="grid gap-3 sm:grid-cols-2">{services.map((service) => <Choice key={service.id} selected={selectedId === service.id} onClick={() => onSelect(service.id)} title={service.title} detail={`${service.durationMinutes} minute demo visit · ${service.description}`} />)}</div>;
}

function DoctorChoices({ doctors, selectedId, onSelect }: { doctors: ReturnType<typeof useClinic>["doctors"]; selectedId: string; onSelect: (id: string) => void }) {
  if (!doctors.length) return <p role="status" className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">No demo clinicians offer this service. Go back to choose another service.</p>;
  return <div className="grid gap-3 sm:grid-cols-2">{doctors.map((doctor) => <Choice key={doctor.id} selected={selectedId === doctor.id} onClick={() => onSelect(doctor.id)} title={doctor.name} detail={`${doctor.specialty} · ${doctor.bio}`} />)}</div>;
}

function DateChoices({ dates, slots, date, time, onDate, onTime }: { dates: string[]; slots: string[]; date: string; time: string; onDate: (date: string) => void; onTime: (time: string) => void }) {
  return <div>
    <div className="mb-6 flex items-start gap-3 rounded-xl bg-muted p-4 text-sm"><CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-primary" /><p>Demo dates use the UTC calendar and are generated from today. Friday is omitted in this sample schedule.</p></div>
    {!dates.length && <p role="status" className="mb-5 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">No demo dates are currently available for this clinician and service. Go back to choose another clinician or service.</p>}
    <h3 className="mb-3 font-medium">Choose a date</h3>
    <div className="flex flex-wrap gap-2">{dates.map((value) => <button key={value} type="button" aria-pressed={date === value} className={`min-h-11 rounded-xl border px-4 text-sm focus-visible:outline-2 focus-visible:outline-ring ${date === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`} onClick={() => onDate(value)}>{prettyDate(value)}</button>)}</div>
    <h3 className="mb-3 mt-7 font-medium">Choose a time</h3>
    {date ? <div className="flex flex-wrap gap-2">{slots.length ? slots.map((value) => <button key={value} type="button" aria-pressed={time === value} className={`min-h-11 rounded-xl border px-4 text-sm focus-visible:outline-2 focus-visible:outline-ring ${time === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`} onClick={() => onTime(value)}><Clock3 aria-hidden="true" className="mr-2 inline size-4" />{prettyTime(value)}</button>) : <p role="status" className="text-sm text-muted-foreground">No demo times are available on this date. Choose another date.</p>}</div> : <p className="text-sm text-muted-foreground">Choose a date to see available demo times.</p>}
  </div>;
}

function ContactFields({ contact, onChange, onSubmit }: { contact: { patientName: string; email: string; phone: string }; onChange: (contact: { patientName: string; email: string; phone: string }) => void; onSubmit: () => void }) {
  const update = (key: keyof typeof contact, value: string) => onChange({ ...contact, [key]: value });
  return <form id="contact-details" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSubmit(); }} className="grid max-w-xl gap-5">
    <label className="grid gap-2 text-sm font-medium">Full name<input autoComplete="name" required maxLength={100} value={contact.patientName} onChange={(event) => update("patientName", event.target.value)} className="min-h-12 rounded-xl border border-input bg-background px-4 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></label>
    <label className="grid gap-2 text-sm font-medium">Email address<input type="email" autoComplete="email" required maxLength={254} value={contact.email} onChange={(event) => update("email", event.target.value)} className="min-h-12 rounded-xl border border-input bg-background px-4 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></label>
    <label className="grid gap-2 text-sm font-medium">Phone number<input type="tel" autoComplete="tel" required maxLength={32} value={contact.phone} onChange={(event) => update("phone", event.target.value)} className="min-h-12 rounded-xl border border-input bg-background px-4 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></label>
    <p className="text-sm leading-6 text-muted-foreground">Only name, email, and phone are requested. These fields are held in memory and never saved in browser storage.</p>
  </form>;
}

function Review({ service, doctor, date, time, contact }: { service: string; doctor: string; date: string; time: string; contact: { patientName: string; email: string; phone: string } }) {
  return <><p className="mb-5 text-muted-foreground">Review your demo request before submitting.</p><dl className="grid min-w-0 gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2"><Info label="Service" value={service} /><Info label="Clinician" value={doctor} /><Info label="Date" value={prettyDate(date)} /><Info label="Time (UTC)" value={`${prettyTime(time)} UTC`} /><Info label="Name" value={contact.patientName} /><Info label="Email" value={contact.email} /><Info label="Phone" value={contact.phone} /></dl><p className="mt-5 text-sm font-medium text-brand-primary">This creates a simulated demo entry only. It does not reserve a real appointment.</p></>;
}

function Confirmation({ appointment, service, doctor, onRestart }: { appointment: Appointment; service: string; doctor: string; onRestart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { focusBelowStickyHeader(headingRef.current); }, []);
  return <main className="min-h-screen bg-background px-4 py-10 sm:px-8 sm:py-16"><section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 text-card-foreground sm:p-10" aria-labelledby="booking-title">
    <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-subtle text-brand-primary"><Check aria-hidden="true" /></span>
    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Demo request complete</p>
    <h1 id="booking-title" ref={headingRef} tabIndex={-1} className="mt-3 scroll-mt-24 text-3xl font-semibold tracking-tight outline-none sm:text-4xl">Your demo appointment is confirmed</h1>
    <p className="mt-4 leading-7 text-muted-foreground">This is a simulated booking for this preview. It is not a real reservation, and the clinic will not contact you.</p>
    <dl className="mt-8 grid min-w-0 gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2"><Info label="Demo reference" value={appointment.id} /><Info label="Service" value={service} /><Info label="Clinician" value={doctor} /><Info label="Date" value={prettyDate(appointment.date)} /><Info label="Time (UTC)" value={`${prettyTime(appointment.time)} UTC`} /><Info label="Name" value={appointment.patientName} /><Info label="Email" value={appointment.email} /><Info label="Phone" value={appointment.phone} /></dl>
    <div className="mt-8 flex flex-wrap gap-3"><Button type="button" variant="outline" className="min-h-11" onClick={onRestart}>Start another demo booking</Button><Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">Back to home</Link><Link href="/admin" className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">Open staff demo</Link></div>
  </section></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 min-w-0 [overflow-wrap:anywhere] font-medium">{value}</dd></div>; }

function Choice({ selected, onClick, title, detail }: { selected: boolean; onClick: () => void; title: string; detail: string }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`min-h-20 rounded-2xl border p-4 text-left transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-ring ${selected ? "border-primary bg-brand-subtle" : "border-border hover:bg-muted"}`}><span className="font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{detail}</span></button>;
}
