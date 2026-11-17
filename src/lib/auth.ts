import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import prisma from "@/lib/prisma";

function envValue(value: string | undefined, placeholders: readonly string[] = []): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || placeholders.includes(trimmed)) return undefined;
  return trimmed;
}

const resendApiKey = envValue(process.env.RESEND_API_KEY, ["re_..."]);
let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn("⚠️ RESEND_API_KEY is not set. Email notifications will be disabled.");
}

const googleClientId = envValue(process.env.GOOGLE_CLIENT_ID, [
  "your-google-client-id.apps.googleusercontent.com",
]);
const googleClientSecret = envValue(process.env.GOOGLE_CLIENT_SECRET, [
  "your-google-client-secret",
]);
const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string; scope?: string[]; accessType?: string; prompt?: string }
> = {};
if (googleClientId && googleClientSecret) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    accessType: "offline",
    prompt: "consent",
  };
} else {
  console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth will be disabled.");
}

const configuredSecret = envValue(process.env.BETTER_AUTH_SECRET, [
  "your-super-secret-key-here",
]);
if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("BETTER_AUTH_SECRET must be configured in production");
}

export const auth = betterAuth({
  secret: configuredSecret || "d3nt4lCl1n1c$3cr3tK3y2026!AbCdEf12345",
  baseURL:
    envValue(process.env.BETTER_AUTH_URL) ||
    envValue(process.env.NEXT_PUBLIC_BASE_URL) ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "http://localhost:3000",
  trustedOrigins: Array.from(
    new Set([
      "https://dentalclinicdemo-one.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ...[
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
        process.env.VERCEL_URL,
        process.env.VERCEL_BRANCH_URL,
        process.env.BETTER_AUTH_URL,
        process.env.NEXT_PUBLIC_BASE_URL,
      ]
        .map((raw) => envValue(raw))
        .filter((value): value is string => Boolean(value))
        .flatMap((value) => {
          try {
            const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
            return [url.origin];
          } catch {
            return [];
          }
        }),
    ]),
  ),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.warn("Cannot send verification email: RESEND_API_KEY is missing.");
        return;
      }
      try {
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME || "BlueHaven Dental"} <${process.env.EMAIL_SENDER_ADDRESS || "onboarding@resend.dev"}>`,
          to: user.email,
          subject: "Verify your email",
          react: VerifyEmail({ username: user.name, verifyUrl: url }),
        });
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
    sendOnSignUp: Boolean(resendApiKey),
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn("Cannot send reset password email: RESEND_API_KEY is missing.");
        return;
      }
      try {
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME || "BlueHaven Dental"} <${process.env.EMAIL_SENDER_ADDRESS || "onboarding@resend.dev"}>`,
          to: user.email,
          subject: "Reset your password",
          react: ForgotPasswordEmail({
            username: user.name,
            resetUrl: url,
            userEmail: user.email,
          }),
        });
      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }
    },
    requireEmailVerification: Boolean(resendApiKey),
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "database",
    customRules: {
      "/get-session": false,
    },
  },
  socialProviders,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [admin({ defaultRole: "patient", adminRoles: ["admin"] }), nextCookies()],
});
