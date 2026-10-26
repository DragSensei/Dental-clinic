import { NextRequest, NextResponse } from "next/server";
import { getTreatmentPlan, approveTreatmentPlan, ClinicError } from "@/lib/clinic-db";
import { requireSession, resolvePatientEmail, isStaff, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { approveTreatmentPlanSchema } from "@/lib/clinic-schemas";
import { toTreatmentPlanDTO } from "@/lib/clinic-mappers";

export async function GET(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const email = resolvePatientEmail(user, searchParams.get("email"));

    const treatmentPlan = await getTreatmentPlan(email);
    if (!treatmentPlan) {
      throw new HttpError(404, "not_found");
    }
    return NextResponse.json({ treatmentPlan: toTreatmentPlanDTO(treatmentPlan) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    if (isStaff(user)) {
      throw new HttpError(403, "forbidden");
    }
    const body = await request.json();
    const email = resolvePatientEmail(user, body?.email);
    const parsed = approveTreatmentPlanSchema.parse(body);

    const existing = await getTreatmentPlan(email);
    if (!existing) {
      throw new HttpError(404, "not_found");
    }
    if (existing.status === "approved") {
      throw new ClinicError("already_approved");
    }

    const treatmentPlan = await approveTreatmentPlan(
      email,
      parsed.signatureDataUrl,
      parsed.signedByName
    );
    return NextResponse.json({ treatmentPlan: toTreatmentPlanDTO(treatmentPlan) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
