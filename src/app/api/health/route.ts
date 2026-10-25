import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/clinic-db";

export async function GET() {
  const health = await checkDatabaseHealth();
  const timestamp = new Date().toISOString();

  if (health.status === "healthy") {
    return NextResponse.json({ ...health, timestamp }, { status: 200 });
  }

  return NextResponse.json({ ...health, timestamp }, { status: 503 });
}
