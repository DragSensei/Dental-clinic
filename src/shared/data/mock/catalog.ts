export type ServiceExtendedDetails = {
  overview: string;
  procedure: string;
  benefits: string;
  aftercare: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: string;
  image: string;
  extendedDetails?: ServiceExtendedDetails;
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

export type AccountRole = "doctor" | "patient" | "admin";
export type AccountStatus = "active" | "inactive";

export type Account = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  specialty?: string;
  bio?: string;
  serviceIds?: readonly string[];
  createdAt: string;
};

const landingServices = [
  {
    title: "Dental check-ups",
    description: "A conversation and examination to understand your oral health and next steps.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "A comprehensive examination of teeth, gums, and soft tissues designed to identify early signs of wear, decay, or periodontal changes.",
      procedure: "Digital charting, gentle periodontal probing, high-definition intraoral camera photos, and ultra-low dose digital radiographs when necessary.",
      benefits: "Catches minor issues before they become painful or expensive, preserves natural teeth, and guarantees fresh breath.",
      aftercare: "Brush twice daily for two full minutes with fluoridated toothpaste, floss daily, and schedule regular evaluations every 6 months.",
    },
  },
  {
    title: "Dental implants",
    description: "Explore options for replacing missing teeth with implant-supported restorations.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "The gold standard for permanent tooth replacement, restoring full functionality, biting power, and natural aesthetics.",
      procedure: "Computer-guided placement of surgical-grade titanium posts into the jawbone, followed by custom-milled porcelain crown placement after osseointegration.",
      benefits: "Prevents bone resorption in the jaw, does not harm neighboring healthy teeth, and delivers a lifetime of confident chewing.",
      aftercare: "Practice gentle brushing around the implant site, use interdental floss or water flossers, and attend bi-annual implant check-ups.",
    },
  },
  {
    title: "Braces & alignment",
    description: "Discuss ways to improve tooth alignment and how your teeth meet.",
    category: "Orthodontics",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Personalized orthodontic treatments utilizing discreet clear aligners or precision ceramic braces to straighten teeth and harmonize bite mechanics.",
      procedure: "Full 3D intraoral digital mapping to simulate teeth movement stages, followed by tailored aligner trays changed bi-weekly.",
      benefits: "Alleviates jaw joint tension, makes brushing significantly easier, prevents uneven tooth wear, and boosts smile confidence.",
      aftercare: "Wear aligners 20–22 hours per day, rinse trays with lukewarm water, and wear your custom retainer nightly following alignment.",
    },
  },
  {
    title: "Teeth whitening",
    description: "Learn about dentist-supervised options for lightening the colour of teeth.",
    category: "Cosmetic Dentistry",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Professional in-clinic light-activated whitening engineered to lift stubborn stains while safeguarding enamel integrity and minimizing sensitivity.",
      procedure: "Application of protective gum dams, followed by controlled pH-balanced whitening gel activated with specialized cool-blue LED lights for 45 minutes.",
      benefits: "Brightens teeth up to 8 shades in a single appointment, eliminates coffee/tea discoloration, and delivers instant visible results.",
      aftercare: "Follow the 'white diet' (avoid coffee, dark sauces, red wine, and smoking) for 48 hours to lock in optimal brightness.",
    },
  },
  {
    title: "Gum care",
    description: "Talk about gum health, cleaning, and everyday oral care.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Specialized periodontal therapy and deep ultrasonic scaling dedicated to arresting gum inflammation and preventing bone loss.",
      procedure: "Subgingival plaque and calculus removal with micro-vibrational ultrasonic tips and soothing antimicrobial pocket irrigation.",
      benefits: "Stops bleeding and tender gums, resolves persistent halitosis, and protects the biological foundation anchoring your teeth.",
      aftercare: "Use soft-bristled brushes angled at 45 degrees, rinse with prescribed antiseptic wash for 7 days, and maintain 3-month cleanings.",
    },
  },
  {
    title: "Root canal treatment",
    description: "Discuss treatment for infection inside a tooth and restoring it afterward.",
    category: "Oral Surgery & Endodontics",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "A tooth-saving procedure that relieves acute dental pain, eliminates deep bacterial infection, and sterilizes the inner pulp chamber.",
      procedure: "Complete numbing for a painless experience, microscopic canal cleaning, disinfection, and biocompatible hermetic sealing.",
      benefits: "Prevents tooth loss and extraction, eradicates severe throbbing pain, and preserves the natural tooth structure in your arch.",
      aftercare: "Avoid biting down on hard foods on the treated side until the permanent protective crown is placed by your dentist.",
    },
  },
  {
    title: "Children’s dentistry",
    description: "Friendly visits that help children get familiar with dental care.",
    category: "Pediatric Dentistry",
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Gentle, fear-free pediatric dental care tailored to children’s developing teeth, emphasizing trust and positive oral health habits.",
      procedure: "Friendly 'tell-show-do' approach, gentle cleaning, protective fluoride application, and BPA-free groove sealants.",
      benefits: "Protects against early childhood cavities, monitors eruption patterns, and ensures kids look forward to dental appointments.",
      aftercare: "Supervise tooth brushing until age 8, encourage healthy hydration over sugary drinks, and keep dental visits cheerful and routine.",
    },
  },
  {
    title: "Tooth-coloured fillings",
    description: "Explore options for restoring teeth affected by cavities or damage.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Mercury-free composite restorations precisely tinted to match your natural tooth shade, restoring strength and appearance.",
      procedure: "Minimally invasive decay removal, adhesive conditioning, and incremental layered composite placement cured instantly with light.",
      benefits: "Blends seamlessly with natural enamel, chemically adheres to strengthen the remaining tooth, and allows immediate eating.",
      aftercare: "Maintain everyday oral hygiene. Mild sensitivity to cold may occur for 24–48 hours as the tooth recovers.",
    },
  },
  {
    title: "Dental imaging",
    description: "Understand when dental images may help assess your care needs.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "High-resolution digital diagnostics including panoramic OPG and 3D Cone Beam CT scans with 90% less radiation than conventional films.",
      procedure: "Fast, comfortable upright scan completed in under 15 seconds without any uncomfortable sensor trays in your mouth.",
      benefits: "Detects hidden cysts, impactions, sinus proximity, and bone density with crystal-clear millimeter precision.",
      aftercare: "No recovery or downtime needed. Images are instantly available on high-definition operatory screens for collaborative review.",
    },
  },
  {
    title: "Crowns & bridges",
    description: "Learn about covering damaged teeth or replacing missing ones.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Precision-milled all-ceramic and zirconia crowns and fixed bridges designed to reinforce cracked teeth or bridge tooth gaps.",
      procedure: "Digital 3D optical scan of the prepared tooth, temporary placement, and bonding of the customized laboratory porcelain prosthesis.",
      benefits: "Restores full chewing power, protects weakened root-canal-treated teeth from catastrophic fractures, and looks stunning.",
      aftercare: "Floss daily around margins and under bridge pontics using specialized floss threaders to maintain healthy surrounding gums.",
    },
  },
  {
    title: "Wisdom tooth care",
    description: "Discuss assessment and next steps for wisdom teeth that cause problems.",
    category: "Oral Surgery & Endodontics",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Expert surgical evaluation and comfortable extraction of partially erupted, impacted, or painful third molars.",
      procedure: "Precise nerve mapping with 3D imaging, profound localized anesthesia or conscious sedation, and minimally traumatic tooth removal.",
      benefits: "Stops recurrent gum infections, prevents orthodontic crowding relapse, and protects adjacent second molars from decay.",
      aftercare: "Bite gently on sterile gauze for 45 minutes, consume chilled soft foods, avoid hot liquids or straws for 72 hours.",
    },
  },
  {
    title: "Dental veneers",
    description: "Explore thin facings used to change the appearance of teeth.",
    category: "Cosmetic Dentistry",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Ultra-thin, handcrafted porcelain veneers designed to transform smile symmetry, shade, and proportion.",
      procedure: "Digital smile design preview, conservative enamel prep, and adhesive bonding of individualized porcelain shells.",
      benefits: "Permanently stain-resistant, closes gaps, fixes chipped edges, and delivers a radiant, camera-ready smile.",
      aftercare: "Wear a nightguard if you clench or grind, and avoid using teeth to open packaging or crack hard items.",
    },
  },
] as const;

export const services: readonly Service[] = Object.freeze(landingServices.map((item, index) => Object.freeze({
  id: `service-${index + 1}`,
  title: item.title,
  description: item.description,
  durationMinutes: index === 0 ? 30 : 45,
  category: item.category,
  image: item.image,
  extendedDetails: item.extendedDetails,
})));

export const demoServices = services;

export const demoClinic = Object.freeze({
  name: "BlueHaven Dental",
  address: "Synapsys Office, Makram Ebeid, Nasr City, Cairo, Egypt",
  email: "contact@bluehavendental.com",
  phone: "+20 2 2270 9988",
  hours: "Saturday–Thursday, 9:00 AM–8:00 PM (Cairo Time)",
  closed: "Friday: Emergency care by appointment only",
  team: Object.freeze(["Dr. Layla Hassan", "Dr. Omar Adel", "Dr. Nour Samir", "Dr. Adam Khalil"]),
  metrics: Object.freeze([["Patient visits", "12,500+"], ["Years of experience", "12"], ["Dental team", "4"], ["Care areas", "12"]]),
  testimonials: Object.freeze([
    { name: "Mariam A.", visit: "First visit", quote: "I had time to ask my questions, and every step was explained clearly." },
    { name: "Youssef M.", visit: "Routine check-up", quote: "The welcome was warm, and I left with a better understanding of my next steps." },
    { name: "Salma K.", visit: "Family appointment", quote: "A calm setting and a friendly conversation made planning our visits feel easier." },
  ].map((item) => Object.freeze(item))),
  search: Object.freeze({ area: "Nasr City, Cairo", visit: "Routine check-up", time: "Monday, 10:30 AM" }),
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

export const demoAccounts: readonly Account[] = Object.freeze([
  {
    id: "account-admin-1",
    name: "Dr. Administrator",
    email: "admin@bluehaven.example",
    phone: "+20 00 0000 0000",
    role: "admin",
    status: "active",
    createdAt: "2026-01-10",
  },
  ...doctors.map((doc, idx) => ({
    id: `account-doc-${doc.id}`,
    name: doc.name,
    email: `${doc.name.toLowerCase().replace(/[^a-z]/g, "")}@bluehaven.example`,
    phone: `+20 00 0000 000${idx + 1}`,
    role: "doctor" as AccountRole,
    status: "active" as AccountStatus,
    specialty: doc.specialty,
    bio: doc.bio,
    serviceIds: doc.serviceIds,
    createdAt: "2026-02-01",
  })),
  {
    id: "account-pat-1",
    name: "Mariam Ahmed",
    email: "mariam.a@example.com",
    phone: "+20 10 1234 5678",
    role: "patient",
    status: "active",
    createdAt: "2026-03-12",
  },
  {
    id: "account-pat-2",
    name: "Youssef Mahmoud",
    email: "youssef.m@example.com",
    phone: "+20 11 2345 6789",
    role: "patient",
    status: "active",
    createdAt: "2026-03-15",
  },
  {
    id: "account-pat-3",
    name: "Salma Khalil",
    email: "salma.k@example.com",
    phone: "+20 12 3456 7890",
    role: "patient",
    status: "active",
    createdAt: "2026-03-20",
  },
]);

