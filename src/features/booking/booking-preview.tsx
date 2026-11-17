import { BeforeAfterComparison } from "./before-after-comparison";
import { LandingHero } from "./landing-hero";
import { CareGuide } from "./care-guide";
import { LandingDoctors } from "./landing-doctors";
import { BookingFaq } from "./booking-faq";
import { ClinicInformation } from "./clinic-information";
import { AppointmentCta } from "./appointment-cta";
import { PatientSatisfaction } from "./patient-satisfaction";

export function BookingPreview() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHero />
      <CareGuide />
      <BeforeAfterComparison />
      <LandingDoctors />
      <PatientSatisfaction />
      <section className="scroll-mt-28 border-t border-border bg-secondary/35 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 2xl:px-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <BookingFaq />
          <ClinicInformation />
        </div>
      </section>
      <AppointmentCta />
    </main>
  );
}
