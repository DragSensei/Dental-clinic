import { NextRequest, NextResponse } from "next/server";
import { ClinicError, getPatientInvoices, payPatientInvoice } from "@/lib/clinic-db";
import { requireSession, resolvePatientEmail } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { payInvoiceSchema } from "@/lib/clinic-schemas";
import { toInvoiceDTO } from "@/lib/clinic-mappers";

export async function GET(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const email = resolvePatientEmail(user, searchParams.get("email"));

    const invoices = await getPatientInvoices(email);
    return NextResponse.json({ invoices: invoices.map(toInvoiceDTO) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request | NextRequest) {
  try {
    const user = await requireSession(request);
    const body = await request.json();
    const parsed = payInvoiceSchema.parse(body);

    const updatedInvoice = await payPatientInvoice(parsed.invoiceId, parsed.paymentMethod, user.email);
    if (!updatedInvoice) {
      throw new ClinicError("invoice_not_found");
    }
    return NextResponse.json({ invoice: toInvoiceDTO(updatedInvoice) });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
