import { NextRequest, NextResponse } from "next/server";
import { getAccounts } from "@/lib/clinic-db";
import { requireRole, HttpError } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAccountSchema } from "@/lib/clinic-schemas";
import { toAccountDTO } from "@/lib/clinic-mappers";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const accounts = await getAccounts();
    return NextResponse.json({ accounts: accounts.map(toAccountDTO) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const body = await request.json();
    const parsed = createAccountSchema.parse(body);

    const res = await auth.api
      .createUser({
        body: {
          name: parsed.name,
          email: parsed.email,
          password: parsed.password || process.env.SEED_DEMO_PASSWORD || "ClinicDemo2026!",
          role: parsed.role as unknown as "admin" | "user",
          data: {
            phone: parsed.phone || null,
            status: parsed.status || "active",
          },
        },
        headers: request.headers,
      })
      .catch((err: unknown) => {
        const errorObj = err as { status?: number; code?: string; message?: string } | null;
        if (
          errorObj?.status === 400 ||
          errorObj?.code === "USER_ALREADY_EXISTS" ||
          errorObj?.message?.includes("already exists")
        ) {
          throw new HttpError(409, "conflict");
        }
        throw err;
      });

    const user =
      (res as { user?: { id?: string; name?: string; email?: string } })?.user ??
      (res as { id?: string });
    if (!user || !user.id) {
      throw new HttpError(400, "user_creation_failed");
    }

    if (parsed.role === "doctor") {
      try {
        await prisma.$transaction(async (tx) => {
          const doctor = await tx.doctor.create({
            data: {
              userId: user.id,
              name: parsed.name,
              specialty: parsed.specialty || "General Dentistry",
              bio: parsed.bio || "",
              status: parsed.status || "active",
            },
          });

          if (parsed.serviceIds && parsed.serviceIds.length > 0) {
            const services = await tx.service.findMany({
              where: { id: { in: parsed.serviceIds } },
            });
            if (services.length !== parsed.serviceIds.length) {
              throw new HttpError(422, "invalid_reference");
            }
            await tx.doctorService.createMany({
              data: parsed.serviceIds.map((serviceId) => ({
                doctorId: doctor.id,
                serviceId,
              })),
            });
          }
        });
      } catch (err) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => null);
        throw err;
      }
    }

    const createdRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { doctorProfile: { include: { services: true } } },
    });

    const accountDTO = createdRecord ? toAccountDTO(createdRecord) : toAccountDTO({
      id: user.id,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      role: parsed.role,
      status: parsed.status || "active",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({ account: accountDTO }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
