import { NextRequest, NextResponse } from "next/server";
import { updateService } from "@/lib/clinic-db";
import { requireRole } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { updateServiceSchema } from "@/lib/clinic-schemas";
import { toServiceDTO, fromServiceInput } from "@/lib/clinic-mappers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateServiceSchema.parse(body);

    const flattened = fromServiceInput(parsed);
    const service = await updateService(id, flattened);

    return NextResponse.json({ service: toServiceDTO(service) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
