import { NextRequest, NextResponse } from "next/server";
import { getPatientIntakeForm, upsertPatientIntakeForm } from "@/lib/clinic-db";
import { requireSession, resolvePatientEmail, isStaff, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { patientIntakeInputSchema } from "@/lib/clinic-schemas";
import { toIntakeDTO, fromIntakeInput } from "@/lib/clinic-mappers";

export async function GET(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const email = resolvePatientEmail(user, searchParams.get("email"));

    const intakeForm = await getPatientIntakeForm(email);
    return NextResponse.json({ intakeForm: intakeForm ? toIntakeDTO(intakeForm) : null });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    if (isStaff(user)) {
      throw new HttpError(403, "forbidden");
    }
    const body = await request.json();
    const email = resolvePatientEmail(user, body?.email);
    const parsed = patientIntakeInputSchema.parse(body);

    const inputData = fromIntakeInput(parsed);
    const intakeForm = await upsertPatientIntakeForm(email, inputData);

    return NextResponse.json({ intakeForm: toIntakeDTO(intakeForm) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
