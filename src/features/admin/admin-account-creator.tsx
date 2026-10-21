"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Stethoscope, User } from "lucide-react";
import type { AccountRole, AccountStatus } from "@/shared/data/mock/catalog";
import { localizedService } from "@/shared/data/mock/localized-copy";
import { useClinic } from "@/shared/data/use-clinic";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { AppCombobox } from "@/shared/components/ui/combobox";
import { PageTitle, Panel, field, labelClass } from "@/features/admin/admin-ui";
import { AlertErrorWithEverything } from "@/shared/components/ui/alert-error";

export function AccountCreator() {
  const { locale, t } = useI18n();
  const clinic = useClinic();
  const { services, createAccount } = clinic;

  const [role, setRole] = useState<AccountRole>("doctor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AccountStatus>("active");

  const [error, setError] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [createdName, setCreatedName] = useState<string>("");

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setSpecialty("");
    setBio("");
    setServiceIds([]);
    setPassword("");
    setStatus("active");
    setSaved(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (!name.trim() || !email.trim()) {
      setError("Please fill in required fields.");
      return;
    }

    if (role === "doctor" && !specialty.trim()) {
      setError("Please provide a specialty for the doctor.");
      return;
    }

    setPending(true);
    try {
      await createAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        status,
        specialty: role === "doctor" ? specialty.trim() : undefined,
        bio: role === "doctor" ? bio.trim() : undefined,
        serviceIds: role === "doctor" ? serviceIds : undefined,
      });
      setCreatedName(name.trim());
      setSaved(true);
    } catch {
      setError("Failed to create account. Please check the inputs.");
    } finally {
      setPending(false);
    }
  }

  const roleOptions: { role: AccountRole; label: string; desc: string; Icon: typeof User }[] = [
    {
      role: "doctor",
      label: t.admin.accounts.roleDoctor,
      desc: "Clinical practitioner with linked services and profile.",
      Icon: Stethoscope,
    },
    {
      role: "patient",
      label: t.admin.accounts.rolePatient,
      desc: "Patient with booking contacts and visit history.",
      Icon: User,
    },
    {
      role: "admin",
      label: t.admin.accounts.roleAdmin,
      desc: "Practice manager or administrator with workspace controls.",
      Icon: ShieldCheck,
    },
  ];

  return (
    <>
      <PageTitle
        title={t.admin.accounts.createTitle}
        description={t.admin.accounts.createBody}
        action={
          <Link
            className={buttonVariants({ variant: "accent", className: "min-h-11 inline-flex items-center gap-2 font-semibold shadow-xs" })}
            href="/admin/accounts"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
            {t.admin.accounts.backToAccounts}
          </Link>
        }
      />

      <Panel className="max-w-3xl">
        {saved ? (
          <div className="py-6 text-center sm:py-8">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary">
              <CheckCircle2 aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{t.admin.accounts.saved}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {createdName} has been added to the demo accounts list.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                className={buttonVariants({ variant: "accent", className: "min-h-11 font-semibold shadow-xs" })}
                href="/admin/accounts"
              >
                {t.admin.accounts.backToAccounts}
              </Link>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={resetForm}
              >
                Create another account
              </Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {/* Account Role Segmented Selector */}
            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold">{t.admin.accounts.accountRole}</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {roleOptions.map((opt) => {
                  const Icon = opt.Icon;
                  const selected = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setRole(opt.role)}
                      className={`flex min-h-16 flex-col items-start rounded-xl border p-4 text-start transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`grid size-7 place-items-center rounded-md ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={selected}
                          onChange={() => setRole(opt.role)}
                          className="size-4 accent-primary"
                          aria-label={opt.label}
                        />
                      </div>
                      <span className="mt-2 text-sm font-semibold text-foreground">{opt.label}</span>
                      <span className="mt-1 text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Core details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                {t.admin.accounts.fullName}
                <input
                  className={field}
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "doctor" ? "e.g. Dr. Sarah Jenkins" : "e.g. John Smith"}
                />
              </label>

              <label className={labelClass}>
                {t.admin.accounts.email}
                <input
                  type="email"
                  className={field}
                  required
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                {t.admin.accounts.phone}
                <input
                  type="tel"
                  className={field}
                  required
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 10 0000 0000"
                />
              </label>

              <AppCombobox
                label={t.admin.accounts.accountStatus}
                options={[
                  { value: "active", label: t.admin.accounts.statusActive },
                  { value: "inactive", label: t.admin.accounts.statusInactive },
                ]}
                value={status}
                onValueChange={(val) => setStatus(val as AccountStatus)}
                placeholder={t.admin.accounts.statusActive}
              />
            </div>

            {/* Doctor specific fields */}
            {role === "doctor" && (
              <div className="grid gap-4 rounded-xl border border-brand-border bg-brand-subtle/30 p-4">
                <h3 className="text-sm font-semibold text-brand-primary">
                  Clinician Profile Details
                </h3>

                <label className={labelClass}>
                  {t.admin.accounts.specialty}
                  <input
                    className={field}
                    required
                    maxLength={100}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Endodontics & Microscopic Care"
                  />
                </label>

                <label className={labelClass}>
                  {t.admin.accounts.bio}
                  <textarea
                    className={`${field} min-h-24 py-2.5`}
                    maxLength={400}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief clinician background and expertise…"
                  />
                </label>

                <fieldset className="grid gap-2">
                  <legend className="text-sm font-medium">{t.admin.accounts.linkedServices}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={serviceIds.includes(service.id)}
                          onChange={(e) =>
                            setServiceIds(
                              e.target.checked
                                ? [...serviceIds, service.id]
                                : serviceIds.filter((id) => id !== service.id)
                            )
                          }
                          className="size-4 rounded border-input accent-primary"
                        />
                        <span className="truncate">{localizedService(service, locale).title}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {/* Password */}
            <label className={labelClass}>
              {t.admin.accounts.password}
              <input
                type="password"
                className={field}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <span className="text-xs text-muted-foreground">
                Minimum 8 characters (demo only — stored in browser memory).
              </span>
            </label>

            {error && (
              <AlertErrorWithEverything
                description={error}
                onDismiss={() => setError("")}
                dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
              />
            )}

            <Button type="submit" variant="accent" className="min-h-11 font-semibold" disabled={pending}>
              {pending ? t.admin.accounts.saving : t.admin.accounts.saveAccount}
            </Button>
          </form>
        )}
      </Panel>
    </>
  );
}
