import { NextRequest, NextResponse } from "next/server";
import {
  getClinicWorkingHours,
  updateClinicWorkingHours,
} from "@/lib/clinic-db";
import { requireRole } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { workingHoursBodySchema } from "@/lib/clinic-schemas";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const workingHours = await getClinicWorkingHours();
    return NextResponse.json({ workingHours });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const body = await request.json();
    const items = workingHoursBodySchema.parse(body);

    const workingHours = await updateClinicWorkingHours(items);
    return NextResponse.json({ workingHours });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
