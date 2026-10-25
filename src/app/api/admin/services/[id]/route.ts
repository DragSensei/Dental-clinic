import { NextRequest, NextResponse } from "next/server";
import { updateService, ClinicError } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser(request);
    const { id } = await params;
    const body = await request.json();
    const service = await updateService(id, body);
    return NextResponse.json({ service });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to update service:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to update service" },
      { status: 500 }
    );
  }
}
