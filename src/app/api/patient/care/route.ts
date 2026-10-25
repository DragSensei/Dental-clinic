import { NextRequest, NextResponse } from "next/server";
import { getVisitCareSummaries } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const careSummaries = await getVisitCareSummaries(email);
    return NextResponse.json({ careSummaries });
  } catch (error) {
    console.error("Error fetching visit care summaries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
