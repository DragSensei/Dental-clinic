import { Suspense } from "react";
import { BookingFlow } from "@/features/booking-flow/booking-flow";

export default function BookPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-6"><p role="status" className="mx-auto max-w-5xl text-muted-foreground">Loading simulated booking…</p></main>}><BookingFlow /></Suspense>;
}
