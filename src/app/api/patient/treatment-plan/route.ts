import { NextRequest, NextResponse } from "next/server";
import { getTreatmentPlan, approveTreatmentPlan } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const treatmentPlan = await getTreatmentPlan(email);
    return NextResponse.json({ treatmentPlan });
  } catch (error) {
    console.error("Error fetching treatment plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const { email, action, signatureDataUrl, signedByName } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (action === "approve") {
      if (!signatureDataUrl || !signedByName) {
        return NextResponse.json(
          { error: "signatureDataUrl and signedByName are required to approve treatment plan" },
          { status: 400 }
        );
      }
      const treatmentPlan = await approveTreatmentPlan(email, signatureDataUrl, signedByName);
      return NextResponse.json({ treatmentPlan });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("Error updating treatment plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
