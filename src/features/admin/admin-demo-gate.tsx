"use client";

import { useState, type FormEvent } from "react";

export type DemoAccount = { email: string; password: string };

export function AdminDemoGate({ accounts, onSignUp, onSignIn }: {
  accounts: DemoAccount[];
  onSignUp: (account: DemoAccount) => void;
  onSignIn: (email: string) => void;
}) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    if (mode === "signup") {
      const confirmPassword = String(data.get("confirmPassword") ?? "");
      if (accounts.some((account) => account.email === email)) return setError("An account with this email already exists in this demo session.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      onSignUp({ email, password });
      return;
    }

    if (!accounts.some((account) => account.email === email && account.password === password)) {
      setError("No matching demo account. Create an account in this session first.");
      return;
    }
    onSignIn(email);
  }

  return <main className="grid min-h-[70vh] place-items-center px-4 py-12 sm:px-6">
    <section className="route-enter w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9" aria-labelledby="admin-gate-title">
      <p className="eyebrow">Simulated staff workspace</p>
      <h1 id="admin-gate-title" className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{mode === "signup" ? "Create a demo account" : "Welcome back"}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === "signup" ? "Sign up to explore the admin dashboard. This temporary account exists only until you leave or refresh." : "Log in with an account created in this browser session."}</p>
      <div className="mt-5 rounded-xl border border-brand-border bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">Demo only: this form does not provide real authentication or protect clinic data. Do not enter real credentials.</div>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium text-foreground">Email
          <input autoComplete="email" className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" name="email" required type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">Password
          <input autoComplete={mode === "signup" ? "new-password" : "current-password"} className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" minLength={8} name="password" required type="password" />
        </label>
        {mode === "signup" && <label className="grid gap-2 text-sm font-medium text-foreground">Confirm password
          <input autoComplete="new-password" className="min-h-12 rounded-xl border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" minLength={8} name="confirmPassword" required type="password" />
        </label>}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <button className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" type="submit">{mode === "signup" ? "Create demo account" : "Log in to demo"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "signup" ? "Already signed up this session?" : "New to the demo?"}{" "}
        <button className="min-h-11 px-1 font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} type="button">{mode === "signup" ? "Log in" : "Create an account"}</button>
      </p>
    </section>
  </main>;
}
