import { NextRequest, NextResponse } from "next/server";
import {
  getClinicWorkingHours,
  updateClinicWorkingHours,
  ClinicError,
} from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const workingHours = await getClinicWorkingHours();
    return NextResponse.json({ workingHours });
  } catch (error) {
    console.error("Failed to fetch working hours:", error);
    return NextResponse.json(
      { error: "Failed to fetch working hours" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const items = Array.isArray(body) ? body : body?.workingHours;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid working hours format; array expected" },
        { status: 400 }
      );
    }

    const workingHours = await updateClinicWorkingHours(items);
    return NextResponse.json({ workingHours });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to update working hours:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to update working hours" },
      { status: 500 }
    );
  }
}
