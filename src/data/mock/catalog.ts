export type ServiceLanguageMode = "bilingual" | "en" | "ar";

export type ServiceExtendedDetails = {
  overview: string;
  procedure: string;
  benefits: string;
  aftercare: string;
};

export type Service = {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  defaultLocale?: ServiceLanguageMode;
  durationMinutes: number;
  category: string;
  image: string;
  extendedDetails?: ServiceExtendedDetails;
  extendedDetailsAr?: ServiceExtendedDetails;
};

export const SERVICE_CATEGORIES = Object.freeze([
  Object.freeze({ value: "Preventive Care", en: "Preventive Care", ar: "رعاية وقائية" }),
  Object.freeze({ value: "Restorative Dentistry", en: "Restorative Dentistry", ar: "طب الأسنان الترميمي" }),
  Object.freeze({ value: "Cosmetic Dentistry", en: "Cosmetic Dentistry", ar: "طب الأسنان التجميلي" }),
  Object.freeze({ value: "Orthodontics", en: "Orthodontics", ar: "تقويم الأسنان" }),
  Object.freeze({ value: "Pediatric Dentistry", en: "Pediatric Dentistry", ar: "طب أسنان الأطفال" }),
  Object.freeze({ value: "Oral Surgery & Endodontics", en: "Oral Surgery & Endodontics", ar: "جراحة الفم وعلاج الجذور" }),
  Object.freeze({ value: "General Dental Care", en: "General Dental Care", ar: "رعاية الأسنان العامة" }),
]);

export const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80";

export const SERVICE_IMAGE_PRESETS = Object.freeze([
  Object.freeze({
    labelEn: "Consultation Suite",
    labelAr: "غرفة الفحص والاستشارة",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
  }),
  Object.freeze({
    labelEn: "Restorative Studio",
    labelAr: "عيادة الترميم والزراعة",
    url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
  }),
  Object.freeze({
    labelEn: "Cosmetic & Smile Care",
    labelAr: "العناية التجميلية بالابتسامة",
    url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
  }),
  Object.freeze({
    labelEn: "Orthodontic Precision",
    labelAr: "تقويم الأسنان الدقيق",
    url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
  }),
  Object.freeze({
    labelEn: "Digital Diagnostics",
    labelAr: "التشخيص والأشعة الرقمية",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
  }),
  Object.freeze({
    labelEn: "Hygiene & Gum Care",
    labelAr: "العناية باللثة والنظافة",
    url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  }),
]);

export type DoctorWorkingHour = {
  dayOfWeek: number;
  isOff: boolean;
  startTime?: string;
  endTime?: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image?: string;
  credentials?: string;
  experienceBadge?: string;
  experienceSummary?: string;
  languages?: string;
  comfortFocus?: string;
  serviceIds: readonly string[];
  workingHours?: readonly DoctorWorkingHour[];
};

export const DOCTOR_IMAGE_PRESETS = Object.freeze([
  Object.freeze({
    labelEn: "Studio Portrait — Layla",
    labelAr: "صورة استوديو — ليلى",
    url: "/images/demo/doctor.jpg",
  }),
  Object.freeze({
    labelEn: "Studio Portrait — Omar",
    labelAr: "صورة استوديو — عمر",
    url: "/images/demo/doctor-omar.jpg",
  }),
  Object.freeze({
    labelEn: "Studio Portrait — Nour",
    labelAr: "صورة استوديو — نور",
    url: "/images/demo/doctor-nour.jpg",
  }),
  Object.freeze({
    labelEn: "Studio Portrait — Adam",
    labelAr: "صورة استوديو — آدم",
    url: "/images/demo/doctor-adam.jpg",
  }),
]);

export type VisitReasonCategory = "new-exam" | "emergency" | "cleaning" | "follow-up";

export type VisitReasonCategoryOption = {
  id: VisitReasonCategory;
  serviceId: string;
  durationMinutes: number;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
};

export const visitReasonCategories: readonly VisitReasonCategoryOption[] = Object.freeze([
  Object.freeze({
    id: "new-exam" as const,
    serviceId: "service-1",
    durationMinutes: 30,
    labelEn: "New Patient Exam & Routine Check",
    labelAr: "فحص مريض جديد وكشف دوري",
    descEn: "Comprehensive oral examination, digital charting, and consultation.",
    descAr: "فحص شامل لصحة الفم والأسنان مع استشارة الخطة العلاجية.",
  }),
  Object.freeze({
    id: "emergency" as const,
    serviceId: "service-6",
    durationMinutes: 45,
    labelEn: "Toothache / Urgent Dental Issue",
    labelAr: "ألم أسنان / حالة طارئة عاجلة",
    descEn: "Immediate evaluation and pain-relief triage for acute discomfort.",
    descAr: "تقييم عاجل وتسكين فوري للآلام الحادة والالتهابات.",
  }),
  Object.freeze({
    id: "cleaning" as const,
    serviceId: "service-5",
    durationMinutes: 45,
    labelEn: "Routine Cleaning & Hygiene",
    labelAr: "تنظيف الأسنان والعناية باللثة",
    descEn: "Ultrasonic scaling, plaque removal, and preventive gum health.",
    descAr: "إزالة الجير بالموجات فوق الصوتية وتلميع الأسنان وحماية اللثة.",
  }),
  Object.freeze({
    id: "follow-up" as const,
    serviceId: "service-8",
    durationMinutes: 45,
    labelEn: "Follow-up & Restorative Check",
    labelAr: "متابعة علاجية وفحص حشوات",
    descEn: "Post-treatment review, healing progress, and filling checks.",
    descAr: "متابعة ما بعد العلاج والاطمئنان على التئام الأنسجة والحشوات.",
  }),
]);

export type PatientIntakeForm = {
  patientEmail: string;
  phone: string;
  emergencyContact: string;
  noChangesVerified: boolean;
  insuranceScaffold: {
    enabled: boolean;
    providerPlaceholder: string;
    memberIdPlaceholder: string;
    provider?: string;
    memberId?: string;
  };
  conditions: readonly string[];
  allergies: readonly string[];
  medications: string;
  consentSigned: boolean;
  signatureDataUrl?: string;
  signedByName?: string;
  updatedAt?: string;
};

export type ToothStatus = "healthy" | "urgent" | "restorative" | "elective" | "treated";

export type ToothRecord = {
  toothNumber: number; // FDI numbering e.g. 16, 11, 21, 26, 36, 46
  label: string;
  status: ToothStatus;
  condition: string;
  proposedTreatment: string;
  phaseOrder?: 1 | 2 | 3;
  xrayNote?: string;
};

export type TreatmentPhase = {
  id: string;
  order: 1 | 2 | 3;
  priority: "urgent" | "restorative" | "elective";
  title: string;
  description: string;
  toothNumber?: number;
  serviceId: string;
  durationMinutes: number;
  totalFeeEgp: number;
  insuranceScaffoldNote: string;
  outOfPocketEgp: number;
  scheduledAppointmentId?: string;
};

export type TreatmentPlan = {
  id: string;
  patientEmail: string;
  doctorId: string;
  createdAt: string;
  status: "proposed" | "approved";
  signatureDataUrl?: string;
  signedByName?: string;
  approvedAt?: string;
  teeth: readonly ToothRecord[];
  phases: readonly TreatmentPhase[];
};

export type PrescriptionItem = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
};

export type VisitCareSummary = {
  id: string;
  patientEmail: string;
  visitDate: string;
  doctorId: string;
  serviceId: string;
  whatWasDone: string;
  postOpInstructions: readonly string[];
  prescriptions: readonly PrescriptionItem[];
};

export type InvoiceLineItem = {
  id: string;
  procedure: string;
  tooth?: string;
  feeEgp: number;
};

export type PatientInvoice = {
  id: string;
  patientEmail: string;
  issuedDate: string;
  doctorId: string;
  items: readonly InvoiceLineItem[];
  totalFeeEgp: number;
  paidAmountEgp: number;
  balanceEgp: number;
  status: "balance_due" | "paid";
  nextInstallmentDate?: string;
  paymentMethod?: "card" | "apple_pay" | "google_pay" | "mobile_wallet";
  receiptNumber?: string;
  paidAt?: string;
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
  note?: string;
  attendanceConfirmed?: boolean;
  calendarSynced?: boolean;
  googleEventId?: string;
  reasonCategory?: VisitReasonCategory;
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
  image?: string;
  credentials?: string;
  experienceBadge?: string;
  experienceSummary?: string;
  languages?: string;
  comfortFocus?: string;
  serviceIds?: readonly string[];
  createdAt: string;
};

const landingServices = [
  {
    title: "Dental check-ups",
    titleAr: "الفحوصات الدورية",
    description: "A conversation and examination to understand your oral health and next steps.",
    descriptionAr: "محادثة وفحص لفهم صحة فمك والخطوات التالية.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "A comprehensive examination of teeth, gums, and soft tissues designed to identify early signs of wear, decay, or periodontal changes.",
      procedure: "Digital charting, gentle periodontal probing, high-definition intraoral camera photos, and ultra-low dose digital radiographs when necessary.",
      benefits: "Catches minor issues before they become painful or expensive, preserves natural teeth, and guarantees fresh breath.",
      aftercare: "Brush twice daily for two full minutes with fluoridated toothpaste, floss daily, and schedule regular evaluations every 6 months.",
    },
    extendedDetailsAr: {
      overview: "فحص شامل للأسنان واللثة والأنسجة الرخوة للكشف المبكر عن أي تآكل أو تسوس أو تغيرات في اللثة.",
      procedure: "تخطيط رقمي، وفحص لطيف للثة، وتصوير عالي الدقة داخل الفم، وأشعة رقمية منخفضة الجرعة عند الحاجة.",
      benefits: "يكتشف المشكلات البسيطة قبل تفاقمها، ويحافظ على الأسنان الطبيعية، ويدعم انتعاش النفس.",
      aftercare: "اغسل أسنانك مرتين يوميًا لمدة دقيقتين بمعجون يحتوي على الفلورايد، واستخدم الخيط يوميًا مع المتابعة كل 6 أشهر.",
    },
  },
  {
    title: "Dental implants",
    titleAr: "زراعة الأسنان",
    description: "Explore options for replacing missing teeth with implant-supported restorations.",
    descriptionAr: "استكشف خيارات تعويض الأسنان المفقودة بتعويضات مدعومة بالزراعة.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "The gold standard for permanent tooth replacement, restoring full functionality, biting power, and natural aesthetics.",
      procedure: "Computer-guided placement of surgical-grade titanium posts into the jawbone, followed by custom-milled porcelain crown placement after osseointegration.",
      benefits: "Prevents bone resorption in the jaw, does not harm neighboring healthy teeth, and delivers a lifetime of confident chewing.",
      aftercare: "Practice gentle brushing around the implant site, use interdental floss or water flossers, and attend bi-annual implant check-ups.",
    },
    extendedDetailsAr: {
      overview: "المعيار الذهبي لتعويض الأسنان المفقودة بشكل دائم، لاستعادة الوظيفة الكاملة وقوة المضغ والمظهر الطبيعي.",
      procedure: "وضع غرسات التيتانيوم الجراحية بتوجيه حاسوبي داخل عظم الفك، يليها تركيب تاج خزفي مخصص بعد الالتحام العظمي.",
      benefits: "يمنع ذوبان عظم الفك، ولا يؤثر على الأسنان المجاورة السليمة، ويمنحك ثقة طويلة الأمد أثناء المضغ.",
      aftercare: "نظّف حول الزرعة بلطف باستخدام فرشاة ناعمة وخيط مخصص أو جهاز الخيط المائي مع مراجعة دورية كل 6 أشهر.",
    },
  },
  {
    title: "Braces & alignment",
    titleAr: "تقويم الأسنان وترتيبها",
    description: "Discuss ways to improve tooth alignment and how your teeth meet.",
    descriptionAr: "ناقش طرق تحسين انتظام الأسنان وطريقة إطباق الأسنان معًا.",
    category: "Orthodontics",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Personalized orthodontic treatments utilizing discreet clear aligners or precision ceramic braces to straighten teeth and harmonize bite mechanics.",
      procedure: "Full 3D intraoral digital mapping to simulate teeth movement stages, followed by tailored aligner trays changed bi-weekly.",
      benefits: "Alleviates jaw joint tension, makes brushing significantly easier, prevents uneven tooth wear, and boosts smile confidence.",
      aftercare: "Wear aligners 20–22 hours per day, rinse trays with lukewarm water, and wear your custom retainer nightly following alignment.",
    },
    extendedDetailsAr: {
      overview: "علاجات تقويم مخصصة باستخدام التقويم الشفاف أو الخزفي الدقيق لترتيب الأسنان وتحقيق توازن الإطباق.",
      procedure: "مسح رقمي ثلاثي الأبعاد لمحاكاة مراحل حركة الأسنان، ثم تجهيز قوالب التقويم المخصصة وتبديلها دوريًا.",
      benefits: "يخفف شد مفصل الفك، ويسهّل تنظيف الأسنان، ويمنع التآكل غير المتساوي، ويعزز ثقتك بابتسامتك.",
      aftercare: "ارتدِ القوالب 20–22 ساعة يوميًا، واشطفها بماء فاتر، والتزم بالمثبت الليلي بعد انتهاء مرحلة التقويم.",
    },
  },
  {
    title: "Teeth whitening",
    titleAr: "تبييض الأسنان",
    description: "Learn about dentist-supervised options for lightening the colour of teeth.",
    descriptionAr: "تعرّف على خيارات تبييض لون الأسنان تحت إشراف طبيب الأسنان.",
    category: "Cosmetic Dentistry",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Professional in-clinic light-activated whitening engineered to lift stubborn stains while safeguarding enamel integrity and minimizing sensitivity.",
      procedure: "Application of protective gum dams, followed by controlled pH-balanced whitening gel activated with specialized cool-blue LED lights for 45 minutes.",
      benefits: "Brightens teeth up to 8 shades in a single appointment, eliminates coffee/tea discoloration, and delivers instant visible results.",
      aftercare: "Follow the 'white diet' (avoid coffee, dark sauces, red wine, and smoking) for 48 hours to lock in optimal brightness.",
    },
    extendedDetailsAr: {
      overview: "تبييض احترافي داخل العيادة مُصمم لإزالة التصبغات العميقة مع حماية طبقة المينا وتقليل الحساسية.",
      procedure: "حماية اللثة بعازل لطيف، ثم وضع جل تبييض متوازن الحموضة وتفعيله بضوء LED بارد لمدة 45 دقيقة.",
      benefits: "يفتح لون الأسنان حتى 8 درجات في جلسة واحدة، ويزيل آثار القهوة والشاي بنتائج فورية واضحة.",
      aftercare: "تجنب القهوة والمشروبات والأطعمة الداكنة والتدخين لمدة 48 ساعة بعد الجلسة للحفاظ على ثبات النتيجة.",
    },
  },
  {
    title: "Gum care",
    titleAr: "العناية باللثة",
    description: "Talk about gum health, cleaning, and everyday oral care.",
    descriptionAr: "ناقش صحة اللثة وتنظيفها والعناية اليومية بالفم.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Specialized periodontal therapy and deep ultrasonic scaling dedicated to arresting gum inflammation and preventing bone loss.",
      procedure: "Subgingival plaque and calculus removal with micro-vibrational ultrasonic tips and soothing antimicrobial pocket irrigation.",
      benefits: "Stops bleeding and tender gums, resolves persistent halitosis, and protects the biological foundation anchoring your teeth.",
      aftercare: "Use soft-bristled brushes angled at 45 degrees, rinse with prescribed antiseptic wash for 7 days, and maintain 3-month cleanings.",
    },
    extendedDetailsAr: {
      overview: "علاج متخصص للثة وتنظيف عميق بالموجات فوق الصوتية لإيقاف الالتهاب وحماية العظم الداعم للأسنان.",
      procedure: "إزالة الجير واللويحات تحت خط اللثة برؤوس دقيقة ولطيفة مع غسول مهدئ ومضاد للبكتيريا.",
      benefits: "يوقف نزيف اللثة وحساسيتها، ويعالج رائحة الفم غير المرغوبة، ويحافظ على ثبات الأسنان.",
      aftercare: "استخدم فرشاة ناعمة بزاوية 45 درجة مع الغسول الموصوف لمدة 7 أيام ومتابعة التنظيف كل 3 أشهر.",
    },
  },
  {
    title: "Root canal treatment",
    titleAr: "علاج قناة الجذر",
    description: "Discuss treatment for infection inside a tooth and restoring it afterward.",
    descriptionAr: "ناقش علاج العدوى داخل السن وترميمه بعد ذلك.",
    category: "Oral Surgery & Endodontics",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "A tooth-saving procedure that relieves acute dental pain, eliminates deep bacterial infection, and sterilizes the inner pulp chamber.",
      procedure: "Complete numbing for a painless experience, microscopic canal cleaning, disinfection, and biocompatible hermetic sealing.",
      benefits: "Prevents tooth loss and extraction, eradicates severe throbbing pain, and preserves the natural tooth structure in your arch.",
      aftercare: "Avoid biting down on hard foods on the treated side until the permanent protective crown is placed by your dentist.",
    },
    extendedDetailsAr: {
      overview: "إجراء علاجي يحافظ على السن الطبيعي عبر إزالة الالتهاب العميق وتعقيم قنوات الجذر وتسكين الألم الحاد.",
      procedure: "تخدير موضعي كامل لتجربة مريحة، ثم تنظيف القنوات بدقة مجهرية وتعقيمها وحشوها بمواد حيوية متوافقة.",
      benefits: "ينقذ السن من الخلع، ويقضي على الألم النابض، ويحافظ على بنية السن الطبيعية.",
      aftercare: "تجنب المضغ القوي على الجهة المعالجة حتى يتم تركيب التاج الدائم لحماية السن.",
    },
  },
  {
    title: "Children’s dentistry",
    titleAr: "طب أسنان الأطفال",
    description: "Friendly visits that help children get familiar with dental care.",
    descriptionAr: "زيارات ودية تساعد الأطفال على التعرّف على رعاية الأسنان.",
    category: "Pediatric Dentistry",
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Gentle, fear-free pediatric dental care tailored to children’s developing teeth, emphasizing trust and positive oral health habits.",
      procedure: "Friendly 'tell-show-do' approach, gentle cleaning, protective fluoride application, and BPA-free groove sealants.",
      benefits: "Protects against early childhood cavities, monitors eruption patterns, and ensures kids look forward to dental appointments.",
      aftercare: "Supervise tooth brushing until age 8, encourage healthy hydration over sugary drinks, and keep dental visits cheerful and routine.",
    },
    extendedDetailsAr: {
      overview: "رعاية أسنان لطيفة وخالية من القلق مصممة لأسنان الأطفال النامية مع بناء الثقة وعادات العناية الإيجابية.",
      procedure: "أسلوب تعريفي ودود خطوة بخطوة، مع تنظيف لطيف وتطبيق الفلورايد الواقي وسدادات الشقوق الآمنة.",
      benefits: "يحمي من تسوس الطفولة المبكر، ويتابع بزوغ الأسنان، ويجعل الطفل يعتاد الزيارات الدورية بارتياح.",
      aftercare: "راقب تفريش أسنان طفلك حتى سن الثامنة، وشجع شرب الماء وتقليل السكريات مع انتظام الفحوصات.",
    },
  },
  {
    title: "Tooth-coloured fillings",
    titleAr: "حشوات بلون السن",
    description: "Explore options for restoring teeth affected by cavities or damage.",
    descriptionAr: "استكشف خيارات ترميم الأسنان المتضررة بالتسوس أو التلف.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Mercury-free composite restorations precisely tinted to match your natural tooth shade, restoring strength and appearance.",
      procedure: "Minimally invasive decay removal, adhesive conditioning, and incremental layered composite placement cured instantly with light.",
      benefits: "Blends seamlessly with natural enamel, chemically adheres to strengthen the remaining tooth, and allows immediate eating.",
      aftercare: "Maintain everyday oral hygiene. Mild sensitivity to cold may occur for 24–48 hours as the tooth recovers.",
    },
    extendedDetailsAr: {
      overview: "حشوات تجميلية خالية من الزئبق مطابقة بدقة للون أسنانك الطبيعي لاستعادة القوة والمظهر.",
      procedure: "إزالة التسوس بأقل تدخل ممكن، ثم تهيئة السن ووضع طبقات الكومبوزيت وتصليبها ضوئيًا فورًا.",
      benefits: "تندمج بسلاسة مع مينا الأسنان، وتلتصق لتقوية بنية السن، وتتيح لك الأكل فور الانتهاء.",
      aftercare: "حافظ على روتين التفريش والخيط اليومي، وقد تظهر حساسية خفيفة للبرودة لمدة 24–48 ساعة وتزول تلقائيًا.",
    },
  },
  {
    title: "Dental imaging",
    titleAr: "تصوير الأسنان بالأشعة",
    description: "Understand when dental images may help assess your care needs.",
    descriptionAr: "تعرّف على الحالات التي قد تساعد فيها صور الأسنان في تقييم احتياجاتك.",
    category: "Preventive Care",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "High-resolution digital diagnostics including panoramic OPG and 3D Cone Beam CT scans with 90% less radiation than conventional films.",
      procedure: "Fast, comfortable upright scan completed in under 15 seconds without any uncomfortable sensor trays in your mouth.",
      benefits: "Detects hidden cysts, impactions, sinus proximity, and bone density with crystal-clear millimeter precision.",
      aftercare: "No recovery or downtime needed. Images are instantly available on high-definition operatory screens for collaborative review.",
    },
    extendedDetailsAr: {
      overview: "تصوير تشخيصي رقمي عالي الدقة يشمل الأشعة البانورامية والأشعة المقطعية ثلاثية الأبعاد بجرعة إشعاع أقل بنسبة 90%.",
      procedure: "مسح سريع ومريح بوضعية الوقوف خلال أقل من 15 ثانية دون أي حساسات مزعجة داخل الفم.",
      benefits: "يكشف الأكياس الخفية والأسنان المطمورة وكثافة العظم بدقة ملليمترية واضحة.",
      aftercare: "لا يتطلب أي فترة تعافٍ، وتظهر الصور فورًا على شاشات العيادة لمراجعتها وشرحها معك.",
    },
  },
  {
    title: "Crowns & bridges",
    titleAr: "التيجان والجسور",
    description: "Learn about covering damaged teeth or replacing missing ones.",
    descriptionAr: "تعرّف على تغطية الأسنان التالفة أو تعويض الأسنان المفقودة.",
    category: "Restorative Dentistry",
    image: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Precision-milled all-ceramic and zirconia crowns and fixed bridges designed to reinforce cracked teeth or bridge tooth gaps.",
      procedure: "Digital 3D optical scan of the prepared tooth, temporary placement, and bonding of the customized laboratory porcelain prosthesis.",
      benefits: "Restores full chewing power, protects weakened root-canal-treated teeth from catastrophic fractures, and looks stunning.",
      aftercare: "Floss daily around margins and under bridge pontics using specialized floss threaders to maintain healthy surrounding gums.",
    },
    extendedDetailsAr: {
      overview: "تيجان وجسور ثابتة من الزيركون والسيراميك المصنوعة بدقة لتدعيم الأسنان المتشققة أو تعويض الفراغات.",
      procedure: "مسح بصري ثلاثي الأبعاد للسن المجهز، مع تركيب مؤقت ثم تثبيت التركيبة الخزفية المخصصة بدقة.",
      benefits: "يستعيد قوة المضغ الكاملة، ويحمي الأسنان المعالجة عصبيًا من الكسر، ويمنح مظهرًا طبيعيًا أنيقًا.",
      aftercare: "نظّف الحواف وأسفل الجسر يوميًا باستخدام الخيط الطبي المخصص للحفاظ على صحة اللثة المحيطة.",
    },
  },
  {
    title: "Wisdom tooth care",
    titleAr: "عناية ضرس العقل",
    description: "Discuss assessment and next steps for wisdom teeth that cause problems.",
    descriptionAr: "ناقش تقييم ضروس العقل التي تسبب مشكلات والخطوات التالية.",
    category: "Oral Surgery & Endodontics",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Expert surgical evaluation and comfortable extraction of partially erupted, impacted, or painful third molars.",
      procedure: "Precise nerve mapping with 3D imaging, profound localized anesthesia or conscious sedation, and minimally traumatic tooth removal.",
      benefits: "Stops recurrent gum infections, prevents orthodontic crowding relapse, and protects adjacent second molars from decay.",
      aftercare: "Bite gently on sterile gauze for 45 minutes, consume chilled soft foods, avoid hot liquids or straws for 72 hours.",
    },
    extendedDetailsAr: {
      overview: "تقييم جراحي متخصص وخلع مريح لضروس العقل المطمورة جزئيًا أو المسببة للألم والالتهاب.",
      procedure: "تحديد مسار العصب بالأشعة ثلاثية الأبعاد، مع تخدير عميق وإزالة لطيفة بأقل تأثير على الأنسجة.",
      benefits: "يوقف التهابات اللثة المتكررة، ويمنع تزاحم الأسنان، ويحمي الأضراس المجاورة من التسوس.",
      aftercare: "اضغط بلطف على الشاش المعقم لمدة 45 دقيقة، وتناول أطعمة باردة ولينة، وتجنب المشروبات الساخنة والشفاط لمدة 72 ساعة.",
    },
  },
  {
    title: "Dental veneers",
    titleAr: "قشور الأسنان",
    description: "Explore thin facings used to change the appearance of teeth.",
    descriptionAr: "استكشف الطبقات الرقيقة المستخدمة لتغيير مظهر الأسنان.",
    category: "Cosmetic Dentistry",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
    extendedDetails: {
      overview: "Ultra-thin, handcrafted porcelain veneers designed to transform smile symmetry, shade, and proportion.",
      procedure: "Digital smile design preview, conservative enamel prep, and adhesive bonding of individualized porcelain shells.",
      benefits: "Permanently stain-resistant, closes gaps, fixes chipped edges, and delivers a radiant, camera-ready smile.",
      aftercare: "Wear a nightguard if you clench or grind, and avoid using teeth to open packaging or crack hard items.",
    },
    extendedDetailsAr: {
      overview: "عدسات بورسلين فائقة الرقة مصنوعة يدويًا لتحسين تناسق الابتسامة ولونها وتناسب أبعاد الأسنان.",
      procedure: "معاينة رقمية لتصميم الابتسامة، وتحضير محافظ جدًا للمينا، ثم تثبيت القشور الخزفية بدقة عالية.",
      benefits: "مقاومة دائمة للتصبغات، وتغلق الفراغات، وتصلح الحواف المكسورة لتمنحك ابتسامة متألقة.",
      aftercare: "استخدم واقيًا ليليًا إذا كنت تعاني من الجز على الأسنان، وتجنب كسر الأشياء الصلبة بالأسنان.",
    },
  },
] as const;

export const services: readonly Service[] = Object.freeze(landingServices.map((item, index) => Object.freeze({
  id: `service-${index + 1}`,
  title: item.title,
  titleAr: item.titleAr,
  description: item.description,
  descriptionAr: item.descriptionAr,
  defaultLocale: "bilingual" as const,
  durationMinutes: index === 0 ? 30 : 45,
  category: item.category,
  image: item.image,
  extendedDetails: item.extendedDetails,
  extendedDetailsAr: item.extendedDetailsAr,
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

const buildWeeklySchedule = (
  offDays: readonly number[],
  startTime: string,
  endTime: string
): readonly DoctorWorkingHour[] =>
  Object.freeze(
    [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) =>
      Object.freeze({
        dayOfWeek,
        isOff: offDays.includes(dayOfWeek),
        startTime,
        endTime,
      })
    )
  );

const doctorProfiles = [
  {
    specialty: "General dentistry",
    bio: "Layla focuses on check-ups, gum care, fillings, and practical next steps for everyday dental health.",
    image: "/images/demo/doctor.jpg",
    credentials: "BDS, MSc Restorative & Preventive Dentistry · Cairo University",
    experienceBadge: "12 yrs exp",
    experienceSummary: "12 years experience · 3,800+ patient visits",
    languages: "Arabic, English",
    comfortFocus: "Quiet preventive check-ups, clear bitewing explanations, and gentle hygiene pacing.",
    serviceIndexes: [0, 4, 7, 8, 10],
    workingHours: buildWeeklySchedule([5], "09:00", "16:45"),
  },
  {
    specialty: "Implant and restorative dentistry",
    bio: "Omar discusses implant care, root canal treatment, and options for restoring or replacing teeth.",
    image: "/images/demo/doctor-omar.jpg",
    credentials: "BDS, Fellowship in Oral Implantology & Endodontics",
    experienceBadge: "10 yrs exp",
    experienceSummary: "10 years experience · Implant & root canal specialist",
    languages: "Arabic, English",
    comfortFocus: "CBCT-guided surgical planning paired with calm comfort options and step-by-step reassurance.",
    serviceIndexes: [1, 5, 7, 8, 9],
    workingHours: buildWeeklySchedule([5], "09:00", "16:45"),
  },
  {
    specialty: "Orthodontics and cosmetic dentistry",
    bio: "Nour helps patients explore alignment, whitening, and veneer options in a consultation.",
    image: "/images/demo/doctor-nour.jpg",
    credentials: "BDS, MSc Orthodontics & Aesthetic Smile Design",
    experienceBadge: "9 yrs exp",
    experienceSummary: "9 years experience · Aligners & conservative veneers",
    languages: "Arabic, English, French",
    comfortFocus: "Digital 3D smile previews, minimal-prep cosmetic work, and natural shade matching.",
    serviceIndexes: [2, 3, 11],
    workingHours: buildWeeklySchedule([2, 5], "09:00", "14:30"),
  },
  {
    specialty: "Family dentistry",
    bio: "Adam welcomes children and families for check-ups, gum care, and restorative conversations.",
    image: "/images/demo/doctor-adam.jpg",
    credentials: "BDS, Diploma in Family & Pediatric Dentistry",
    experienceBadge: "8 yrs exp",
    experienceSummary: "8 years experience · Children & nervous-patient care",
    languages: "Arabic, English",
    comfortFocus: "Explain-first pacing built to help kids and hesitant adults feel genuinely at ease.",
    serviceIndexes: [0, 4, 6, 7],
    workingHours: buildWeeklySchedule([3, 5], "10:30", "16:45"),
  },
] as const;

export const doctors: readonly Doctor[] = Object.freeze(demoClinic.team.map((name, index) => {
  const profile = doctorProfiles[index];
  return Object.freeze({
    id: `doctor-${index + 1}`,
    name,
    specialty: profile.specialty,
    bio: profile.bio,
    image: profile.image,
    credentials: profile.credentials,
    experienceBadge: profile.experienceBadge,
    experienceSummary: profile.experienceSummary,
    languages: profile.languages,
    comfortFocus: profile.comfortFocus,
    serviceIds: Object.freeze(profile.serviceIndexes.map((serviceIndex) => services[serviceIndex].id)),
    workingHours: profile.workingHours,
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

// FDI 32-teeth catalog generator
const fdiToothLabels: Record<number, string> = {
  18: "Upper Right 3rd Molar (Wisdom)",
  17: "Upper Right 2nd Molar",
  16: "Upper Right 1st Molar",
  15: "Upper Right 2nd Premolar",
  14: "Upper Right 1st Premolar",
  13: "Upper Right Canine",
  12: "Upper Right Lateral Incisor",
  11: "Upper Right Central Incisor",
  21: "Upper Left Central Incisor",
  22: "Upper Left Lateral Incisor",
  23: "Upper Left Canine",
  24: "Upper Left 1st Premolar",
  25: "Upper Left 2nd Premolar",
  26: "Upper Left 1st Molar",
  27: "Upper Left 2nd Molar",
  28: "Upper Left 3rd Molar (Wisdom)",
  38: "Lower Left 3rd Molar (Wisdom)",
  37: "Lower Left 2nd Molar",
  36: "Lower Left 1st Molar",
  35: "Lower Left 2nd Premolar",
  34: "Lower Left 1st Premolar",
  33: "Lower Left Canine",
  32: "Lower Left Lateral Incisor",
  31: "Lower Left Central Incisor",
  41: "Lower Right Central Incisor",
  42: "Lower Right Lateral Incisor",
  43: "Lower Right Canine",
  44: "Lower Right 1st Premolar",
  45: "Lower Right 2nd Premolar",
  46: "Lower Right 1st Molar",
  47: "Lower Right 2nd Molar",
  48: "Lower Right 3rd Molar (Wisdom)",
};

export const fdiToothNumbers: readonly number[] = Object.freeze([
  // Upper arch: 18 down to 11, then 21 up to 28
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  // Lower arch: 48 down to 41, then 31 up to 38
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
]);

export function buildFdiTeeth(overrides: Record<number, Partial<ToothRecord>> = {}): readonly ToothRecord[] {
  return Object.freeze(fdiToothNumbers.map((num) => {
    const defaultRecord: ToothRecord = {
      toothNumber: num,
      label: fdiToothLabels[num] || `Tooth #${num}`,
      status: "healthy",
      condition: "Sound natural enamel and healthy gingival margin",
      proposedTreatment: "Routine preventive hygiene & monitoring",
    };
    const custom = overrides[num];
    return Object.freeze(custom ? { ...defaultRecord, ...custom } : defaultRecord);
  }));
}

// Mariam's FDI teeth:
// #36 urgent (root canal)
// #46 restorative (filling)
// #11 & #21 elective (whitening candidate)
// #16 treated (sound filling)
export const mariamTeeth: readonly ToothRecord[] = buildFdiTeeth({
  36: {
    status: "urgent",
    condition: "Deep irreversible pulpitis, periapical sensitivity to percussion",
    proposedTreatment: "Root Canal Treatment (Endodontic therapy) & Post/Core",
    phaseOrder: 1,
    xrayNote: "Distal radiolucency reaching pulp horn; periapical ligament widening",
  },
  46: {
    status: "restorative",
    condition: "Recurrent occlusal margin caries adjacent to old composite",
    proposedTreatment: "Direct composite resin restoration (Tooth-coloured filling)",
    phaseOrder: 2,
    xrayNote: "Enamel-dentin boundary radiolucency; no pulpal involvement",
  },
  11: {
    status: "elective",
    condition: "Mild superficial coffee and tea staining",
    proposedTreatment: "In-Clinic LED Teeth Whitening (Cosmetic enhancement)",
    phaseOrder: 3,
  },
  21: {
    status: "elective",
    condition: "Mild superficial enamel discoloration",
    proposedTreatment: "In-Clinic LED Teeth Whitening (Cosmetic enhancement)",
    phaseOrder: 3,
  },
  16: {
    status: "treated",
    condition: "Sound composite restoration placed 2024",
    proposedTreatment: "None - intact and functional",
  },
});

export const mariamTreatmentPlan: TreatmentPlan = Object.freeze({
  id: "plan-mariam-1",
  patientEmail: "mariam.a@example.com",
  doctorId: "doctor-2",
  createdAt: "2026-10-18",
  status: "proposed",
  teeth: mariamTeeth,
  phases: Object.freeze([
    Object.freeze({
      id: "phase-mariam-1",
      order: 1,
      priority: "urgent",
      title: "Emergency Endodontic Treatment (Root Canal) - Tooth #36",
      description: "Complete canal sterilization, biomechanical preparation, and gutta-percha obturation to arrest active pulpal infection and alleviate throbbing pain.",
      toothNumber: 36,
      serviceId: "service-6",
      durationMinutes: 45,
      totalFeeEgp: 3200,
      insuranceScaffoldNote: "Standard out-of-pocket preview (Direct insurer billing pending scaffold activation)",
      outOfPocketEgp: 3200,
    }),
    Object.freeze({
      id: "phase-mariam-2",
      order: 2,
      priority: "restorative",
      title: "Zirconia Porcelain Crown - Tooth #36 & Composite Restoration - Tooth #46",
      description: "CAD/CAM custom-milled monolithic zirconia crown to reinforce endodontically treated molar #36, plus cosmetic composite filling on #46.",
      toothNumber: 36,
      serviceId: "service-10",
      durationMinutes: 45,
      totalFeeEgp: 4500,
      insuranceScaffoldNote: "Laboratory custom crown scaffold estimate",
      outOfPocketEgp: 4500,
    }),
    Object.freeze({
      id: "phase-mariam-3",
      order: 3,
      priority: "elective",
      title: "In-Clinic LED Teeth Whitening - Full Arch",
      description: "Professional light-activated whitening system lifting intrinsic discoloration up to 8 shades for a bright, uniform aesthetic.",
      serviceId: "service-4",
      durationMinutes: 45,
      totalFeeEgp: 2800,
      insuranceScaffoldNote: "Elective cosmetic dentistry - not eligible for standard insurance cover",
      outOfPocketEgp: 2800,
    }),
  ]),
});

export const mariamVisitCareSummary: VisitCareSummary = Object.freeze({
  id: "care-mariam-1",
  patientEmail: "mariam.a@example.com",
  visitDate: "2026-10-18",
  doctorId: "doctor-2",
  serviceId: "service-6",
  whatWasDone: "Completed diagnostic examination, ultra-low-dose digital imaging, and emergency pulp access with sedative dressing on lower left first molar (#36) to relieve acute discomfort.",
  postOpInstructions: Object.freeze([
    "Do not eat for 2 hours until local anesthesia fully wears off to avoid lip or cheek bites.",
    "Avoid hot drinks and hard foods on the lower left side for 24 hours.",
    "Rinse gently with warm salt water starting tomorrow morning after breakfast.",
    "Contact the clinic immediately if facial swelling or severe throbbing persists.",
  ]),
  prescriptions: Object.freeze([
    Object.freeze({
      id: "rx-mariam-1",
      medication: "Amoxicillin",
      dosage: "500 mg",
      frequency: "Every 8 hours with meals",
      durationDays: 5,
      instructions: "Complete the full 5-day antibiotic course even if pain resolves completely.",
    }),
    Object.freeze({
      id: "rx-mariam-2",
      medication: "Ibuprofen",
      dosage: "400 mg",
      frequency: "Every 6–8 hours as needed",
      durationDays: 3,
      instructions: "Take with food or a glass of milk for post-procedure pain and inflammation control.",
    }),
  ]),
});

export const mariamInvoice: PatientInvoice = Object.freeze({
  id: "inv-mariam-101",
  patientEmail: "mariam.a@example.com",
  issuedDate: "2026-10-18",
  doctorId: "doctor-2",
  items: Object.freeze([
    Object.freeze({
      id: "line-1",
      procedure: "Comprehensive Diagnostic Examination & Digital Imaging",
      tooth: "General",
      feeEgp: 650,
    }),
    Object.freeze({
      id: "line-2",
      procedure: "Emergency Pulpectomy & Biocompatible Sedative Dressing",
      tooth: "#36",
      feeEgp: 2550,
    }),
  ]),
  totalFeeEgp: 3200,
  paidAmountEgp: 1350,
  balanceEgp: 1850,
  status: "balance_due",
  nextInstallmentDate: "2026-11-15",
});

export const mariamIntakeForm: PatientIntakeForm = Object.freeze({
  patientEmail: "mariam.a@example.com",
  phone: "+20 10 1234 5678",
  emergencyContact: "Ahmed A. (+20 10 9876 5432)",
  noChangesVerified: true,
  insuranceScaffold: Object.freeze({
    enabled: false,
    providerPlaceholder: "MetLife Egypt (Preview)",
    memberIdPlaceholder: "EGY-98234-A",
  }),
  conditions: Object.freeze(["None"]),
  allergies: Object.freeze(["Penicillin: No known allergy", "Latex: No allergy"]),
  medications: "None currently",
  consentSigned: true,
  signedByName: "Mariam Ahmed",
  signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40'><path d='M10 25 Q 30 10, 60 25 T 120 20 T 150 25' stroke='%232563eb' stroke-width='2' fill='none'/></svg>",
  updatedAt: "2026-10-15T10:00:00Z",
});

// Seed arrays
export const demoIntakeForms: readonly PatientIntakeForm[] = Object.freeze([
  mariamIntakeForm,
]);

export const demoTreatmentPlans: readonly TreatmentPlan[] = Object.freeze([
  mariamTreatmentPlan,
]);

export const demoVisitSummaries: readonly VisitCareSummary[] = Object.freeze([
  mariamVisitCareSummary,
]);

export const demoInvoices: readonly PatientInvoice[] = Object.freeze([
  mariamInvoice,
]);

// 6-month recall trigger map (> 6 months prior to late October 2026)
export const lastCleaningDateByEmail: Record<string, string> = Object.freeze({
  "mariam.a@example.com": "2026-04-15",
  "youssef.m@example.com": "2026-04-15",
  "salma.k@example.com": "2026-04-15",
});

// Fallback generators for any patient email:
export function createDefaultIntakeForm(email: string, name?: string, phone?: string): PatientIntakeForm {
  return {
    patientEmail: email.toLowerCase().trim(),
    phone: phone || "+20 10 0000 0000",
    emergencyContact: "Emergency Contact (+20 10 1111 2222)",
    noChangesVerified: true,
    insuranceScaffold: {
      enabled: false,
      providerPlaceholder: "Direct Billing Scaffold (Optional)",
      memberIdPlaceholder: "ID-00000",
    },
    conditions: ["None reported"],
    allergies: ["No known allergies"],
    medications: "None reported",
    consentSigned: false,
    signedByName: name || "Patient",
  };
}

export function createDefaultTreatmentPlan(email: string): TreatmentPlan {
  const teeth = buildFdiTeeth({
    36: {
      status: "urgent",
      condition: "Pulpitis requiring endodontic evaluation",
      proposedTreatment: "Root canal treatment",
      phaseOrder: 1,
      xrayNote: "Periapical radiolucency noted",
    },
    46: {
      status: "restorative",
      condition: "Enamel decay",
      proposedTreatment: "Composite filling",
      phaseOrder: 2,
    },
    11: {
      status: "elective",
      condition: "Enamel shade review",
      proposedTreatment: "Professional whitening",
      phaseOrder: 3,
    },
    21: {
      status: "elective",
      condition: "Enamel shade review",
      proposedTreatment: "Professional whitening",
      phaseOrder: 3,
    },
  });

  return {
    id: `plan-${email.replace(/[^a-z0-9]/gi, "-")}`,
    patientEmail: email.toLowerCase().trim(),
    doctorId: "doctor-1",
    createdAt: new Date().toISOString().slice(0, 10),
    status: "proposed",
    teeth,
    phases: [
      {
        id: "phase-1",
        order: 1,
        priority: "urgent",
        title: "Phase 1: Emergency & Diagnostic Care - Tooth #36",
        description: "Targeted endodontic relief and canal sterilization.",
        toothNumber: 36,
        serviceId: "service-6",
        durationMinutes: 45,
        totalFeeEgp: 3200,
        insuranceScaffoldNote: "Out-of-pocket estimate preview",
        outOfPocketEgp: 3200,
      },
      {
        id: "phase-2",
        order: 2,
        priority: "restorative",
        title: "Phase 2: Restorative Filling & Crown Protection",
        description: "Permanent crown reinforcement and restorative composite filling.",
        toothNumber: 36,
        serviceId: "service-10",
        durationMinutes: 45,
        totalFeeEgp: 4500,
        insuranceScaffoldNote: "Crown laboratory preview",
        outOfPocketEgp: 4500,
      },
      {
        id: "phase-3",
        order: 3,
        priority: "elective",
        title: "Phase 3: Preventive Cleaning & Smile Aesthetics",
        description: "Full arch prophylaxis and cosmetic whitening touch-up.",
        serviceId: "service-4",
        durationMinutes: 45,
        totalFeeEgp: 2800,
        insuranceScaffoldNote: "Elective cosmetic procedure",
        outOfPocketEgp: 2800,
      },
    ],
  };
}

export function createDefaultVisitSummary(email: string): VisitCareSummary {
  return {
    id: `care-${Date.now()}`,
    patientEmail: email.toLowerCase().trim(),
    visitDate: "2026-10-18",
    doctorId: "doctor-1",
    serviceId: "service-1",
    whatWasDone: "Initial comprehensive oral examination and digital diagnostic assessment.",
    postOpInstructions: [
      "Brush twice daily with fluoride toothpaste.",
      "Floss daily between all contacts.",
      "Attend recommended treatment plan appointments.",
    ],
    prescriptions: [],
  };
}

export function createDefaultInvoice(email: string): PatientInvoice {
  return {
    id: `inv-${Date.now()}`,
    patientEmail: email.toLowerCase().trim(),
    issuedDate: "2026-10-18",
    doctorId: "doctor-1",
    items: [
      {
        id: "line-item-1",
        procedure: "Dental Check-up & Consultation",
        tooth: "General",
        feeEgp: 650,
      },
    ],
    totalFeeEgp: 650,
    paidAmountEgp: 650,
    balanceEgp: 0,
    status: "paid",
    paymentMethod: "card",
    receiptNumber: "RCPT-DEMO-001",
    paidAt: "2026-10-18T10:30:00Z",
  };
}
