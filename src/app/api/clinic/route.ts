import { NextResponse } from "next/server";
import { getServices, getDoctors, getClinicWorkingHours } from "@/lib/clinic-db";
import { toErrorResponse } from "@/lib/http";
import { toServiceDTO, toDoctorDTO } from "@/lib/clinic-mappers";

export async function GET() {
  try {
    const [services, doctors, workingHours] = await Promise.all([
      getServices(),
      getDoctors(),
      getClinicWorkingHours(),
    ]);

    return NextResponse.json({
      services: services.map(toServiceDTO),
      doctors: doctors.map(toDoctorDTO),
      workingHours,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
