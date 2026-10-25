import { NextResponse } from "next/server";
import { getServices, getDoctors, getClinicWorkingHours } from "@/lib/clinic-db";

export async function GET() {
  try {
    const [services, doctors, workingHours] = await Promise.all([
      getServices(),
      getDoctors(),
      getClinicWorkingHours(),
    ]);

    return NextResponse.json({ services, doctors, workingHours });
  } catch (error) {
    console.error("Failed to fetch clinic catalog:", error);
    return NextResponse.json({ error: "Failed to fetch clinic catalog" }, { status: 500 });
  }
}
