import type { Locale } from "@/i18n/locales";
import {
  SERVICE_CATEGORIES,
  demoClinic,
  doctors as seedDoctors,
  services as seedServices,
  type Doctor,
  type Service,
  type ServiceExtendedDetails,
} from "@/data/mock/catalog";

export type ClinicCopy = {
  name: string;
  address: string;
  email: string;
  phone: string;
  hours: string;
  closed: string;
  team: readonly string[];
  metrics: readonly (readonly string[])[];
  testimonials: readonly { name: string; visit: string; quote: string }[];
  search: { area: string; visit: string; time: string };
};

// Arabic copy for the seeded fictional catalog. English remains the source data in catalog.ts.
const arabicServices: Readonly<Record<string, { title: string; description: string }>> = {
  "service-1": { title: "الفحوصات الدورية", description: "محادثة وفحص لفهم صحة فمك والخطوات التالية." },
  "service-2": { title: "زراعة الأسنان", description: "استكشف خيارات تعويض الأسنان المفقودة بتعويضات مدعومة بالزراعة." },
  "service-3": { title: "تقويم الأسنان وترتيبها", description: "ناقش طرق تحسين انتظام الأسنان وطريقة إطباق الأسنان معًا." },
  "service-4": { title: "تبييض الأسنان", description: "تعرّف على خيارات تبييض لون الأسنان تحت إشراف طبيب الأسنان." },
  "service-5": { title: "العناية باللثة", description: "ناقش صحة اللثة وتنظيفها والعناية اليومية بالفم." },
  "service-6": { title: "علاج قناة الجذر", description: "ناقش علاج العدوى داخل السن وترميمه بعد ذلك." },
  "service-7": { title: "طب أسنان الأطفال", description: "زيارات ودية تساعد الأطفال على التعرّف على رعاية الأسنان." },
  "service-8": { title: "حشوات بلون السن", description: "استكشف خيارات ترميم الأسنان المتضررة بالتسوس أو التلف." },
  "service-9": { title: "تصوير الأسنان بالأشعة", description: "تعرّف على الحالات التي قد تساعد فيها صور الأسنان في تقييم احتياجاتك." },
  "service-10": { title: "التيجان والجسور", description: "تعرّف على تغطية الأسنان التالفة أو تعويض الأسنان المفقودة." },
  "service-11": { title: "عناية ضرس العقل", description: "ناقش تقييم ضروس العقل التي تسبب مشكلات والخطوات التالية." },
  "service-12": { title: "قشور الأسنان", description: "استكشف الطبقات الرقيقة المستخدمة لتغيير مظهر الأسنان." },
};

const arabicDoctors: Readonly<Record<string, { name: string; specialty: string; bio: string }>> = {
  "doctor-1": {
    name: "د. ليلى حسن",
    specialty: "طب الأسنان العام",
    bio: "تركّز ليلى على الفحوصات الدورية، والعناية باللثة، والحشوات، والخطوات العملية لصحة الأسنان اليومية.",
  },
  "doctor-2": {
    name: "د. عمر عادل",
    specialty: "زراعة الأسنان وطب الأسنان الترميمي",
    bio: "يناقش عمر العناية بالزراعات، وعلاج قناة الجذر، والخيارات المتاحة لترميم الأسنان أو تعويضها.",
  },
  "doctor-3": {
    name: "د. نور سمير",
    specialty: "تقويم الأسنان وطب الأسنان التجميلي",
    bio: "تساعد نور المرضى على استكشاف خيارات تقويم الأسنان والتبييض والقشور أثناء الاستشارة.",
  },
  "doctor-4": {
    name: "د. آدم خليل",
    specialty: "طب أسنان الأسرة",
    bio: "يرحب آدم بالأطفال والأسر للفحوصات الدورية وعناية اللثة ومناقشات الترميم.",
  },
};

const arabicClinic: ClinicCopy = Object.freeze({
  name: "بلوهيفن دنتال",
  address: "مقر سينابسيس، مكرم عبيد، مدينة نصر، القاهرة، مصر",
  email: demoClinic.email,
  phone: demoClinic.phone,
  hours: "السبت – الخميس، 9:00 ص – 8:00 م (بتوقيت القاهرة)",
  closed: "الجمعة: حالات الطوارئ بموعد مسبق فقط",
  team: Object.freeze(Object.values(arabicDoctors).map((doctor) => doctor.name)),
  metrics: Object.freeze([
    Object.freeze(["زيارات المرضى", "12,500+"]),
    Object.freeze(["سنوات الخبرة", "12"]),
    Object.freeze(["فريق الأسنان", "4"]),
    Object.freeze(["مجالات العناية", "12"]),
  ]),
  testimonials: Object.freeze([
    { name: "مريم ع.", visit: "الزيارة الأولى", quote: "كان لديّ وقت لطرح أسئلتي، وكل خطوة شُرحت لي بوضوح." },
    { name: "يوسف م.", visit: "فحص دوري", quote: "كان الاستقبال دافئًا، وخرجت بفهم أفضل لخطواتي التالية." },
    { name: "سلمى ك.", visit: "زيارة عائلية", quote: "أجواء هادئة وحديث ودود جعلا تنظيم زياراتنا العائلية أسهل." },
  ].map((item) => Object.freeze(item))),
  search: Object.freeze({ area: "مدينة نصر، القاهرة", visit: "فحص دوري", time: "الاثنين، 10:30 ص" }),
});

export function localizedClinic(locale: Locale): ClinicCopy {
  return locale === "ar" ? arabicClinic : demoClinic;
}

export function getServiceCategoryLabel(category: string, locale: Locale): string {
  if (category === "all") {
    return locale === "ar" ? "جميع التخصصات" : "All Categories";
  }
  const match = SERVICE_CATEGORIES.find((item) => item.value === category);
  if (match) return locale === "ar" ? match.ar : match.en;
  return category;
}

function mergeExtendedDetails(
  primary?: ServiceExtendedDetails,
  fallback?: ServiceExtendedDetails
): ServiceExtendedDetails | undefined {
  const overview = primary?.overview?.trim() || fallback?.overview?.trim() || "";
  const procedure = primary?.procedure?.trim() || fallback?.procedure?.trim() || "";
  const benefits = primary?.benefits?.trim() || fallback?.benefits?.trim() || "";
  const aftercare = primary?.aftercare?.trim() || fallback?.aftercare?.trim() || "";
  if (!overview && !procedure && !benefits && !aftercare) return undefined;
  return { overview, procedure, benefits, aftercare };
}

// Seeded text is translated only while it matches its English seed. Staff-edited text is shown exactly as entered.
function pick(current: string, seed: string | undefined, translated: string | undefined, locale: Locale): string {
  return locale === "ar" && translated !== undefined && current === seed ? translated : current;
}

export function localizedService(
  service: Service,
  locale: Locale
): {
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  extendedDetails?: ServiceExtendedDetails;
} {
  const category = service.category || "Preventive Care";
  const categoryLabel = getServiceCategoryLabel(category, locale);
  const mode = service.defaultLocale ?? "bilingual";

  if (mode === "en") {
    return {
      title: service.title,
      description: service.description,
      category,
      categoryLabel,
      extendedDetails: service.extendedDetails,
    };
  }

  if (mode === "ar") {
    return {
      title: service.titleAr?.trim() || service.title,
      description: service.descriptionAr?.trim() || service.description,
      category,
      categoryLabel,
      extendedDetails: mergeExtendedDetails(service.extendedDetailsAr, service.extendedDetails),
    };
  }

  if (locale === "en") {
    return {
      title: service.title.trim() || service.titleAr?.trim() || "",
      description: service.description.trim() || service.descriptionAr?.trim() || "",
      category,
      categoryLabel,
      extendedDetails: mergeExtendedDetails(service.extendedDetails, service.extendedDetailsAr),
    };
  }

  const seed = seedServices.find((item) => item.id === service.id);
  const legacyFallback = arabicServices[service.id];
  const resolvedTitle =
    service.titleAr?.trim() ||
    (seed && service.title === seed.title ? seed.titleAr ?? legacyFallback?.title : undefined) ||
    service.title;
  const resolvedDescription =
    service.descriptionAr?.trim() ||
    (seed && service.description === seed.description ? seed.descriptionAr ?? legacyFallback?.description : undefined) ||
    service.description;

  const seedExtendedAr = seed?.extendedDetailsAr;
  const extendedFromSeed: ServiceExtendedDetails | undefined = seed && seedExtendedAr
    ? {
        overview: service.extendedDetails?.overview === seed.extendedDetails?.overview ? seedExtendedAr.overview : "",
        procedure: service.extendedDetails?.procedure === seed.extendedDetails?.procedure ? seedExtendedAr.procedure : "",
        benefits: service.extendedDetails?.benefits === seed.extendedDetails?.benefits ? seedExtendedAr.benefits : "",
        aftercare: service.extendedDetails?.aftercare === seed.extendedDetails?.aftercare ? seedExtendedAr.aftercare : "",
      }
    : undefined;

  const resolvedExtended = mergeExtendedDetails(
    mergeExtendedDetails(service.extendedDetailsAr, extendedFromSeed),
    service.extendedDetails
  );

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    category,
    categoryLabel,
    extendedDetails: resolvedExtended,
  };
}

export function localizedDoctor(doctor: Doctor, locale: Locale): { name: string; specialty: string; bio: string } {
  const seed = seedDoctors.find((item) => item.id === doctor.id);
  const translated = arabicDoctors[doctor.id];
  return {
    name: pick(doctor.name, seed?.name, translated?.name, locale),
    specialty: pick(doctor.specialty, seed?.specialty, translated?.specialty, locale),
    bio: pick(doctor.bio, seed?.bio, translated?.bio, locale),
  };
}
