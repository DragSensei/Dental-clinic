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
      titleAr: serviceInput.titleAr,
      description: serviceInput.description ?? parsed.description,
      descriptionAr: serviceInput.descriptionAr,
      defaultLocale: serviceInput.defaultLocale ?? parsed.defaultLocale,
      durationMinutes: serviceInput.durationMinutes ?? parsed.durationMinutes,
      category: serviceInput.category ?? parsed.category,
      image: serviceInput.image ?? parsed.image,
      overview: serviceInput.overview,
      overviewAr: serviceInput.overviewAr,
      procedure: serviceInput.procedure,
      procedureAr: serviceInput.procedureAr,
      benefits: serviceInput.benefits,
      benefitsAr: serviceInput.benefitsAr,
      aftercare: serviceInput.aftercare,
      aftercareAr: serviceInput.aftercareAr,
    });
    return NextResponse.json({ service: toServiceDTO(service) }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
