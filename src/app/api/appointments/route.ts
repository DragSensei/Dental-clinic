import { NextRequest, NextResponse } from "next/server";
import { getAppointments, bookAppointment } from "@/lib/clinic-db";
import { requireSession, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getAppointmentsQuerySchema,
  bookAppointmentSchema,
} from "@/lib/clinic-schemas";
import { toAppointmentDTO } from "@/lib/clinic-mappers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSession(request);
    const searchParams =
      request.nextUrl?.searchParams ?? new URL(request.url).searchParams;
    const query = getAppointmentsQuerySchema.parse({
      email: searchParams.get("email") || undefined,
      doctorId: searchParams.get("doctorId") || undefined,
      date: searchParams.get("date") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      status: searchParams.get("status") || undefined,
    });

    let email: string | undefined;
    const date = query.date;
    let fromDate = query.from;
    let toDate = query.to;
    const doctorId = query.doctorId;
    const status = query.status;

    if (user.role === "patient") {
      email = user.email;
    } else {
      email = query.email;
      if (!date && !fromDate && !toDate) {
        const now = new Date();
        fromDate = now.toISOString().slice(0, 10);
        const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        toDate = future.toISOString().slice(0, 10);
      }
    }

    const appointments = await getAppointments({
      email,
      doctorId,
      date,
      fromDate,
      toDate,
      status,
      take: 200,
    });
    return NextResponse.json({ appointments: appointments.map(toAppointmentDTO) });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`appointments:${ip}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new HttpError(429, "rate_limited");
    }

    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const u = session?.user as (Record<string, unknown> | undefined);
    const body = await request.json();
    const parsed = bookAppointmentSchema.parse(body);

    let email = parsed.email;
    if (u && (u.role === "patient" || !u.role)) {
      email = String(u.email).trim().toLowerCase();
    }
    if (!email) {
      throw new HttpError(400, "email_required");
    }

    const appointment = await bookAppointment({
      ...parsed,
      email,
    });

    return NextResponse.json({ appointment: toAppointmentDTO(appointment) }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
