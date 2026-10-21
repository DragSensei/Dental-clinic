"use client";
import Link from "next/link";
import { useState } from "react";
import type { Doctor, Service } from "@/shared/data/mock/catalog";
import { localizedDoctor, localizedService } from "@/shared/data/mock/localized-copy";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { errorKeyFrom } from "@/shared/i18n/errors";
import { interpolate } from "@/shared/i18n/format";
import type { ErrorKey } from "@/shared/i18n/dictionaries";
import { useI18n } from "@/shared/i18n/locale-provider";
import { PageTitle, Panel, field, labelClass } from "@/features/admin/admin-ui";
import { AlertErrorWithEverything } from "@/shared/components/ui/alert-error";

export function Doctors({ doctors }: { doctors: readonly Doctor[] }) {
  const { locale, t } = useI18n();
  return <><PageTitle title={t.admin.doctors.title} description={t.admin.doctors.description}/><div className="grid gap-4 md:grid-cols-2">{doctors.map((doctor) => { const copy = localizedDoctor(doctor, locale); return <Panel key={doctor.id}><h2 className="text-lg font-semibold">{copy.name}</h2><p className="mt-1 text-sm text-muted-foreground">{copy.specialty}</p><p className="mt-4 text-sm leading-6">{copy.bio}</p><p className="mt-4 text-xs text-muted-foreground">{interpolate(t.admin.doctors.linked, { count: doctor.serviceIds.length })}</p><Link className={buttonVariants({ variant: "outline", className: "mt-4 min-h-11" })} href={`/admin/doctors/${doctor.id}`}>{t.admin.doctors.editProfile}</Link></Panel>; })}</div></>;
}

export function DoctorEditor({ id, doctors, services, save }: { id: string; doctors: readonly Doctor[]; services: readonly Service[]; save: (doctor: Doctor) => Promise<unknown> }) {
  const { locale, t } = useI18n();
  const doctor = doctors.find((person) => person.id === id); const [name,setName] = useState(doctor?.name ?? ""); const [specialty,setSpecialty] = useState(doctor?.specialty ?? ""); const [bio,setBio] = useState(doctor?.bio ?? ""); const [serviceIds,setServiceIds] = useState<string[]>([...(doctor?.serviceIds ?? [])]); const [error,setError] = useState<ErrorKey | "">(""); const [saved,setSaved] = useState(false); const [pending,setPending] = useState(false);
  if (!doctor) return <PageTitle title={t.admin.doctors.notFoundTitle} description={t.admin.doctors.notFoundBody}/>;
  return <><PageTitle title={t.admin.doctors.editTitle} description={t.admin.doctors.editBody} action={<Link className={buttonVariants({ variant: "accent", className: "min-h-11 font-semibold" })} href="/admin/accounts">{t.admin.accounts.backToAccounts}</Link>}/><Panel><form className="grid max-w-2xl gap-4" onSubmit={async (event) => { event.preventDefault(); setError(""); setSaved(false); setPending(true); try { await save({ ...doctor, name:name.trim(), specialty:specialty.trim(), bio:bio.trim(), serviceIds }); setSaved(true); } catch (cause) { setError(errorKeyFrom(cause, "save_profile_failed")); } finally { setPending(false); } }}><label className={labelClass}>{t.admin.doctors.name}<input className={field} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)}/></label><label className={labelClass}>{t.admin.doctors.specialty}<input className={field} required maxLength={100} value={specialty} onChange={(e) => setSpecialty(e.target.value)}/></label><label className={labelClass}>{t.admin.doctors.bio}<textarea className={`${field} min-h-28 py-3`} required maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)}/></label><fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium">{t.admin.doctors.services}</legend>{services.map((service) => <label key={service.id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={serviceIds.includes(service.id)} onChange={(e) => setServiceIds(e.target.checked ? [...serviceIds,service.id] : serviceIds.filter((key) => key !== service.id))}/>{localizedService(service, locale).title}</label>)}</fieldset>{error && <AlertErrorWithEverything description={t.errors[error]} onDismiss={() => setError("")} dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"} />}{saved && <p className="text-sm" aria-live="polite">{t.admin.doctors.saved}</p>}<Button type="submit" variant="accent" className="min-h-11 font-semibold" disabled={pending}>{pending ? t.admin.doctors.saving : t.admin.doctors.save}</Button></form></Panel></>;
}

const SERVICE_CATEGORIES = [
  "Preventive Care",
  "Restorative Dentistry",
  "Cosmetic Dentistry",
  "Orthodontics",
  "Pediatric Dentistry",
  "Oral Surgery & Endodontics",
] as const;

export function Services({ services }: { services: readonly Service[] }) {
  const { locale, t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category || "Preventive Care")))];
  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter((s) => (s.category || "Preventive Care") === selectedCategory);

  return (
    <>
      <PageTitle
        title={t.admin.services.title}
        description={t.admin.services.description}
        action={
          <Link
            className={buttonVariants({ variant: "accent", className: "min-h-11 inline-flex items-center gap-2 font-semibold shadow-xs" })}
            href="/admin/services/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t.admin.services.createService}
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-brand-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-brand-subtle hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredServices.map((service) => {
          const copy = localizedService(service, locale);
          return (
            <Panel key={service.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 inline-flex items-center rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                    {service.category || "Preventive Care"}
                  </div>
                  <h2 className="text-lg font-semibold">{copy.title}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs">
                  {interpolate(t.admin.services.minutes, { count: service.durationMinutes })}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>
              <Link className={buttonVariants({ variant: "outline", className: "mt-4 min-h-11" })} href={`/admin/services/${service.id}`}>
                {t.admin.services.editService}
              </Link>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

export function ServiceCreator({ save }: { save: (service: Omit<Service, "id">) => Promise<unknown> }) {
  const { locale, t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Preventive Care");
  const [duration, setDuration] = useState("45");
  const [error, setError] = useState<ErrorKey | "">("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      <PageTitle
        title={t.admin.services.createTitle}
        description={t.admin.services.createBody}
        action={
          <Link className={buttonVariants({ variant: "outline", className: "min-h-11" })} href="/admin/services">
            {t.admin.services.backToServices}
          </Link>
        }
      />
      <Panel>
        {saved ? (
          <div className="py-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight">{t.admin.services.saved}</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link className={buttonVariants({ className: "min-h-11" })} href="/admin/services">
                {t.admin.services.backToServices}
              </Link>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setCategory("Preventive Care");
                  setDuration("45");
                  setSaved(false);
                }}
              >
                Create another service
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="grid max-w-2xl gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const minutes = Number(duration);
              if (!Number.isInteger(minutes) || minutes < 15 || minutes > 180) {
                setError("duration_range");
                return;
              }
              setError("");
              setSaved(false);
              setPending(true);
              try {
                await save({
                  title: title.trim(),
                  description: description.trim(),
                  category: category.trim(),
                  durationMinutes: minutes,
                  image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
                });
                setSaved(true);
              } catch (cause) {
                setError(errorKeyFrom(cause, "save_service_failed"));
              } finally {
                setPending(false);
              }
            }}
          >
            <label className={labelClass}>
              {t.admin.services.serviceName}
              <input
                className={field}
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cosmetic Veneers Consultation"
              />
            </label>
            <label className={labelClass}>
              Category
              <select
                className={field}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="General Dental Care">General Dental Care</option>
              </select>
            </label>
            <label className={labelClass}>
              {t.admin.services.descriptionLabel}
              <textarea
                className={`${field} min-h-28 py-3`}
                required
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of the service, what to expect, and care advice…"
              />
            </label>
            <label className={labelClass}>
              {t.admin.services.duration}
              <input
                className={field}
                type="number"
                min={15}
                max={180}
                step={5}
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>
            {error && (
              <AlertErrorWithEverything
                description={t.errors[error]}
                onDismiss={() => setError("")}
                dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
              />
            )}
            <Button type="submit" variant="accent" className="min-h-11 font-semibold" disabled={pending}>
              {pending ? t.admin.services.saving : t.admin.services.save}
            </Button>
          </form>
        )}
      </Panel>
    </>
  );
}

export function ServiceEditor({ id, services, save }: { id: string; services: readonly Service[]; save: (service: Service) => Promise<unknown> }) {
  const { locale, t } = useI18n();
  const service = services.find((item) => item.id === id);
  const [title, setTitle] = useState(service?.title ?? "");
  const [category, setCategory] = useState(service?.category ?? "Preventive Care");
  const [description, setDescription] = useState(service?.description ?? "");
  const [duration, setDuration] = useState(String(service?.durationMinutes ?? ""));
  const [error, setError] = useState<ErrorKey | "">("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  if (!service) return <PageTitle title={t.admin.services.notFoundTitle} description={t.admin.services.notFoundBody} />;
  return (
    <>
      <PageTitle
        title={t.admin.services.editTitle}
        description={t.admin.services.editBody}
        action={
          <Link className={buttonVariants({ variant: "outline", className: "min-h-11" })} href="/admin/services">
            {t.admin.services.backToServices}
          </Link>
        }
      />
      <Panel>
        <form
          className="grid max-w-2xl gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const minutes = Number(duration);
            if (!Number.isInteger(minutes) || minutes < 15 || minutes > 180) {
              setError("duration_range");
              return;
            }
            setError("");
            setSaved(false);
            setPending(true);
            try {
              await save({
                ...service,
                title: title.trim(),
                category: category.trim(),
                description: description.trim(),
                durationMinutes: minutes,
              });
              setSaved(true);
            } catch (cause) {
              setError(errorKeyFrom(cause, "save_service_failed"));
            } finally {
              setPending(false);
            }
          }}
        >
          <label className={labelClass}>
            {t.admin.services.serviceName}
            <input
              className={field}
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Category
            <select
              className={field}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="General Dental Care">General Dental Care</option>
            </select>
          </label>
          <label className={labelClass}>
            {t.admin.services.descriptionLabel}
            <textarea
              className={`${field} min-h-28 py-3`}
              required
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className={labelClass}>
            {t.admin.services.duration}
            <input
              className={field}
              type="number"
              min={15}
              max={180}
              step={1}
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          {error && (
            <AlertErrorWithEverything
              description={t.errors[error]}
              onDismiss={() => setError("")}
              dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
            />
          )}
          {saved && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium" aria-live="polite">
              {t.admin.services.saved}
            </p>
          )}
          <Button type="submit" variant="accent" className="min-h-11 font-semibold" disabled={pending}>
            {pending ? t.admin.services.saving : t.admin.services.save}
          </Button>
        </form>
      </Panel>
    </>
  );
}
