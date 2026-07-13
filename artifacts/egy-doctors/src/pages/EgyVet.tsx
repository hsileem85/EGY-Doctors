import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, MapPin, Phone, Star, Navigation, LocateFixed, Stethoscope } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


export default function EgyVet() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [_, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setLocationToast(msg);
    setTimeout(() => setLocationToast(null), 4000);
  }

  const detectLocation = useCallback(
    (activateNearMe = false) => {
      if (!navigator.geolocation) {
        showToast(
          isRTL
            ? "المتصفح لا يدعم تحديد الموقع"
            : "Geolocation is not supported by your browser",
        );
        return;
      }
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            setUserCoords({ lat: latitude, lng: longitude });
            if (activateNearMe) setNearMeActive(true);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { "Accept-Language": isRTL ? "ar" : "en" } },
            );
            const data = await res.json();
            const addr = data.address ?? {};
            const sub =
              addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.village ?? "";
            const city =
              addr.city ?? addr.town ?? addr.state_district ?? addr.county ?? "";
            setLocationName(
              [sub, city].filter(Boolean).join(", ") ||
                data.display_name?.split(",")[0] ||
                "",
            );
          } catch {
            /* silently keep previous value */
          } finally {
            setIsDetecting(false);
          }
        },
        () => {
          setIsDetecting(false);
          showToast(
            isRTL
              ? "الرجاء السماح بالوصول إلى موقعك أو اكتب منطقتك يدوياً"
              : "Please allow location access or type your area manually",
          );
        },
        { timeout: 10000 },
      );
    },
    [isRTL],
  );

  useEffect(() => {
    detectLocation();
  }, []);

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
    () =>
      selectedCityId ? (cities.find((c) => c.id === selectedCityId)?.name ?? null) : null,
    [selectedCityId, cities],
  );

  const filteredClinics = useMemo(() => {
    let results = vetClinics.filter((clinic) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        clinic.name.toLowerCase().includes(q) ||
        (clinic.nameAr ?? "").includes(searchQuery.trim());
      const matchCity =
        !selectedCityName ||
        (clinic.cityName ?? "").toLowerCase() === selectedCityName.toLowerCase();
      const matchService =
        selectedServiceId === null ||
        clinic.services.some((s) => s.id === selectedServiceId);
      return matchSearch && matchCity && matchService;
    });

    if (nearMeActive && userCoords) {
      results = [...results].sort((a, b) => {
        const da =
          a.lat != null && a.lng != null
            ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng)
            : Infinity;
        const db =
          b.lat != null && b.lng != null
            ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng)
            : Infinity;
        return da - db;
      });
    }

    return results;
  }, [vetClinics, searchQuery, selectedCityName, selectedServiceId, nearMeActive, userCoords]);

  return (
    <Layout>
      <div className="min-h-screen bg-white font-sans pb-20">
        {/* ── Header — matches Home.tsx structure ── */}
        <header className="bg-[#0F172A] pt-2 pb-4 px-4 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-col gap-1.5">

            {/* Top row: badge left, location indicator right */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs text-gray-300 tracking-wide font-light">
                  {isRTL ? "منصة البيطريين الأولى في مصر 🐾" : "Egypt's #1 Veterinary Platform 🐾"}
                </span>
              </div>

              {/* Location indicator — identical pattern to Home.tsx */}
              <div className="inline-flex gap-1 bg-[#1E293B]/80 border border-[#334155] px-2 py-0.5 rounded-full text-white backdrop-blur-sm justify-start items-center font-light text-[15px]">
                <Navigation className="w-3 h-3 text-[#D4A853] fill-[#D4A853]/20" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-medium leading-none">
                    {isRTL ? "الموقع الحالي" : "Current Location"}
                  </span>
                  <span className="text-[10px] tracking-wide font-light">
                    {isDetecting
                      ? isRTL ? "جاري التحديد..." : "Detecting..."
                      : locationName || (isRTL ? "غير محدد" : "Unknown")}
                  </span>
                </div>
                <button
                  onClick={() => detectLocation()}
                  disabled={isDetecting}
                  className="ml-1 pl-1 border-l border-[#334155] text-[8px] text-[#D4A853] hover:text-[#C49A48] tracking-wide uppercase transition-colors disabled:opacity-50 font-light"
                >
                  {isDetecting ? "..." : isRTL ? "تحديث" : "Refresh"}
                </button>
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
                      ? "ابحث عن عيادة بيطرية..."
                      : "Search veterinary clinics..."
                  }
                  className="flex-1 bg-transparent border-none outline-none px-3 text-[#0F172A] text-sm font-medium placeholder:font-normal placeholder:text-gray-400 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Service dropdown */}
              <SearchableSelect
                className=""
                icon={<Stethoscope className="w-3.5 h-3.5 text-gray-400" />}
                options={vetServices.map((s) => ({ value: s.id, label: isRTL ? s.nameAr : s.name }))}
                value={selectedServiceId}
                onChange={(v) => setSelectedServiceId(v ? Number(v) : null)}
                placeholder={isRTL ? "الخدمة" : "Service"}
              />

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* City dropdown */}
              <SearchableSelect
                className=""
                icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
                options={cities.map((c) => ({ value: c.id, label: isRTL ? c.nameAr : c.name }))}
                value={selectedCityId}
                onChange={(v) => { setSelectedCityId(v ? Number(v) : null); setSelectedAreaId(null); }}
                placeholder={isRTL ? "المدينة" : "City"}
              />

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Area dropdown */}
              <SearchableSelect
                className=""
                icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
                options={areas.map((a) => ({ value: a.id, label: isRTL ? a.nameAr : a.name }))}
                value={selectedAreaId}
                onChange={(v) => setSelectedAreaId(v ? Number(v) : null)}
                placeholder={isRTL ? "المنطقة" : "Area"}
                disabled={!selectedCityId}
              />

              {/* Divider */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Near Me button */}
              <button
                type="button"
                onClick={() => {
                  if (nearMeActive) {
                    setNearMeActive(false);
                  } else {
                    if (userCoords) {
                      setNearMeActive(true);
                    } else {
                      detectLocation(true);
                    }
                  }
                }}
                disabled={isDetecting}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap border-t sm:border-t-0 border-gray-100 ${
                  nearMeActive
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <LocateFixed
                  className={`w-3.5 h-3.5 shrink-0 ${nearMeActive ? "text-white" : "text-slate-500"}`}
                />
                {isRTL ? "بالقرب مني" : "Near Me"}
                {nearMeActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                )}
              </button>

              {/* Find button */}
              <Button
                type="submit"
                className="bg-emerald-500 text-white font-bold rounded-xl sm:rounded-full px-5 h-9 mt-1.5 sm:mt-0 sm:ml-1.5 hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm border-none shrink-0 w-full sm:w-auto"
              >
                {isRTL ? "ابحث" : "Find Clinics"}
              </Button>
            </form>
          </div>

          {/* Location toast */}
          {locationToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm text-center">
              <LocateFixed className="w-4 h-4 text-emerald-400 shrink-0" />
              {locationToast}
            </div>
          )}
        </header>

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
              {filteredClinics.map((clinic) => {
                const initials = clinic.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w: string) => w[0] ?? "")
                  .join("")
                  .toUpperCase();
                const mapsHref =
                  clinic.lat != null && clinic.lng != null
                    ? `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [clinic.address, clinic.cityName].filter(Boolean).join(", "),
                      )}`;
                return (
                  <div
                    key={clinic.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/medical-center/${clinic.id}`)}
                  >
                    {/* Top section */}
                    <div className="flex items-start gap-3 p-4 pb-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {clinic.image ? (
                          <img
                            src={clinic.image}
                            alt={clinic.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold text-lg">
                            {initials || "🐾"}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -left-1 flex items-center gap-0.5 bg-amber-400 rounded-md px-1.5 py-0.5">
                          <Star className="w-2.5 h-2.5 text-white fill-white" />
                          <span className="text-[10px] font-bold text-white">0</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {isRTL && clinic.nameAr ? clinic.nameAr : clinic.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isRTL ? "عيادة بيطرية" : "Veterinary Clinic"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {(clinic.address || clinic.cityName) && (
                            <a
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md px-2 py-0.5 font-medium transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {isRTL && clinic.cityNameAr
                                ? clinic.cityNameAr
                                : clinic.cityName ?? clinic.address}
                            </a>
                          )}
                          {clinic.phone && (
                            <a
                              href={`tel:${clinic.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom buttons */}
                    <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/medical-center/${clinic.id}`); }}
                        className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-gray-50 transition-colors text-center"
                      >
                        {isRTL ? "عرض الملف الشخصي" : "View Profile"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/medical-center/${clinic.id}`); }}
                        className="flex-1 py-2.5 text-xs font-bold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors text-center"
                      >
                        {isRTL ? "احجز موعدك" : "Book Appointment"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
