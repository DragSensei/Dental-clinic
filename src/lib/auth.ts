import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import prisma from "@/lib/prisma";

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("⚠️ RESEND_API_KEY is not set. Email notifications will be disabled.");
}

const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string; scope?: string[]; accessType?: string; prompt?: string }
> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    accessType: "offline",
    prompt: "consent",
  };
} else {
  console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth will be disabled.");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "d3nt4lCl1n1c$3cr3tK3y2026!AbCdEf12345",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  trustedOrigins: [
    "https://dentalclinicdemo-one.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.warn("Cannot send verification email: RESEND_API_KEY is missing.");
        return;
      }
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME || "BlueHaven Dental"} <${process.env.EMAIL_SENDER_ADDRESS || "onboarding@resend.dev"}>`,
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: Boolean(process.env.RESEND_API_KEY),
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn("Cannot send reset password email: RESEND_API_KEY is missing.");
        return;
      }
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
    },
    requireEmailVerification: Boolean(process.env.RESEND_API_KEY),
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
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
