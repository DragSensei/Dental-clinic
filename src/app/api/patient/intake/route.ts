import { NextRequest, NextResponse } from "next/server";
import { getPatientIntakeForm, upsertPatientIntakeForm } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const intakeForm = await getPatientIntakeForm(email);
    return NextResponse.json({ intakeForm });
  } catch (error) {
    console.error("Error fetching patient intake form:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const {
      email,
      phone,
      emergencyContact,
      noChangesVerified,
      insuranceEnabled,
      insuranceProvider,
      insuranceMemberId,
      conditions,
      allergies,
      medications,
      consentSigned,
      signatureDataUrl,
      signedByName,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const intakeForm = await upsertPatientIntakeForm(email, {
      phone: phone || "",
      emergencyContact: emergencyContact || "",
      noChangesVerified,
      insuranceEnabled,
      insuranceProvider,
      insuranceMemberId,
      conditions: Array.isArray(conditions) ? conditions : [],
      allergies: Array.isArray(allergies) ? allergies : [],
      medications,
      consentSigned,
      signatureDataUrl,
      signedByName,
    });

    return NextResponse.json({ intakeForm });
  } catch (error) {
    console.error("Error upserting patient intake form:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
