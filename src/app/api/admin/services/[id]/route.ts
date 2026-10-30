import { NextRequest, NextResponse } from "next/server";
import { updateService } from "@/lib/clinic-db";
import { requireRole, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import prisma from "@/lib/prisma";
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "not_found");
    }

    const flattened = fromServiceInput(parsed);
    const service = await updateService(id, {
      title: flattened.title ?? existing.title,
      description: flattened.description ?? existing.description,
      durationMinutes: flattened.durationMinutes ?? existing.durationMinutes,
      category: flattened.category ?? existing.category,
      image: flattened.image ?? existing.image,
      overview:
        flattened.overview !== undefined
          ? flattened.overview ?? undefined
          : existing.overview ?? undefined,
      procedure:
        flattened.procedure !== undefined
          ? flattened.procedure ?? undefined
          : existing.procedure ?? undefined,
      benefits:
        flattened.benefits !== undefined
          ? flattened.benefits ?? undefined
          : existing.benefits ?? undefined,
      aftercare:
        flattened.aftercare !== undefined
          ? flattened.aftercare ?? undefined
          : existing.aftercare ?? undefined,
    });

    return NextResponse.json({ service: toServiceDTO(service) });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
