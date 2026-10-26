import { NextRequest, NextResponse } from "next/server";
import {
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointmentAttendance,
} from "@/lib/clinic-db";
import { requireSession, isStaff, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
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

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      throw new HttpError(404, "not_found");
    }

    if (!isStaff(user) && appt.email !== user.email) {
      throw new HttpError(404, "not_found");
    }

    let appointment;
    if (parsed.action === "cancel") {
      appointment = await cancelAppointment(id, isStaff(user));
    } else if (parsed.action === "reschedule") {
      appointment = await rescheduleAppointment(id, parsed.date, parsed.time, isStaff(user));
    } else {
      if (appt.email !== user.email) {
        throw new HttpError(403, "forbidden");
      }
      appointment = await confirmAppointmentAttendance(id);
    }

    return NextResponse.json({ appointment: toAppointmentDTO(appointment) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
