import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar";

const translations = {
  en: {
    nav: {
      search: "Search Doctors",
      doctorLogin: "Doctor Login",
      register: "Register",
      about: "About Us",
    },
    home: {
      heroTitle: "Find & Book the Best Doctors in Egypt for Free",
      heroSubtitle:
        "Connect with top-rated medical professionals. Read verified patient reviews, compare fees, and book your appointment instantly.",
      doctorName: "Doctor Name",
      specialty: "Specialty",
      governorate: "Governorate",
      location: "Location",
      insurance: "Insurance Network",
      chooseDoctorName: "Search by name...",
      chooseSpecialty: "Choose specialty",
      chooseGovernorate: "Choose governorate",
      chooseCityOrArea: "Choose city or area",
      chooseInsurance: "Choose insurance",
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
      publishContent: "Publish Content",
      recentPublications: "Recent Publications",
      newPublication: "New Publication",
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
    register: {
      title: "Doctor Registration",
      step1: "Account Details",
      step2: "Professional Info",
      stepIndicator: (current: number, total: number) => `Step ${current} of ${total}`,
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      showPassword: "Show Password",
      hidePassword: "Hide Password",
      next: "Next",
      back: "Back",
      specialty: "Specialty",
      location: "Location / Area",
      yearsOfExperience: "Years of Experience",
      licenseNumber: "Medical License Number",
      agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
      register: "Register",
      successTitle: "Registration Successful!",
      successDesc: "Your account has been created. Please complete your profile to start accepting appointments.",
      goToProfileSetup: "Go to Profile Setup",
      alreadyHaveAccount: "Already have an account?",
      login: "Login here",
    },
    profileSetup: {
      title: "Profile Setup",
      personalInfo: "Personal Info",
      clinicInfo: "Clinic Info",
      bio: "Biography",
      availability: "Availability",
      uploadPhoto: "Upload Photo",
      fullName: "Full Name",
      specialty: "Specialty",
      subSpecialty: "Sub-specialty / Title",
      clinicName: "Clinic Name",
      clinicAddress: "Clinic Address",
      cityArea: "City / Area",
      consultationFee: "Consultation Fee",
      aboutMe: "About Me",
      charCount: (count: number) => `${count} / 500 characters`,
      weeklySchedule: "Weekly Schedule",
      timeFrom: "From",
      timeTo: "To",
      days: {
        Sat: "Saturday",
        Sun: "Sunday",
        Mon: "Monday",
        Tue: "Tuesday",
        Wed: "Wednesday",
        Thu: "Thursday",
        Fri: "Friday"
      },
      savePublish: "Save & Publish Profile",
      publishedSuccess: "Profile Published!",
    },
    publish: {
      title: "Publish Content",
      tabs: {
        article: "Article",
        video: "Video",
        advice: "Advice / Tip"
      },
      articleTitle: "Title",
      category: "Category",
      coverImage: "Cover Image URL",
      content: "Content",
      tags: "Tags (Type and press Enter)",
      publishArticle: "Publish Article",
      videoTitle: "Video Title",
      youtubeUrl: "YouTube URL",
      description: "Description",
      publishVideo: "Publish Video",
      adviceTitle: "Advice Title",
      adviceBody: "Advice Body",
      icon: "Icon",
      publishAdvice: "Publish Advice",
      publishedSuccessfully: "Published successfully!",
      publishAnother: "Publish Another",
      recentlyPublished: "Recently Published",
      categories: {
        general: "General Health",
        cardio: "Cardiology",
        derma: "Dermatology",
        nutrition: "Nutrition",
        mental: "Mental Health",
        peds: "Pediatrics"
      }
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
    governorates: {
      Cairo: "Cairo",
      Giza: "Giza",
      Alexandria: "Alexandria",
    } as Record<string, string>,
    insuranceNetworks: {
      Cigna: "Cigna",
      AXA: "AXA",
      MetLife: "MetLife",
      Bupa: "Bupa",
      None: "None",
    } as Record<string, string>,
  },
  ar: {
    nav: {
      search: "البحث عن الأطباء",
      doctorLogin: "دخول الطبيب",
      register: "تسجيل",
      about: "من نحن",
    },
    home: {
      heroTitle: "ابحث واحجز أفضل الأطباء في مصر مجاناً",
      heroSubtitle:
        "تواصل مع أفضل المتخصصين الطبيين. اقرأ تقييمات المرضى الموثقة، وقارن الرسوم، واحجز موعدك فوراً.",
      doctorName: "اسم الطبيب",
      specialty: "التخصص",
      governorate: "المحافظة",
      location: "المنطقة",
      insurance: "شبكة التأمين",
      chooseDoctorName: "ابحث بالاسم...",
      chooseSpecialty: "اختر التخصص",
      chooseGovernorate: "اختر المحافظة",
      chooseCityOrArea: "اختر المدينة أو المنطقة",
      chooseInsurance: "اختر التأمين",
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
      publishContent: "نشر محتوى",
      recentPublications: "المنشورات الأخيرة",
      newPublication: "منشور جديد",
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
    register: {
      title: "تسجيل الطبيب",
      step1: "بيانات الحساب",
      step2: "المعلومات المهنية",
      stepIndicator: (current: number, total: number) => `الخطوة ${current} من ${total}`,
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      next: "التالي",
      back: "السابق",
      specialty: "التخصص",
      location: "المنطقة / الموقع",
      yearsOfExperience: "سنوات الخبرة",
      licenseNumber: "رقم الترخيص الطبي",
      agreeToTerms: "أوافق على شروط الخدمة وسياسة الخصوصية",
      register: "تسجيل",
      successTitle: "تم التسجيل بنجاح!",
      successDesc: "تم إنشاء حسابك. يرجى إكمال ملفك الشخصي للبدء في استقبال المواعيد.",
      goToProfileSetup: "الذهاب لإعداد الملف الشخصي",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      login: "تسجيل الدخول من هنا",
    },
    profileSetup: {
      title: "إعداد الملف الشخصي",
      personalInfo: "المعلومات الشخصية",
      clinicInfo: "معلومات العيادة",
      bio: "السيرة الذاتية",
      availability: "المواعيد المتاحة",
      uploadPhoto: "رفع صورة",
      fullName: "الاسم الكامل",
      specialty: "التخصص",
      subSpecialty: "التخصص الدقيق / اللقب",
      clinicName: "اسم العيادة",
      clinicAddress: "عنوان العيادة",
      cityArea: "المدينة / المنطقة",
      consultationFee: "رسوم الاستشارة",
      aboutMe: "نبذة عني",
      charCount: (count: number) => `${count} / 500 حرف`,
      weeklySchedule: "الجدول الأسبوعي",
      timeFrom: "من",
      timeTo: "إلى",
      days: {
        Sat: "السبت",
        Sun: "الأحد",
        Mon: "الإثنين",
        Tue: "الثلاثاء",
        Wed: "الأربعاء",
        Thu: "الخميس",
        Fri: "الجمعة"
      },
      savePublish: "حفظ ونشر الملف",
      publishedSuccess: "تم نشر الملف الشخصي!",
    },
    publish: {
      title: "نشر محتوى",
      tabs: {
        article: "مقال",
        video: "فيديو",
        advice: "نصيحة"
      },
      articleTitle: "العنوان",
      category: "التصنيف",
      coverImage: "رابط صورة الغلاف",
      content: "المحتوى",
      tags: "الوسوم (اكتب واضغط Enter)",
      publishArticle: "نشر المقال",
      videoTitle: "عنوان الفيديو",
      youtubeUrl: "رابط يوتيوب",
      description: "الوصف",
      publishVideo: "نشر الفيديو",
      adviceTitle: "عنوان النصيحة",
      adviceBody: "محتوى النصيحة",
      icon: "أيقونة",
      publishAdvice: "نشر النصيحة",
      publishedSuccessfully: "تم النشر بنجاح!",
      publishAnother: "نشر المزيد",
      recentlyPublished: "المنشورات الأخيرة",
      categories: {
        general: "صحة عامة",
        cardio: "أمراض القلب",
        derma: "جلدية",
        nutrition: "تغذية",
        mental: "صحة نفسية",
        peds: "طب أطفال"
      }
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
    governorates: {
      Cairo: "القاهرة",
      Giza: "الجيزة",
      Alexandria: "الإسكندرية",
    } as Record<string, string>,
    insuranceNetworks: {
      Cigna: "سيجنا",
      AXA: "أكسا",
      MetLife: "ميتلايف",
      Bupa: "بوبا",
      None: "لا يوجد",
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
