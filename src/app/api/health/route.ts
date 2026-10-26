import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/clinic-db";

export async function GET() {
  const health = await checkDatabaseHealth();
  const timestamp = new Date().toISOString();

  if (health.status === "healthy") {
    return NextResponse.json({ status: "healthy", timestamp }, { status: 200 });
  }

  return NextResponse.json({ status: "unhealthy", timestamp }, { status: 503 });
}
