import { NextRequest, NextResponse } from "next/server";
import { getPatientInvoices, payPatientInvoice } from "@/lib/clinic-db";
import { requireSession, resolvePatientEmail, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
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

    const invoice = await prisma.patientInvoice.findUnique({
      where: { id: parsed.invoiceId },
    });
    if (!invoice) {
      throw new HttpError(404, "not_found");
    }

    if (invoice.patientEmail !== user.email) {
      throw new HttpError(404, "not_found");
    }

    const updatedInvoice = await payPatientInvoice(parsed.invoiceId, parsed.paymentMethod, user.email);
    if (!updatedInvoice) {
      throw new HttpError(404, "not_found");
    }
    return NextResponse.json({ invoice: toInvoiceDTO(updatedInvoice) });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
