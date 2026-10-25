import { NextRequest, NextResponse } from "next/server";
import { getAppointments, bookAppointment, ClinicError } from "@/lib/clinic-db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;

    const appointments = await getAppointments({ email, doctorId, date, status });
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      doctorId,
      date,
      time,
      patientName,
      email,
      phone,
      note,
      reasonCategory,
    } = body;

    const appointment = await bookAppointment({
      serviceId,
      doctorId,
      date,
      time,
      patientName,
      email,
      phone,
      note,
      reasonCategory,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to book appointment:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}
