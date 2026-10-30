import { NextRequest, NextResponse } from "next/server";
import { updateDoctor } from "@/lib/clinic-db";
import { requireRole, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
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

    const existing = await prisma.doctor.findUnique({
      where: { id },
      include: { services: true },
    });
    if (!existing) {
      throw new HttpError(404, "not_found");
    }

    const doctor = await updateDoctor(id, {
      name: parsed.name ?? existing.name,
      specialty: parsed.specialty ?? existing.specialty,
      bio: parsed.bio ?? existing.bio,
      serviceIds: parsed.serviceIds ?? existing.services.map((s) => s.serviceId),
      status: parsed.status ?? existing.status,
    });
    return NextResponse.json({ doctor: toDoctorDTO(doctor) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
