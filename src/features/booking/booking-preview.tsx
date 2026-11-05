import { LandingHero } from "./landing-hero";
import { CareGuide } from "./care-guide";
import { BeforeAfterComparison } from "./before-after-comparison";
import { PatientSatisfaction } from "./patient-satisfaction";
import { PatientMetrics } from "./patient-metrics";
import { AdvancedCareBanner } from "./advanced-care-banner";
import { ClinicStory } from "./clinic-story";
import { VisitGuide } from "./visit-guide";
import { AppointmentCta } from "./appointment-cta";
import { BookingFaq } from "./booking-faq";
import { ClinicInformation } from "./clinic-information";

export function BookingPreview() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHero />
      <CareGuide />
      <BeforeAfterComparison />
      <PatientSatisfaction />
      <PatientMetrics />
      <AdvancedCareBanner />
      <ClinicStory />
      <VisitGuide />
      <AppointmentCta />
      <BookingFaq />
      <ClinicInformation />
    </main>
  );
}
