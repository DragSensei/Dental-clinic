import { NextRequest, NextResponse } from "next/server";
import { getVisitCareSummaries } from "@/lib/clinic-db";
import { requireSession, resolvePatientEmail } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { toCareSummaryDTO } from "@/lib/clinic-mappers";

export async function GET(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const email = resolvePatientEmail(user, searchParams.get("email"));

    const careSummaries = await getVisitCareSummaries(email);
    return NextResponse.json({ careSummaries: careSummaries.map(toCareSummaryDTO) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
