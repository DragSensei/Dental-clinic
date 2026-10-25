import { NextRequest, NextResponse } from "next/server";
import { getAccounts, createAccount, ClinicError } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const accounts = await getAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const account = await createAccount(body);
    return NextResponse.json({ account }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ClinicError) {
      return NextResponse.json({ error: err.code }, { status: 400 });
    }
    console.error("Failed to create account:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
