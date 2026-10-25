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

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
} else {
  console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth will be disabled.");
}

export const auth = betterAuth({
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
  socialProviders,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [admin(), nextCookies()],
});

export async function requireUser(request?: Request) {
  try {
    const headersList = request?.headers ?? (await import("next/headers").then((m) => m.headers()).catch(() => null));
    if (!headersList) return null;
    return await auth.api.getSession({ headers: headersList });
  } catch {
    return null;
  }
}
