import { useState, useMemo } from "react";
import { Search, MapPin, Phone, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getCities,
  getAreas,
  getMedicalCentersDirectory,
  getServices,
  type ApiCity,
  type ApiArea,
  type MedicalCenterDirectoryEntry,
  type ApiService,
} from "@/lib/api";

const VET_CATEGORIES = [
  {
    key: "preventive",
    en: "General & Preventive Care",
    ar: "الرعاية العامة والوقائية",
    emoji: "🩺",
    services: [
      { en: "General Check-up", ar: "كشف عام" },
      { en: "Vaccinations", ar: "التطعيمات والتحصينات" },
      { en: "Deworming & Parasite Control", ar: "علاج الديدان ومكافحة الطفيليات" },
      { en: "Nutritional Counseling", ar: "استشارات التغذية البيطرية" },
      { en: "Microchipping", ar: "تركيب الشريحة الإلكترونية" },
    ],
  },
  {
    key: "diagnostics",
    en: "Diagnostics & Laboratory",
    ar: "التشخيص والتحاليل",
    emoji: "🔬",
    services: [
      { en: "X-Ray (Radiology)", ar: "الأشعة السينية" },
      { en: "Ultrasound", ar: "الأشعة التلفزيونية (السونار)" },
      { en: "Comprehensive Blood Tests", ar: "تحاليل الدم الشاملة" },
      { en: "Biopsies & Histopathology", ar: "تحاليل الأنسجة والأورام" },
    ],
  },
  {
    key: "surgery",
    en: "Surgery",
    ar: "الجراحة",
    emoji: "🏥",
    services: [
      { en: "Spaying & Neutering", ar: "عمليات التعقيم والإخصاء" },
      { en: "General Surgery", ar: "الجراحة العامة" },
      { en: "Orthopedic Surgery", ar: "جراحة العظام والكسور" },
      { en: "Soft Tissue Surgery", ar: "جراحة الأنسجة الرخوة" },
      { en: "Ophthalmic Surgery", ar: "جراحة العيون" },
    ],
  },
  {
    key: "specialized",
    en: "Specialized Care",
    ar: "الرعاية المتخصصة",
    emoji: "⭐",
    services: [
      { en: "Veterinary Dentistry", ar: "طب أسنان الحيوانات" },
      { en: "Dermatology", ar: "الأمراض الجلدية" },
      { en: "Internal Medicine", ar: "الباطنة البيطرية" },
      { en: "Pregnancy & Obstetrics", ar: "متابعة الحمل والولادة" },
      { en: "Avian & Exotic Animal Medicine", ar: "طب الطيور والحيوانات الغريبة" },
    ],
  },
  {
    key: "emergency",
    en: "Emergency & Additional Services",
    ar: "الطوارئ والخدمات المكملة",
    emoji: "🚨",
    services: [
      { en: "Emergency & Critical Care", ar: "طوارئ وعناية مركزة" },
      { en: "Pet Grooming", ar: "النظافة والحلاقة (جرومينج)" },
      { en: "Pet Boarding", ar: "استضافة فندقية للحيوانات" },
      { en: "Home Visits", ar: "زيارات منزلية" },
      { en: "Travel Health Certificates", ar: "استخراج شهادات السفر" },
    ],
  },
];

export default function EgyVet() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [_, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [serviceFilters, setServiceFilters] = useState<Set<number>>(new Set());

  const { data: vetClinics = [], isLoading } = useQuery<MedicalCenterDirectoryEntry[]>({
    queryKey: ["vetClinics"],
    queryFn: () => getMedicalCentersDirectory({ subType: "VETERINARY_CLINIC" }),
  });

  const { data: cities = [] } = useQuery<ApiCity[]>({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  const { data: areas = [] } = useQuery<ApiArea[]>({
    queryKey: ["areas", selectedCityId],
    queryFn: () => getAreas(selectedCityId ?? undefined),
    enabled: selectedCityId !== null,
  });

  const { data: vetServices = [] } = useQuery<ApiService[]>({
    queryKey: ["services", "vet"],
    queryFn: () => getServices({ isVeterinary: true }),
    staleTime: 5 * 60 * 1000,
  });

  const selectedCityName = useMemo(
    () => (selectedCityId ? (cities.find((c) => c.id === selectedCityId)?.name ?? null) : null),
    [selectedCityId, cities],
  );

  const filteredClinics = useMemo(() => {
    return vetClinics.filter((clinic) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        clinic.name.toLowerCase().includes(q) ||
        (clinic.nameAr ?? "").includes(searchQuery.trim());
      const matchCity =
        !selectedCityName ||
        (clinic.cityName ?? "").toLowerCase() === selectedCityName.toLowerCase();
      const matchService =
        serviceFilters.size === 0 ||
        clinic.services.some((s) => serviceFilters.has(s.id));
      return matchSearch && matchCity && matchService;
    });
  }, [vetClinics, searchQuery, selectedCityName, serviceFilters]);

  function toggleServiceFilter(id: number) {
    setServiceFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white font-sans pb-20">
        {/* ── Header — matches Home.tsx structure ── */}
        <header className="bg-[#0F172A] pt-2 pb-4 px-4 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-col gap-1.5">
            {/* Top row: badge */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs text-gray-300 tracking-wide font-light">
                  {isRTL ? "منصة البيطريين الأولى في مصر 🐾" : "Egypt's #1 Veterinary Platform 🐾"}
                </span>
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center py-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1.5">
                {isRTL ? (
                  <>
                    ابحث عن{" "}
                    <span className="text-emerald-400">أفضل العيادات البيطرية</span>{" "}
                    في مصر
                  </>
                ) : (
                  <>
                    Find the{" "}
                    <span className="text-emerald-400">Best Veterinary Clinics</span>{" "}
                    in Egypt
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
                {isRTL
                  ? "رعاية متخصصة لحيواناتك الأليفة من أفضل العيادات البيطرية المعتمدة."
                  : "Specialized care for your beloved pets from certified veterinary clinics."}
              </p>
            </div>

            {/* Single Pill Search — same structure as Home.tsx */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-white rounded-2xl sm:rounded-full p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              {/* Search input */}
              <div className="flex items-center flex-1 h-9 pl-4">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isRTL
                      ? "ابحث عن عيادة بيطرية أو خدمة..."
                      : "Search veterinary clinics or services..."
                  }
                  className="flex-1 bg-transparent border-none outline-none px-3 text-[#0F172A] text-sm font-medium placeholder:font-normal placeholder:text-gray-400 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* City dropdown */}
              <div className="flex items-center sm:w-36 h-9 px-3 border-t sm:border-t-0 border-gray-100">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  className="flex-1 bg-transparent border-none outline-none text-[#0F172A] font-medium cursor-pointer pl-2 text-sm w-full truncate"
                  value={selectedCityId ?? ""}
                  onChange={(e) => {
                    setSelectedCityId(e.target.value ? Number(e.target.value) : null);
                    setSelectedAreaId(null);
                  }}
                >
                  <option value="">{isRTL ? "المدينة" : "City"}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isRTL ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Area dropdown */}
              <div
                className={`flex items-center sm:w-36 h-9 px-3 border-t sm:border-t-0 border-gray-100 ${!selectedCityId ? "opacity-40 pointer-events-none" : ""}`}
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  className="flex-1 bg-transparent border-none outline-none text-[#0F172A] font-medium cursor-pointer pl-2 text-sm w-full truncate"
                  value={selectedAreaId ?? ""}
                  onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!selectedCityId}
                >
                  <option value="">{isRTL ? "المنطقة" : "Area"}</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {isRTL ? a.nameAr : a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Find button */}
              <Button
                type="submit"
                className="bg-emerald-500 text-white font-bold rounded-xl sm:rounded-full px-6 h-9 mt-1.5 sm:mt-0 sm:ml-1.5 hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm border-none shrink-0 w-full sm:w-auto"
              >
                {isRTL ? "ابحث" : "Find Clinics"}
              </Button>
            </form>
          </div>
        </header>

        {/* ── Veterinary Services Categories ── */}
        <div className="bg-gray-50 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-lg font-extrabold text-slate-900 mb-1 text-center">
              {isRTL ? "خدماتنا البيطرية" : "Our Veterinary Services"}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-7">
              {isRTL
                ? "نوفر طيفاً واسعاً من الرعاية البيطرية المتخصصة"
                : "A wide range of specialized veterinary care under one roof"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VET_CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">
                      {isRTL ? cat.ar : cat.en}
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.services.map((svc, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        {isRTL ? svc.ar : svc.en}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Certified Veterinary Clinics ── */}
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              {isRTL ? "العيادات البيطرية المعتمدة" : "Certified Veterinary Clinics"}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredClinics.length}{" "}
              {isRTL ? "عيادة" : filteredClinics.length === 1 ? "clinic" : "clinics"}
            </span>
          </div>

          {/* Service filter chips — vet services only */}
          {vetServices.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              <span className="text-xs font-semibold text-gray-500 me-1">
                {isRTL ? "فلترة حسب الخدمة:" : "Filter by service:"}
              </span>
              {vetServices.map((svc) => {
                const active = serviceFilters.has(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleServiceFilter(svc.id)}
                    className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"
                    }`}
                  >
                    {isRTL ? svc.nameAr : svc.name}
                  </button>
                );
              })}
              {serviceFilters.size > 0 && (
                <button
                  type="button"
                  onClick={() => setServiceFilters(new Set())}
                  className="text-xs font-semibold text-emerald-700 underline ms-1"
                >
                  {isRTL ? "مسح الفلتر" : "Clear filter"}
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🐾</span>
              <p className="text-gray-500 font-medium text-sm">
                {isRTL
                  ? "لا توجد عيادات بيطرية متاحة حالياً"
                  : "No veterinary clinics available yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isRTL
                  ? "كن أول من يسجل عيادته البيطرية"
                  : "Be the first to register your veterinary clinic"}
              </p>
              <Link href="/auth?tab=signup&type=medical">
                <button className="mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors">
                  {isRTL ? "سجّل عيادتك الآن" : "Register Your Clinic"}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => navigate(`/medical-center/${clinic.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                >
                    <div className="flex items-start gap-3 mb-3">
                      {clinic.image ? (
                        <img
                          src={clinic.image}
                          alt={clinic.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-2xl">
                          🐾
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                          {isRTL && clinic.nameAr ? clinic.nameAr : clinic.name}
                        </h3>
                        {/* Location / address pill — matches Home.tsx medical center cards */}
                        {(clinic.address || clinic.cityName) && (
                          <a
                            href={
                              clinic.lat != null && clinic.lng != null
                                ? `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    [clinic.address, clinic.cityName].filter(Boolean).join(", "),
                                  )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {clinic.address
                              ? `${clinic.address}${clinic.cityName ? `, ${isRTL && clinic.cityNameAr ? clinic.cityNameAr : clinic.cityName}` : ""}`
                              : isRTL && clinic.cityNameAr
                                ? clinic.cityNameAr
                                : clinic.cityName}
                          </a>
                        )}
                      </div>
                    </div>

                    {(isRTL ? clinic.bioAr : clinic.bio) && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {isRTL ? clinic.bioAr : clinic.bio}
                      </p>
                    )}

                    {clinic.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {clinic.services.slice(0, 3).map((svc) => (
                          <span
                            key={svc.id}
                            className="text-[10px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 font-medium"
                          >
                            {isRTL ? svc.nameAr : svc.name}
                          </span>
                        ))}
                        {clinic.services.length > 3 && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                            +{clinic.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {clinic.phone ? (
                        <a
                          href={`tel:${clinic.phone}`}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-3 h-3" />
                          {clinic.phone}
                        </a>
                      ) : (
                        <span />
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
