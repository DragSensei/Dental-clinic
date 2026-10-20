import { DoctorProfile } from "@/features/public/doctor-profile";
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

function DetailFallback() {
  return <main aria-busy="true" aria-label="Loading clinician" className="page-shell min-h-[60vh]"><div className="surface animate-pulse motion-reduce:animate-none overflow-hidden"><div className="bg-brand-subtle p-7 sm:p-10"><div className="size-14 rounded-2xl bg-brand-border" /><div className="mt-6 h-3 w-36 rounded bg-brand-border" /><div className="mt-4 h-10 max-w-md rounded bg-brand-border" /><div className="mt-5 h-5 max-w-2xl rounded bg-brand-border" /></div><div className="p-7 sm:p-10"><div className="h-6 w-56 rounded bg-brand-subtle" /><div className="mt-5 h-11 w-48 rounded bg-brand-subtle" /></div></div></main>;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<DetailFallback />}><ResolvedDoctorPage params={params} /></Suspense>;
}
