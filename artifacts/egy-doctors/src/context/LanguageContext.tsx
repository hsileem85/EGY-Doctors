import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar";

const translations = {
  en: {
    nav: {
      search: "Search Doctors",
      doctorLogin: "Doctor Login",
    },
    home: {
      heroTitle: "Find & Book the Best Doctors in Egypt for Free",
      heroSubtitle:
        "Connect with top-rated medical professionals. Read verified patient reviews, compare fees, and book your appointment instantly.",
      specialty: "Specialty",
      location: "Location",
      chooseSpecialty: "Choose specialty",
      chooseCityOrArea: "Choose city or area",
      search: "Search",
      featuredSpecialists: "Featured Specialists",
      featuredSubtitle: "Top-rated doctors available for booking today.",
      viewAll: "View All Doctors",
    },
    search: {
      placeholder: "Search by doctor name or symptoms...",
      filters: "Filters",
      specialty: "Specialty",
      location: "Location",
      clearFilters: "Clear Filters",
      clearAllFilters: "Clear All Filters",
      doctorsFound: (n: number) => `${n} ${n === 1 ? "Doctor" : "Doctors"} Found`,
      noFound: "No doctors found",
      noFoundDesc: "Try adjusting your filters or search query to find more results.",
    },
    card: {
      reviews: "Reviews",
      bookAppointment: "Book Appointment",
      viewProfile: "View Profile",
    },
    profile: {
      doctorNotFound: "Doctor not found",
      fee: "Fee",
      aboutDoctor: "About Doctor",
      bookAppointment: "Book Appointment",
      availableSlots: "Available Slots",
      selectedSlot: "Selected Slot",
      change: "Change",
      patientName: "Patient Name",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      consultationFee: "Consultation Fee",
      bookingFee: "Booking Fee",
      free: "Free",
      payAtClinic: "Pay at Clinic",
      confirmBooking: "Confirm Booking",
      confirming: "Confirming...",
      bookingConfirmed: "Booking Confirmed!",
      appointmentScheduled: "Your appointment is scheduled for",
      bookAnother: "Book Another",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back, Dr. Ahmed. Here's your clinic overview.",
      appointments: "Appointments",
      patients: "Patients",
      performance: "Performance",
      upcomingAppointments: "Upcoming Appointments",
      profileViews: "Profile Views (30d)",
      totalEarnings: "Total Earnings (MTD)",
      sinceYesterday: "+2 since yesterday",
      vsLastMonthViews: "+14% vs last month",
      vsLastMonthEarnings: "+5% vs last month",
      manageSchedule: "Manage your upcoming schedule",
      searchPatients: "Search patients...",
      patientName: "Patient Name",
      phone: "Phone",
      date: "Date",
      time: "Time",
      status: "Status",
      confirmed: "Confirmed",
      noAppointments: "No upcoming appointments found.",
      egp: "EGP",
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Us",
    },
    specialties: {
      Cardiology: "Cardiology",
      Dermatology: "Dermatology",
      Orthopedics: "Orthopedics",
      Neurology: "Neurology",
      Pediatrics: "Pediatrics",
    } as Record<string, string>,
    locations: {
      "New Cairo": "New Cairo",
      Zamalek: "Zamalek",
      Maadi: "Maadi",
      Heliopolis: "Heliopolis",
      Dokki: "Dokki",
    } as Record<string, string>,
  },
  ar: {
    nav: {
      search: "البحث عن الأطباء",
      doctorLogin: "دخول الطبيب",
    },
    home: {
      heroTitle: "ابحث واحجز أفضل الأطباء في مصر مجاناً",
      heroSubtitle:
        "تواصل مع أفضل المتخصصين الطبيين. اقرأ تقييمات المرضى الموثقة، وقارن الرسوم، واحجز موعدك فوراً.",
      specialty: "التخصص",
      location: "المنطقة",
      chooseSpecialty: "اختر التخصص",
      chooseCityOrArea: "اختر المدينة أو المنطقة",
      search: "بحث",
      featuredSpecialists: "الأطباء المميزون",
      featuredSubtitle: "أفضل الأطباء متاحون للحجز اليوم.",
      viewAll: "عرض جميع الأطباء",
    },
    search: {
      placeholder: "البحث باسم الطبيب أو الأعراض...",
      filters: "الفلاتر",
      specialty: "التخصص",
      location: "المنطقة",
      clearFilters: "مسح الفلاتر",
      clearAllFilters: "مسح جميع الفلاتر",
      doctorsFound: (n: number) => `تم العثور على ${n} ${n === 1 ? "طبيب" : "أطباء"}`,
      noFound: "لم يتم العثور على أطباء",
      noFoundDesc: "حاول تعديل الفلاتر أو مصطلح البحث للعثور على نتائج أكثر.",
    },
    card: {
      reviews: "تقييم",
      bookAppointment: "احجز موعد",
      viewProfile: "عرض الملف الشخصي",
    },
    profile: {
      doctorNotFound: "الطبيب غير موجود",
      fee: "الرسوم",
      aboutDoctor: "عن الطبيب",
      bookAppointment: "حجز موعد",
      availableSlots: "المواعيد المتاحة",
      selectedSlot: "الموعد المحدد",
      change: "تغيير",
      patientName: "اسم المريض",
      fullName: "الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      consultationFee: "رسوم الاستشارة",
      bookingFee: "رسوم الحجز",
      free: "مجاناً",
      payAtClinic: "الدفع في العيادة",
      confirmBooking: "تأكيد الحجز",
      confirming: "جاري التأكيد...",
      bookingConfirmed: "تم تأكيد الحجز!",
      appointmentScheduled: "تم جدولة موعدك في",
      bookAnother: "حجز موعد آخر",
    },
    dashboard: {
      title: "لوحة التحكم",
      welcome: "مرحباً بعودتك، د. أحمد. إليك نظرة عامة على عيادتك.",
      appointments: "المواعيد",
      patients: "المرضى",
      performance: "الأداء",
      upcomingAppointments: "المواعيد القادمة",
      profileViews: "مشاهدات الملف (30 يوم)",
      totalEarnings: "إجمالي الأرباح (الشهر)",
      sinceYesterday: "+٢ منذ الأمس",
      vsLastMonthViews: "+١٤٪ مقارنة بالشهر الماضي",
      vsLastMonthEarnings: "+٥٪ مقارنة بالشهر الماضي",
      manageSchedule: "إدارة جدولك القادم",
      searchPatients: "البحث عن المرضى...",
      patientName: "اسم المريض",
      phone: "الهاتف",
      date: "التاريخ",
      time: "الوقت",
      status: "الحالة",
      confirmed: "مؤكد",
      noAppointments: "لا توجد مواعيد قادمة.",
      egp: "ج.م",
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      contact: "تواصل معنا",
    },
    specialties: {
      Cardiology: "أمراض القلب",
      Dermatology: "الأمراض الجلدية",
      Orthopedics: "جراحة العظام",
      Neurology: "الأعصاب",
      Pediatrics: "طب الأطفال",
    } as Record<string, string>,
    locations: {
      "New Cairo": "القاهرة الجديدة",
      Zamalek: "الزمالك",
      Maadi: "المعادي",
      Heliopolis: "مصر الجديدة",
      Dokki: "الدقي",
    } as Record<string, string>,
  },
} as const;

export type Translations = typeof translations.en;

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("egy-lang") as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("egy-lang", l);
  };

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  const t = translations[lang] as unknown as Translations;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
