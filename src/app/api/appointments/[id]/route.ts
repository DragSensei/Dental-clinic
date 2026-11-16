import { NextRequest, NextResponse } from "next/server";
import {
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointmentAttendance,
} from "@/lib/clinic-db";
import { requireSession, isStaff } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { patchAppointmentSchema } from "@/lib/clinic-schemas";
import { toAppointmentDTO } from "@/lib/clinic-mappers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = patchAppointmentSchema.parse(body);

    let appointment;
    if (parsed.action === "cancel") {
      appointment = await cancelAppointment(id, isStaff(user), user.email);
    } else if (parsed.action === "reschedule") {
      appointment = await rescheduleAppointment(id, parsed.date, parsed.time, isStaff(user), user.email);
    } else {
      appointment = await confirmAppointmentAttendance(id, { email: user.email, isStaff: isStaff(user) });
    }

    return NextResponse.json({ appointment: toAppointmentDTO(appointment) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
