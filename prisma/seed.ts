import prisma from "../src/lib/prisma";
import {
  services,
  doctors,
  demoAccounts,
  mariamIntakeForm,
  mariamTreatmentPlan,
  mariamVisitCareSummary,
  mariamInvoice,
} from "../src/data/mock/catalog";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed ClinicWorkingHours (Sunday: 0, Monday: 1, ..., Friday: 5 (closed), Saturday: 6)
  console.log("Seeding clinic working hours...");
  for (let day = 0; day <= 6; day += 1) {
    const isClosed = day === 5; // Friday closed
    await prisma.clinicWorkingHours.upsert({
      where: { dayOfWeek: day },
      update: {
        isClosed,
        startTime: "09:00",
        endTime: "16:45",
        slotIntervalMinutes: 45,
      },
      create: {
        dayOfWeek: day,
        isClosed,
        startTime: "09:00",
        endTime: "16:45",
        slotIntervalMinutes: 45,
      },
    });
  }

  // 2. Seed Services
  console.log("Seeding services...");
  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        title: s.title,
        description: s.description,
        durationMinutes: s.durationMinutes,
        category: s.category,
        image: s.image,
        overview: s.extendedDetails?.overview,
        procedure: s.extendedDetails?.procedure,
        benefits: s.extendedDetails?.benefits,
        aftercare: s.extendedDetails?.aftercare,
      },
      create: {
        id: s.id,
        title: s.title,
        description: s.description,
        durationMinutes: s.durationMinutes,
        category: s.category,
        image: s.image,
        overview: s.extendedDetails?.overview,
        procedure: s.extendedDetails?.procedure,
        benefits: s.extendedDetails?.benefits,
        aftercare: s.extendedDetails?.aftercare,
      },
    });
  }

  // 3. Seed Users & Doctors
  console.log("Seeding users & doctors...");
  for (const acc of demoAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email.toLowerCase() },
      update: {
        name: acc.name,
        role: acc.role,
        status: acc.status,
        phone: acc.phone,
      },
      create: {
        name: acc.name,
        email: acc.email.toLowerCase(),
        role: acc.role,
        status: acc.status,
        phone: acc.phone,
      },
    });

    if (acc.role === "doctor") {
      const docFixture = doctors.find((d) => d.name === acc.name);
      if (docFixture) {
        const doctor = await prisma.doctor.upsert({
          where: { id: docFixture.id },
          update: {
            userId: user.id,
            name: docFixture.name,
            specialty: docFixture.specialty,
            bio: docFixture.bio,
            status: "active",
          },
          create: {
            id: docFixture.id,
            userId: user.id,
            name: docFixture.name,
            specialty: docFixture.specialty,
            bio: docFixture.bio,
            status: "active",
          },
        });

        // DoctorService relations
        await prisma.doctorService.deleteMany({ where: { doctorId: doctor.id } });
        await prisma.doctorService.createMany({
          data: docFixture.serviceIds.map((serviceId) => ({
            doctorId: doctor.id,
            serviceId,
          })),
        });
      }
    }
  }

  // 4. Seed Mariam's Patient Intake Form
  console.log("Seeding Mariam's intake form...");
  await prisma.patientIntakeForm.upsert({
    where: { patientEmail: mariamIntakeForm.patientEmail.toLowerCase() },
    update: {
      phone: mariamIntakeForm.phone,
      emergencyContact: mariamIntakeForm.emergencyContact,
      noChangesVerified: mariamIntakeForm.noChangesVerified,
      insuranceEnabled: mariamIntakeForm.insuranceScaffold.enabled,
      conditions: [...mariamIntakeForm.conditions],
      allergies: [...mariamIntakeForm.allergies],
      medications: mariamIntakeForm.medications,
      consentSigned: mariamIntakeForm.consentSigned,
      signatureDataUrl: mariamIntakeForm.signatureDataUrl,
      signedByName: mariamIntakeForm.signedByName,
    },
    create: {
      patientEmail: mariamIntakeForm.patientEmail.toLowerCase(),
      phone: mariamIntakeForm.phone,
      emergencyContact: mariamIntakeForm.emergencyContact,
      noChangesVerified: mariamIntakeForm.noChangesVerified,
      insuranceEnabled: mariamIntakeForm.insuranceScaffold.enabled,
      conditions: [...mariamIntakeForm.conditions],
      allergies: [...mariamIntakeForm.allergies],
      medications: mariamIntakeForm.medications,
      consentSigned: mariamIntakeForm.consentSigned,
      signatureDataUrl: mariamIntakeForm.signatureDataUrl,
      signedByName: mariamIntakeForm.signedByName,
    },
  });

  // 5. Seed Mariam's Treatment Plan & Teeth
  console.log("Seeding Mariam's treatment plan...");
  const plan = await prisma.treatmentPlan.upsert({
    where: { patientEmail: mariamTreatmentPlan.patientEmail.toLowerCase() },
    update: {
      doctorId: mariamTreatmentPlan.doctorId,
      status: mariamTreatmentPlan.status,
      signatureDataUrl: mariamTreatmentPlan.signatureDataUrl,
      signedByName: mariamTreatmentPlan.signedByName,
    },
    create: {
      id: mariamTreatmentPlan.id,
      patientEmail: mariamTreatmentPlan.patientEmail.toLowerCase(),
      doctorId: mariamTreatmentPlan.doctorId,
      status: mariamTreatmentPlan.status,
      signatureDataUrl: mariamTreatmentPlan.signatureDataUrl,
      signedByName: mariamTreatmentPlan.signedByName,
    },
  });

  await prisma.toothRecord.deleteMany({ where: { treatmentPlanId: plan.id } });
  await prisma.toothRecord.createMany({
    data: mariamTreatmentPlan.teeth.map((t) => ({
      treatmentPlanId: plan.id,
      toothNumber: t.toothNumber,
      label: t.label,
      status: t.status,
      condition: t.condition,
      proposedTreatment: t.proposedTreatment,
      phaseOrder: t.phaseOrder,
      xrayNote: t.xrayNote,
    })),
  });

  await prisma.treatmentPhase.deleteMany({ where: { treatmentPlanId: plan.id } });
  for (const ph of mariamTreatmentPlan.phases) {
    await prisma.treatmentPhase.create({
      data: {
        id: ph.id,
        treatmentPlanId: plan.id,
        order: ph.order,
        priority: ph.priority,
        title: ph.title,
        description: ph.description,
        toothNumber: ph.toothNumber,
        serviceId: ph.serviceId,
        durationMinutes: ph.durationMinutes,
        totalFeeEgp: ph.totalFeeEgp,
        insuranceScaffoldNote: ph.insuranceScaffoldNote,
        outOfPocketEgp: ph.outOfPocketEgp,
      },
    });
  }

  // 6. Seed Mariam's Care Summaries
  console.log("Seeding Mariam's care summaries...");
  for (const cs of [mariamVisitCareSummary]) {
    const existing = await prisma.visitCareSummary.findUnique({ where: { id: cs.id } });
    if (!existing) {
      await prisma.visitCareSummary.create({
        data: {
          id: cs.id,
          patientEmail: cs.patientEmail.toLowerCase(),
          visitDate: cs.visitDate,
          doctorId: cs.doctorId,
          serviceId: cs.serviceId,
          whatWasDone: cs.whatWasDone,
          postOpInstructions: [...cs.postOpInstructions],
          prescriptions: {
            create: cs.prescriptions.map((p) => ({
              id: p.id,
              medication: p.medication,
              dosage: p.dosage,
              frequency: p.frequency,
              durationDays: p.durationDays,
              instructions: p.instructions,
            })),
          },
        },
      });
    }
  }

  // 7. Seed Mariam's Invoices
  console.log("Seeding Mariam's invoices...");
  for (const inv of [mariamInvoice]) {
    const existing = await prisma.patientInvoice.findUnique({ where: { id: inv.id } });
    if (!existing) {
      await prisma.patientInvoice.create({
        data: {
          id: inv.id,
          patientEmail: inv.patientEmail.toLowerCase(),
          issuedDate: inv.issuedDate,
          doctorId: inv.doctorId,
          totalFeeEgp: inv.totalFeeEgp,
          paidAmountEgp: inv.paidAmountEgp,
          balanceEgp: inv.balanceEgp,
          status: inv.status,
          nextInstallmentDate: inv.nextInstallmentDate,
          items: {
            create: inv.items.map((it) => ({
              id: it.id,
              procedure: it.procedure,
              tooth: it.tooth,
              feeEgp: it.feeEgp,
            })),
          },
        },
      });
    }
  }

  // 8. Seed Sample Appointment
  console.log("Seeding sample appointment...");
  const sampleDate = new Date();
  sampleDate.setDate(sampleDate.getDate() + 2);
  // Avoid Friday
  if (sampleDate.getDay() === 5) sampleDate.setDate(sampleDate.getDate() + 1);
  const dateStr = sampleDate.toISOString().slice(0, 10);

  const existingApp = await prisma.appointment.findFirst({
    where: { email: "mariam.a@example.com" },
  });
  if (!existingApp) {
    await prisma.appointment.create({
      data: {
        id: "demo-mariam-upcoming",
        serviceId: "service-1",
        doctorId: "doctor-1",
        date: dateStr,
        time: "10:30",
        durationMinutes: 30,
        patientName: "Mariam Ahmed",
        email: "mariam.a@example.com",
        phone: "+20 10 1234 5678",
        status: "confirmed",
        attendanceConfirmed: false,
        reasonCategory: "new-exam",
        note: "Routine follow up and dental evaluation.",
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
