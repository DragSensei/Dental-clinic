"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, Plus, Search, ShieldCheck, Stethoscope, User, X } from "lucide-react";
import type { Account, AccountRole, AccountStatus } from "@/data/mock/catalog";
import { useClinic } from "@/data/use-clinic";
import { useI18n } from "@/i18n/locale-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AppCombobox } from "@/components/ui/combobox";
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
      <span className={`size-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/50"}`} aria-hidden="true" />
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
    <MotionConfig reducedMotion="user">
      <PageTitle
        title={t.admin.accounts.title}
        description={t.admin.accounts.description}
        action={
          <Link
            className={buttonVariants({
              variant: "accent",
              className: "min-h-11 inline-flex items-center gap-2 font-semibold shadow-xs transition-transform active:scale-[0.98]",
            })}
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
              <Search aria-hidden="true" className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${field} ps-10 pe-11`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.admin.accounts.searchPlaceholder}
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    type="button"
                    aria-label="Clear search"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.14 }}
                    onClick={() => setQuery("")}
                    className="absolute end-1 top-1/2 grid size-10 min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </motion.button>
                )}
              </AnimatePresence>
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
          {rolePills.map((pill) => {
            const active = roleFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setRoleFilter(pill.id)}
                className={`relative inline-flex min-h-11 items-center gap-1.5 overflow-hidden rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  active
                    ? "text-primary-foreground font-semibold"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-accounts-role-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary shadow-xs"
                  />
                )}
                <span className="relative z-10">{pill.label}</span>
                <span
                  className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums font-semibold ${
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accounts presentation */}
        <div className="mt-5">
          <AnimatePresence mode="wait" initial={false}>
            {!filteredAccounts.length ? (
              <motion.div
                key={`accounts-empty-${roleFilter}-${statusFilter}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <Empty>{t.admin.accounts.empty}</Empty>
              </motion.div>
            ) : (
              <motion.div
                key={`accounts-list-${roleFilter}-${statusFilter}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {/* Mobile cards view (< xl) */}
                <div className="grid min-w-0 gap-3 xl:hidden">
                  {filteredAccounts.map((account, index) => {
                    const doc = doctorMatch(account);
                    return (
                      <motion.article
                        key={account.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.18,
                          delay: Math.min(index * 0.025, 0.15),
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -2 }}
                        className="group min-w-0 rounded-xl border border-border bg-card/60 p-4 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md"
                      >
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
                              className="group/link inline-flex min-h-11 items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                              href={`/admin/accounts/${doc.id}`}
                            >
                              <span>{t.admin.accounts.editProfile}</span>
                              <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5" />
                            </Link>
                          </div>
                        )}
                      </motion.article>
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
                      {filteredAccounts.map((account, index) => {
                        const doc = doctorMatch(account);
                        return (
                          <motion.tr
                            key={account.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.16,
                              delay: Math.min(index * 0.02, 0.14),
                              ease: "easeOut",
                            }}
                            className="align-middle transition-colors hover:bg-muted/35"
                          >
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
                                  className="group/link inline-flex min-h-11 min-w-11 items-center justify-end gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                  href={`/admin/accounts/${doc.id}`}
                                >
                                  <span>{t.admin.accounts.editProfile}</span>
                                  <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5" />
                                </Link>
                              ) : (
                                <span className="text-xs text-muted-foreground/60">—</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </MotionConfig>
  );
}
