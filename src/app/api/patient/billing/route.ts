import { NextRequest, NextResponse } from "next/server";
import { getPatientInvoices, payPatientInvoice } from "@/lib/clinic-db";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const invoices = await getPatientInvoices(email);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching patient invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request | NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const { invoiceId, paymentMethod } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const invoice = await payPatientInvoice(invoiceId, paymentMethod || "card");
    return NextResponse.json({ invoice });
  } catch (error: unknown) {
    console.error("Error paying patient invoice:", error);
    if ((error as Error)?.message === "Invoice not found") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
