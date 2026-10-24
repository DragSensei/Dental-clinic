import { Suspense } from "react";
import { BookingFallback, BookingFlow } from "@/features/booking-flow/booking-flow";

export default function BookPage() {
  return <Suspense fallback={<BookingFallback />}><BookingFlow /></Suspense>;
}
