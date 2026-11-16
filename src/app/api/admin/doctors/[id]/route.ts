import { NextRequest, NextResponse } from "next/server";
import { updateDoctor } from "@/lib/clinic-db";
import { requireRole } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { updateDoctorSchema } from "@/lib/clinic-schemas";
import { toDoctorDTO } from "@/lib/clinic-mappers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDoctorSchema.parse(body);

    const doctor = await updateDoctor(id, parsed);
    return NextResponse.json({ doctor: toDoctorDTO(doctor) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
