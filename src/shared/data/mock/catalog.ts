export type Service = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  serviceIds: readonly string[];
};

export type Appointment = {
  id: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  status: "confirmed" | "cancelled";
};

export type BookingDetails = Omit<Appointment, "id" | "status">;

const landingServices = [
  ["Dental check-ups", "A conversation and examination to understand your oral health and next steps."],
  ["Dental implants", "Explore options for replacing missing teeth with implant-supported restorations."],
  ["Braces & alignment", "Discuss ways to improve tooth alignment and how your teeth meet."],
  ["Teeth whitening", "Learn about dentist-supervised options for lightening the colour of teeth."],
  ["Gum care", "Talk about gum health, cleaning, and everyday oral care."],
  ["Root canal treatment", "Discuss treatment for infection inside a tooth and restoring it afterward."],
  ["Children’s dentistry", "Friendly visits that help children get familiar with dental care."],
  ["Tooth-coloured fillings", "Explore options for restoring teeth affected by cavities or damage."],
  ["Dental imaging", "Understand when dental images may help assess your care needs."],
  ["Crowns & bridges", "Learn about covering damaged teeth or replacing missing ones."],
  ["Wisdom tooth care", "Discuss assessment and next steps for wisdom teeth that cause problems."],
  ["Dental veneers", "Explore thin facings used to change the appearance of teeth."],
] as const;

export const services: readonly Service[] = Object.freeze(landingServices.map(([title, description], index) => Object.freeze({
  id: `service-${index + 1}`,
  title,
  description,
  durationMinutes: index === 0 ? 30 : 45,
})));

export const demoServices = services;

export const demoClinic = Object.freeze({
  name: "Bluehaven Dental",
  address: "12 Example Avenue, New Cairo",
  email: "hi@bluehaven.example",
  phone: "+20 00 0000 0000",
  hours: "Saturday–Thursday, 9:00 AM–7:00 PM UTC (sample)",
  closed: "Friday: closed in the UTC demo schedule",
  team: Object.freeze(["Dr. Layla Hassan", "Dr. Omar Adel", "Dr. Nour Samir", "Dr. Adam Khalil"]),
  metrics: Object.freeze([["Patient visits", "12,500+"], ["Years of experience", "12"], ["Dental team", "4"], ["Care areas", "12"]]),
  testimonials: Object.freeze([
    { name: "Mariam A.", visit: "First visit", quote: "I had time to ask my questions, and every step was explained clearly." },
    { name: "Youssef M.", visit: "Routine check-up", quote: "The welcome was warm, and I left with a better understanding of my next steps." },
    { name: "Salma K.", visit: "Family appointment", quote: "A calm setting and a friendly conversation made planning our visits feel easier." },
  ].map((item) => Object.freeze(item))),
  search: Object.freeze({ area: "New Cairo", visit: "Routine check-up", time: "Monday, 10:30 AM" }),
});

const doctorProfiles = [
  {
    specialty: "General dentistry",
    bio: "Layla focuses on check-ups, gum care, fillings, and practical next steps for everyday dental health.",
    serviceIndexes: [0, 4, 7, 8, 10],
  },
  {
    specialty: "Implant and restorative dentistry",
    bio: "Omar discusses implant care, root canal treatment, and options for restoring or replacing teeth.",
    serviceIndexes: [1, 5, 7, 8, 9],
  },
  {
    specialty: "Orthodontics and cosmetic dentistry",
    bio: "Nour helps patients explore alignment, whitening, and veneer options in a consultation.",
    serviceIndexes: [2, 3, 11],
  },
  {
    specialty: "Family dentistry",
    bio: "Adam welcomes children and families for check-ups, gum care, and restorative conversations.",
    serviceIndexes: [0, 4, 6, 7],
  },
] as const;

export const doctors: readonly Doctor[] = Object.freeze(demoClinic.team.map((name, index) => {
  const profile = doctorProfiles[index];
  return Object.freeze({
    id: `doctor-${index + 1}`,
    name,
    specialty: profile.specialty,
    bio: profile.bio,
    serviceIds: Object.freeze(profile.serviceIndexes.map((serviceIndex) => services[serviceIndex].id)),
  });
}));
