import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const demoLoginSchema = z.object({
  role: z.enum(["admin", "doctor", "patient"]),
});

const ROLE_EMAILS: Record<string, string> = {
  admin: "admin@bluehaven.example",
  doctor: "drlaylahassan@bluehaven.example",
  patient: "mariam.a@example.com",
};

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "demo_password_not_configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { role } = demoLoginSchema.parse(body);
    const email = ROLE_EMAILS[role];
    if (!email) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
      headers: request.headers,
    });

    return response;
  } catch (err) {
    console.error("Demo login error:", err);
    return NextResponse.json({ error: "demo_login_failed" }, { status: 500 });
  }
}
