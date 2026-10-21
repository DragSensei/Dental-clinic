"use client";

import { useState, type FormEvent } from "react";
import type { ErrorKey } from "@/shared/i18n/dictionaries";
import { useI18n } from "@/shared/i18n/locale-provider";

export type DemoAccount = { email: string; password: string };

export function AdminDemoGate({ accounts, onSignUp, onSignIn }: {
  accounts: DemoAccount[];
  onSignUp: (account: DemoAccount) => void;
  onSignIn: (email: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.admin.gate;
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [error, setError] = useState<ErrorKey | "">("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    if (mode === "signup") {
      const confirmPassword = String(data.get("confirmPassword") ?? "");
      if (accounts.some((account) => account.email === email)) return setError("signup_duplicate");
      if (password !== confirmPassword) return setError("password_mismatch");
      onSignUp({ email, password });
      return;
    }

    if (!accounts.some((account) => account.email === email && account.password === password)) {
      setError("login_invalid");
      return;
    }
    onSignIn(email);
  }

  return <main className="grid min-h-[70vh] place-items-center px-4 py-12 sm:px-6">
    <section className="route-enter w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9" aria-labelledby="admin-gate-title">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 id="admin-gate-title" className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{mode === "signup" ? copy.createTitle : copy.loginTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === "signup" ? copy.createBody : copy.loginBody}</p>
      <div className="mt-5 rounded-xl border border-brand-border bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">{copy.notice}</div>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium text-foreground">{copy.email}
          <input autoComplete="email" className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" name="email" required type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">{copy.password}
          <input autoComplete={mode === "signup" ? "new-password" : "current-password"} className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" minLength={8} name="password" required type="password" />
        </label>
        {mode === "signup" && <label className="grid gap-2 text-sm font-medium text-foreground">{copy.confirmPassword}
          <input autoComplete="new-password" className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" minLength={8} name="confirmPassword" required type="password" />
        </label>}
        {error && <p className="text-sm text-destructive" role="alert">{t.errors[error]}</p>}
        <button className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" type="submit">{mode === "signup" ? copy.createButton : copy.loginButton}</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "signup" ? copy.alreadySignedUp : copy.newToDemo}{" "}
        <button className="min-h-11 px-1 font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} type="button">{mode === "signup" ? copy.logIn : copy.createAccount}</button>
      </p>
    </section>
  </main>;
}
