import { NextRequest, NextResponse } from "next/server";
import { createService, getServices, ClinicError } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const services = await getServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const service = await createService(body);
    return NextResponse.json({ service }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to create service:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create service" },
      { status: 500 }
    );
  }
}
