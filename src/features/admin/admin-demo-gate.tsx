"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertErrorWithEverything } from "@/components/shared/alert-error";

import type { AccountRole } from "@/data/mock/catalog";

export type DemoAccount = {
  email: string;
  password: string;
  name?: string;
  role?: AccountRole;
};

export function AdminDemoGate({
  accounts,
  onSignUp,
  onSignIn,
}: {
  accounts: DemoAccount[];
  onSignUp: (account: DemoAccount) => void;
  onSignIn: (email: string, role?: AccountRole) => void;
}) {
  const { locale, t } = useI18n();
  const copy = t.admin.gate;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<ErrorKey | "">("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    const matched = accounts.find((account) => account.email === email && account.password === password);
    if (!matched) {
      setError("login_invalid");
      return;
    }
    onSignIn(email, matched.role ?? "admin");
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const name = String(data.get("name") ?? "").trim();

    if (accounts.some((account) => account.email === email)) {
      setError("signup_duplicate");
      return;
    }
    if (password !== confirmPassword) {
      setError("password_mismatch");
      return;
    }
    onSignUp({ email, password, role: "admin", ...(name ? { name } : {}) });
  }

  return (
    <main className="grid min-h-[75vh] place-items-center px-4 py-8 sm:px-6 lg:py-12">
      <div className="w-full max-w-4xl">
        {/* Mobile View Mode Switcher (< md) */}
        <div className="mb-4 flex w-full justify-center md:hidden">
          <div className="inline-flex rounded-xl border border-border bg-muted/70 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                mode === "login"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.logIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.createAccount}
            </button>
          </div>
        </div>

        {/* Dual Card Container with Sliding Overlay */}
        <section
          aria-label={mode === "login" ? copy.loginTitle : copy.createTitle}
          className="relative min-h-[620px] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
        >
          {/* Side-by-side Forms Grid */}
          <div className="grid min-h-[620px] grid-cols-1 md:grid-cols-2">
            {/* Left Card: Login Form */}
            <div
              inert={mode === "signup" ? true : undefined}
              className={`flex flex-col justify-between p-6 sm:p-8 md:p-10 ${
                mode === "signup" ? "hidden md:flex" : "flex"
              }`}
            >
              <Card className="flex h-full flex-col justify-between border-0 bg-transparent p-0 shadow-none">
                <div>
                  <CardHeader className="p-0 pb-6">
                    <p className="eyebrow">{copy.eyebrow}</p>
                    <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {copy.loginTitle}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {copy.loginBody}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0">
                    <form onSubmit={handleLogin} className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="login-email">{copy.email}</Label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder={copy.emailPlaceholder}
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">{copy.password}</Label>
                          <span className="text-xs text-muted-foreground">{copy.forgotPassword}</span>
                        </div>
                        <Input
                          id="login-password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          minLength={8}
                          placeholder={copy.passwordPlaceholder}
                        />
                      </div>

                      <div className="rounded-xl border border-brand-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                        {copy.notice}
                      </div>

                      {error && (
                        <AlertErrorWithEverything
                          title={locale === "ar" ? "خطأ في تسجيل الدخول" : "Authentication Error"}
                          description={t.errors[error]}
                          onDismiss={() => setError("")}
                          dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
                          className="p-3 text-xs"
                        />
                      )}

                      <Button
                        type="submit"
                        variant="accent"
                        className="mt-2 min-h-11 w-full font-semibold shadow-xs"
                      >
                        {copy.loginButton}
                      </Button>
                    </form>
                  </CardContent>
                </div>

                <CardFooter className="justify-center p-0 pt-6 text-center text-sm text-muted-foreground">
                  <span>{copy.newToDemo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className="ms-1.5 min-h-11 font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {copy.createAccount}
                  </button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Card: Signup Form */}
            <div
              inert={mode === "login" ? true : undefined}
              className={`flex flex-col justify-between p-6 sm:p-8 md:p-10 ${
                mode === "login" ? "hidden md:flex" : "flex"
              }`}
            >
              <Card className="flex h-full flex-col justify-between border-0 bg-transparent p-0 shadow-none">
                <div>
                  <CardHeader className="p-0 pb-6">
                    <p className="eyebrow">{copy.eyebrow}</p>
                    <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {copy.createTitle}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {copy.createBody}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0">
                    <form onSubmit={handleSignUp} className="grid gap-3.5">
                      <div className="grid gap-1.5">
                        <Label htmlFor="signup-name">{copy.fullName}</Label>
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder={copy.fullNamePlaceholder}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="signup-email">{copy.email}</Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder={copy.emailPlaceholder}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                          <Label htmlFor="signup-password">{copy.password}</Label>
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            placeholder={copy.passwordPlaceholder}
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="signup-confirm-password">{copy.confirmPassword}</Label>
                          <Input
                            id="signup-confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            placeholder={copy.passwordPlaceholder}
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-1">
                        <Checkbox id="signup-terms" defaultChecked required className="mt-0.5" />
                        <Label
                          htmlFor="signup-terms"
                          className="cursor-pointer text-xs font-normal leading-snug text-muted-foreground"
                        >
                          {copy.terms}
                        </Label>
                      </div>

                      <div className="rounded-xl border border-brand-border bg-muted/50 p-2.5 text-xs leading-relaxed text-muted-foreground">
                        {copy.notice}
                      </div>

                      {error && (
                        <AlertErrorWithEverything
                          title={locale === "ar" ? "خطأ في إنشاء الحساب" : "Registration Error"}
                          description={t.errors[error]}
                          onDismiss={() => setError("")}
                          dismissLabel={locale === "ar" ? "إغلاق" : "Dismiss"}
                          className="p-3 text-xs"
                        />
                      )}

                      <Button
                        type="submit"
                        variant="accent"
                        className="mt-1 min-h-11 w-full font-semibold shadow-xs"
                      >
                        {copy.createButton}
                      </Button>
                    </form>
                  </CardContent>
                </div>

                <CardFooter className="justify-center p-0 pt-6 text-center text-sm text-muted-foreground">
                  <span>{copy.alreadySignedUp}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="ms-1.5 min-h-11 font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {copy.logIn}
                  </button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Desktop Sliding Overlay with Picture & Theme Gradient */}
          <div
            aria-hidden={false}
            className={`pointer-events-none absolute inset-y-0 start-0 z-20 hidden w-1/2 overflow-hidden transition-transform duration-700 ease-in-out md:block motion-reduce:transition-none ${
              mode === "login"
                ? "ltr:translate-x-full rtl:-translate-x-full"
                : "translate-x-0"
            }`}
          >
            <div className="relative flex h-full w-full flex-col items-center justify-center p-8 text-center text-white sm:p-10">
              {/* Background picture */}
              <Image
                src="/dental-visit-hero.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 480px"
                className="object-cover object-center"
                priority
              />

              {/* Global Theme Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/95 via-brand-primary/85 to-brand-hover/95 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(85,169,220,0.35),_transparent_75%)]" />

              {/* Content Panel 1: Shown when covering Signup (mode === 'login') */}
              <div
                className={`relative z-10 flex flex-col items-center justify-center max-w-sm transition-all duration-500 ${
                  mode === "login"
                    ? "pointer-events-auto opacity-100 scale-100"
                    : "pointer-events-none opacity-0 scale-95 absolute"
                }`}
              >
                <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-inner backdrop-blur-md">
                  <Sparkles className="size-6 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {copy.overlaySignupTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  {copy.overlaySignupBody}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/60 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>{copy.createAccount}</span>
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </button>
              </div>

              {/* Content Panel 2: Shown when covering Login (mode === 'signup') */}
              <div
                className={`relative z-10 flex flex-col items-center justify-center max-w-sm transition-all duration-500 ${
                  mode === "signup"
                    ? "pointer-events-auto opacity-100 scale-100"
                    : "pointer-events-none opacity-0 scale-95 absolute"
                }`}
              >
                <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-inner backdrop-blur-md">
                  <ShieldCheck className="size-6 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {copy.overlayLoginTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  {copy.overlayLoginBody}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/60 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowRight className="size-4 rotate-180 rtl:rotate-0" />
                  <span>{copy.logIn}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
