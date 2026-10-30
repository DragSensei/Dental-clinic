import { NextRequest, NextResponse } from "next/server";
import { getAvailableDates, getAvailableSlots } from "@/lib/clinic-db";
import { toErrorResponse } from "@/lib/http";
import { availabilityQuerySchema } from "@/lib/clinic-schemas";

export async function GET(request: NextRequest) {
  try {
    const searchParams =
      request.nextUrl?.searchParams ?? new URL(request.url).searchParams;
    const parsed = availabilityQuerySchema.parse({
      serviceId: searchParams.get("serviceId"),
      doctorId: searchParams.get("doctorId"),
      date: searchParams.get("date") || undefined,
    });

    if (parsed.date) {
      const slots = await getAvailableSlots(parsed.serviceId, parsed.doctorId, parsed.date);
      return NextResponse.json({ slots });
    }

    const dates = await getAvailableDates(parsed.serviceId, parsed.doctorId);
    return NextResponse.json({ dates });
  } catch (error) {
    return toErrorResponse(error);
  }
}
