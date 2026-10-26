import { NextRequest, NextResponse } from "next/server";
import { createService, getServices } from "@/lib/clinic-db";
import { requireRole } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { createServiceSchema } from "@/lib/clinic-schemas";
import { toServiceDTO, fromServiceInput } from "@/lib/clinic-mappers";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const services = await getServices();
    return NextResponse.json({ services: services.map(toServiceDTO) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const body = await request.json();
    const parsed = createServiceSchema.parse(body);
    const serviceInput = fromServiceInput(parsed);
    const service = await createService({
      title: serviceInput.title ?? parsed.title,
      description: serviceInput.description ?? parsed.description,
      durationMinutes: serviceInput.durationMinutes ?? parsed.durationMinutes,
      category: serviceInput.category ?? parsed.category,
      image: serviceInput.image ?? parsed.image,
      overview: serviceInput.overview ?? undefined,
      procedure: serviceInput.procedure ?? undefined,
      benefits: serviceInput.benefits ?? undefined,
      aftercare: serviceInput.aftercare ?? undefined,
    });
    return NextResponse.json({ service: toServiceDTO(service) }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
