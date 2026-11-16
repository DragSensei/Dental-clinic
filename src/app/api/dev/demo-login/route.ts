import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z, ZodError } from "zod";

const demoLoginSchema = z.object({
  role: z.enum(["admin", "doctor", "patient"]),
});

const ROLE_EMAILS: Record<string, string> = {
  admin: "admin@bluehaven.example",
  doctor: "drlaylahassan@bluehaven.example",
  patient: "mariam.a@example.com",
};

export const PUBLIC_ROUTE = "demo sign-in endpoint gated by DEMO_MODE and per-IP rate limiting";

export async function POST(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const demoEnabled = isProd
    ? process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
    : process.env.DEMO_MODE !== "false" && process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  if (!demoEnabled) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`demo-login:${ip}`, 15, 60_000);
    if (!rateCheck.allowed) {
      throw new HttpError(429, "rate_limited");
    }

    const configuredPassword = process.env.SEED_DEMO_PASSWORD?.trim();
    if (isProd && !configuredPassword) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const password = configuredPassword || "DemoPass123!";
    const body = await request.json();
    const { role } = demoLoginSchema.parse(body);
    const email = ROLE_EMAILS[role];
    if (!email) {
      throw new HttpError(400, "invalid_role");
    }

    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
      headers: request.headers,
    });

    return response;
  } catch (err) {
    if (err instanceof HttpError || err instanceof ZodError || err instanceof SyntaxError) {
      return toErrorResponse(err);
    }
    console.error("Demo login error:", err);
    return NextResponse.json({ error: "demo_login_failed" }, { status: 500 });
  }
}
