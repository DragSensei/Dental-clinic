"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, ShieldCheck, Stethoscope, User } from "lucide-react";
import type { Account, AccountRole, AccountStatus } from "@/shared/data/mock/catalog";
import { useClinic } from "@/shared/data/use-clinic";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Badge } from "@/shared/components/ui/badge";
import { buttonVariants } from "@/shared/components/ui/button";
import { AppCombobox } from "@/shared/components/ui/combobox";
import { Empty, PageTitle, Panel, field, labelClass } from "@/features/admin/admin-ui";

function RoleBadge({ role }: { role: AccountRole }) {
  const { t } = useI18n();
  const configs: Record<AccountRole, { label: string; Icon: typeof User }> = {
    doctor: {
      label: t.admin.accounts.roleDoctor,
      Icon: Stethoscope,
    },
    patient: {
      label: t.admin.accounts.rolePatient,
      Icon: User,
    },
    admin: {
      label: t.admin.accounts.roleAdmin,
      Icon: ShieldCheck,
    },
  };
  const config = configs[role] ?? configs.patient;
  const Icon = config.Icon;
  return (
    <Badge variant="secondary" className="gap-1.5 font-medium">
      <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      {config.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const { t } = useI18n();
  const isActive = status === "active";
  return (
    <Badge variant={isActive ? "outline" : "secondary"} className="gap-1.5 font-medium">
      <span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted-foreground/50"}`} aria-hidden="true" />
      <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
        {isActive ? t.admin.accounts.statusActive : t.admin.accounts.statusInactive}
      </span>
    </Badge>
  );
}

export function Accounts({ initialRole = "all" }: { initialRole?: "all" | AccountRole }) {
  const { t } = useI18n();
  const clinic = useClinic();
  const { accounts, doctors, appointments } = clinic;

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(initialRole);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Merge registered accounts with any dynamic patients from appointments
  const allAccounts = useMemo(() => {
    const list: Account[] = [...accounts];
    const existingEmails = new Set(list.map((a) => a.email.toLowerCase()));

    appointments.forEach((apt) => {
      const email = apt.email.toLowerCase();
      if (!existingEmails.has(email)) {
        existingEmails.add(email);
        list.push({
          id: `patient-apt-${apt.id}`,
          name: apt.patientName,
          email: apt.email,
          phone: apt.phone,
          role: "patient",
          status: "active",
          createdAt: apt.date,
        });
      }
    });

    return list;
  }, [accounts, appointments]);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAccounts.filter((account) => {
      if (roleFilter !== "all" && account.role !== roleFilter) return false;
      if (statusFilter !== "all" && account.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${account.name} ${account.email} ${account.phone} ${account.specialty ?? ""} ${account.role}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [allAccounts, query, roleFilter, statusFilter]);

  const doctorMatch = (account: Account) => {
    if (account.role !== "doctor") return null;
    return doctors.find((d) => d.id === account.id || d.name.toLowerCase() === account.name.toLowerCase());
  };

  const rolePills = useMemo(() => [
    { id: "all", label: t.admin.accounts.roleAll, count: allAccounts.length },
    { id: "doctor", label: t.admin.accounts.roleDoctor, count: allAccounts.filter((a) => a.role === "doctor").length },
    { id: "patient", label: t.admin.accounts.rolePatient, count: allAccounts.filter((a) => a.role === "patient").length },
    { id: "admin", label: t.admin.accounts.roleAdmin, count: allAccounts.filter((a) => a.role === "admin").length },
  ], [allAccounts, t]);

  return (
    <>
      <PageTitle
        title={t.admin.accounts.title}
        description={t.admin.accounts.description}
        action={
          <Link
            className={buttonVariants({ variant: "accent", className: "min-h-11 inline-flex items-center gap-2 font-semibold shadow-xs" })}
            href="/admin/accounts/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t.admin.accounts.createAccount}
          </Link>
        }
      />

      <Panel>
        {/* Filters and search */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_220px_200px] xl:gap-x-6">
          <label className={labelClass}>
            {t.admin.accounts.search}
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${field} ps-9`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.admin.accounts.searchPlaceholder}
              />
            </div>
          </label>

          <AppCombobox
            label={t.admin.accounts.role}
            options={[
              { value: "all", label: t.admin.accounts.roleAll },
              { value: "doctor", label: t.admin.accounts.roleDoctor },
              { value: "patient", label: t.admin.accounts.rolePatient },
              { value: "admin", label: t.admin.accounts.roleAdmin },
            ]}
            value={roleFilter}
            onValueChange={setRoleFilter}
            placeholder={t.admin.accounts.roleAll}
          />

          <AppCombobox
            label={t.admin.accounts.status}
            options={[
              { value: "all", label: t.admin.accounts.statusAll },
              { value: "active", label: t.admin.accounts.statusActive },
              { value: "inactive", label: t.admin.accounts.statusInactive },
            ]}
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder={t.admin.accounts.statusAll}
          />
        </div>

        {/* Counts summary pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <span className="text-xs text-muted-foreground">{t.admin.accounts.role}:</span>
          {rolePills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setRoleFilter(pill.id)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                roleFilter === pill.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <span>{pill.label}</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] tabular-nums font-semibold">
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Accounts presentation */}
        <div className="mt-5">
          {!filteredAccounts.length ? (
            <Empty>{t.admin.accounts.empty}</Empty>
          ) : (
            <>
              {/* Mobile cards view (< xl) */}
              <div className="grid min-w-0 gap-3 xl:hidden">
                {filteredAccounts.map((account) => {
                  const doc = doctorMatch(account);
                  return (
                    <article key={account.id} className="min-w-0 rounded-xl border border-border bg-card/60 p-4 shadow-xs">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                            {account.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold [overflow-wrap:anywhere]">{account.name}</h3>
                            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={account.role} />
                      </div>

                      <dl className="mt-3 grid min-w-0 gap-2 border-t border-border/60 pt-3 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="shrink-0 text-muted-foreground">{t.admin.accounts.phone}:</dt>
                          <dd className="truncate text-end tabular-nums text-foreground">{account.phone || "—"}</dd>
                        </div>
                        {account.specialty && (
                          <div className="flex justify-between gap-3">
                            <dt className="shrink-0 text-muted-foreground">{t.admin.accounts.specialty}:</dt>
                            <dd className="truncate text-end text-foreground">{account.specialty}</dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-3">
                          <dt className="shrink-0 text-muted-foreground">{t.admin.accounts.status}:</dt>
                          <dd className="text-end">
                            <StatusBadge status={account.status} />
                          </dd>
                        </div>
                      </dl>

                      {doc && (
                        <div className="mt-3 border-t border-border/60 pt-2 text-end">
                          <Link
                            className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            href={`/admin/accounts/${doc.id}`}
                          >
                            {t.admin.accounts.editProfile}
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Desktop table view (>= xl) */}
              <div
                role="region"
                aria-label={t.admin.accounts.tableLabel}
                tabIndex={0}
                className="hidden min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:block"
              >
                <table className="w-full min-w-[900px] table-fixed border-collapse text-start text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th scope="col" className="w-[28%] px-3 py-3 font-medium text-start">
                        {t.admin.accounts.columns[0]}
                      </th>
                      <th scope="col" className="w-[16%] px-3 py-3 font-medium text-start">
                        {t.admin.accounts.columns[1]}
                      </th>
                      <th scope="col" className="w-[22%] px-3 py-3 font-medium text-start">
                        {t.admin.accounts.columns[2]}
                      </th>
                      <th scope="col" className="w-[18%] px-3 py-3 font-medium text-start">
                        {t.admin.accounts.columns[3]}
                      </th>
                      <th scope="col" className="w-[10%] px-3 py-3 font-medium text-start">
                        {t.admin.accounts.columns[4]}
                      </th>
                      <th scope="col" className="w-[10%] px-3 py-3 font-medium text-end">
                        {t.admin.accounts.columns[5]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAccounts.map((account) => {
                      const doc = doctorMatch(account);
                      return (
                        <tr key={account.id} className="align-middle transition-colors hover:bg-muted/30">
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                                {account.name.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <span className="block truncate font-medium text-foreground">{account.name}</span>
                                <span className="block text-xs text-muted-foreground">ID: {account.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <RoleBadge role={account.role} />
                          </td>
                          <td className="break-all px-3 py-4 text-muted-foreground">{account.email}</td>
                          <td className="px-3 py-4">
                            <div className="min-w-0">
                              <p className="truncate tabular-nums text-foreground">{account.phone || "—"}</p>
                              {account.specialty && (
                                <p className="truncate text-xs text-muted-foreground">{account.specialty}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <StatusBadge status={account.status} />
                          </td>
                          <td className="px-3 py-4 text-end">
                            {doc ? (
                              <Link
                                className="inline-flex min-h-11 min-w-11 items-center justify-end font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                href={`/admin/accounts/${doc.id}`}
                              >
                                {t.admin.accounts.editProfile}
                              </Link>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Panel>
    </>
  );
}
