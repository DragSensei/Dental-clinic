import { BeforeAfterComparison } from "./before-after-comparison";
import { LandingHero } from "./landing-hero";
import { CareGuide } from "./care-guide";
import { VisitGuide } from "./visit-guide";
import { BookingFaq } from "./booking-faq";
import { ClinicInformation } from "./clinic-information";
import { ClinicStory } from "./clinic-story";
import { AppointmentCta } from "./appointment-cta";
import { PatientSatisfaction } from "./patient-satisfaction";
import { PatientMetrics } from "./patient-metrics";
import { AdvancedCareBanner } from "./advanced-care-banner";

export function BookingPreview() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHero />
      <PatientSatisfaction />
      <PatientMetrics />
      <AdvancedCareBanner />
      <ClinicStory />
      <CareGuide />
      <BeforeAfterComparison />
      <VisitGuide />
      <AppointmentCta />
      <BookingFaq />
      <ClinicInformation />
    </main>
  );
}
