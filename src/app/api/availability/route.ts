import { NextRequest, NextResponse } from "next/server";
import { getAvailableDates, getAvailableSlots } from "@/lib/clinic-db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get("serviceId");
  const doctorId = searchParams.get("doctorId");
  const date = searchParams.get("date");

  if (!serviceId || !doctorId) {
    return NextResponse.json(
      { error: "serviceId and doctorId query parameters are required" },
      { status: 400 }
    );
  }

  try {
    if (date) {
      const slots = await getAvailableSlots(serviceId, doctorId, date);
      return NextResponse.json({ slots });
    }

    const dates = await getAvailableDates(serviceId, doctorId);
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
