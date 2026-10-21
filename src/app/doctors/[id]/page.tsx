import { DoctorProfile, DoctorProfileFallback } from "@/features/public/doctor-profile";
import { doctors } from "@/shared/data/mock/catalog";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return doctors.map(({ id }) => ({ id }));
}


async function ResolvedDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!doctors.some((doctor) => doctor.id === id)) notFound();
  return <DoctorProfile id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<DoctorProfileFallback />}><ResolvedDoctorPage params={params} /></Suspense>;
}
