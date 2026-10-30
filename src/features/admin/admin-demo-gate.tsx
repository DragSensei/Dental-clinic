"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import { getDashboardRoute } from "@/data/use-session";
import type { AccountRole } from "@/data/mock/catalog";

export type DemoAccount = {
  email: string;
  name?: string;
  role?: AccountRole;
};

export function AdminDemoGate({
  onSignUp,
  onSignIn,
}: {
  accounts?: DemoAccount[];
  onSignUp?: (account: DemoAccount) => void;
  onSignIn?: (email: string, role?: AccountRole) => void;
} = {}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const copy = t.admin.gate;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<ErrorKey | "">("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    try {
      const res = await authClient.signIn.email({ email, password });
      if (res?.error) {
        setError("login_invalid");
        return;
      }
      router.refresh();
      const sessionRes = await authClient.getSession();
      const role = (sessionRes?.data?.user as { role?: AccountRole } | undefined)?.role || "patient";
      onSignIn?.(email, role);
      router.replace(getDashboardRoute(role));
    } catch {
      setError("login_invalid");
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const name = String(data.get("name") ?? "").trim();

    if (password !== confirmPassword) {
      setError("password_mismatch");
      return;
    }

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name: name || "Clinic User",
      });
      if (res?.error) {
        setError("signup_duplicate");
        return;
      }
      router.refresh();
      onSignUp?.({ email, role: "patient", ...(name ? { name } : {}) });
      router.replace(getDashboardRoute("patient"));
    } catch {
      setError("signup_duplicate");
    }
  }

  async function handleDemoLogin(role: "admin" | "doctor" | "patient") {
    setError("");
    try {
      const res = await fetch("/api/dev/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        setError("login_invalid");
        return;
      }
      window.location.href = getDashboardRoute(role);
    } catch {
      setError("login_invalid");
    }
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

                      <div className="relative my-2 flex items-center justify-center">
                        <div className="w-full border-t border-border" />
                        <span className="absolute bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                          {locale === "ar" ? "أو" : "Or"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await authClient.signIn.social({
                            provider: "google",
                            callbackURL: "/patient/overview",
                          });
                        }}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <svg className="size-4 shrink-0 text-primary" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>{locale === "ar" ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
                      </Button>

                      {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-xs text-center font-medium text-muted-foreground mb-2">
                            {locale === "ar" ? "تسجيل دخول تجريبي فوري بنقرة واحدة:" : "Quick Demo Access (Choose Role):"}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoLogin("admin")}
                              className="min-h-11 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary border-primary/40 shadow-xs"
                            >
                              Admin
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoLogin("patient")}
                              className="min-h-11 rounded-xl text-xs font-semibold text-primary hover:bg-secondary border-primary/40 shadow-xs"
                            >
                              Patient
                            </Button>
                          </div>
                        </div>
                      )}
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
                      {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-xs text-center font-medium text-muted-foreground mb-2">
                            {locale === "ar" ? "تسجيل دخول تجريبي فوري بنقرة واحدة:" : "Quick Demo Access (Choose Role):"}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoLogin("admin")}
                              className="min-h-11 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary border-primary/40 shadow-xs"
                            >
                              Admin
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoLogin("patient")}
                              className="min-h-11 rounded-xl text-xs font-semibold text-primary hover:bg-secondary border-primary/40 shadow-xs"
                            >
                              Patient
                            </Button>
                          </div>
                        </div>
                      )}
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
              <Image
                src="/dental-visit-hero.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 480px"
                className="object-cover object-center"
                priority
              />

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
