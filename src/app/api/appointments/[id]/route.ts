import { NextRequest, NextResponse } from "next/server";
import {
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointmentAttendance,
  ClinicError,
} from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser(request);
    const { id } = await params;
    const body = await request.json();
    const { action, isStaff, date, time } = body;

    let appointment;
    if (action === "cancel") {
      appointment = await cancelAppointment(id, Boolean(isStaff));
    } else if (action === "reschedule") {
      if (!date || !time) {
        return NextResponse.json(
          { error: "date and time are required for rescheduling" },
          { status: 400 }
        );
      }
      appointment = await rescheduleAppointment(id, date, time);
    } else if (action === "confirm_attendance") {
      appointment = await confirmAppointmentAttendance(id);
    } else {
      return NextResponse.json(
        { error: `Unsupported action: ${action}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to update appointment:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}
