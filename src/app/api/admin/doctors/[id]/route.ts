import { NextRequest, NextResponse } from "next/server";
import { updateDoctor, ClinicError } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser(request);
    const { id } = await params;
    const body = await request.json();
    const doctor = await updateDoctor(id, {
      name: body.name,
      specialty: body.specialty,
      bio: body.bio,
      serviceIds: body.serviceIds,
      status: body.status,
    });
    return NextResponse.json({ doctor });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to update doctor:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to update doctor" },
      { status: 500 }
    );
  }
}
