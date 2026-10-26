import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";
import { HttpError } from "@/lib/authz";
import { ClinicError } from "@/lib/clinic-db";

const CLINIC_STATUS: Record<string, number> = {
  appointment_not_found: 404,
  confirmed_not_found: 404,
  service_not_found: 404,
  doctor_not_found: 404,
  invoice_not_found: 404,
  plan_not_found: 404,
  not_found: 404,
  slot_unavailable: 409,
  duration_overlap: 409,
  time_unavailable: 409,
  conflict: 409,
  cancellation_policy_locked: 409,
  cancellation_window: 409,
  invalid_transition: 409,
  already_paid: 409,
  already_approved: 409,
  doctor_service_blocked: 409,
  invalid_reference: 422,
  service_clinician_mismatch: 400,
  invalid_contact: 400,
  invalid_service: 400,
  invalid_doctor: 400,
  invalid_input: 400,
};

export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.code }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "invalid_input",
        issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400 }
    );
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (err instanceof ClinicError) {
    return NextResponse.json({ error: err.code }, { status: CLINIC_STATUS[err.code] ?? 400 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return NextResponse.json({ error: "conflict" }, { status: 409 });
    if (err.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (err.code === "P2003") return NextResponse.json({ error: "invalid_reference" }, { status: 422 });
  }
  console.error(err);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}
