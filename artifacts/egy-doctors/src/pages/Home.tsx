import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  Search,
  MapPin,
  HeartPulse,
  Star,
  Navigation,
  LocateFixed,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { getDoctors, getSpecialties, type ApiDoctor } from "@/lib/api";

type SortOption = "nearest" | "rating" | "fee";

const HOME_STATS = [
  { value: "2,500+", label: "Verified Doctors", labelAr: "طبيب موثق" },
  { value: "27", label: "Governorates", labelAr: "محافظة" },
  { value: "150K+", label: "Monthly Bookings", labelAr: "حجز شهرياً" },
  { value: "4.9★", label: "Avg. Rating", labelAr: "متوسط التقييم" },
];

export default function Home() {
  const [_, setLocation] = useLocation();
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [shownPhones, setShownPhones] = useState<Map<number, Set<number>>>(new Map());
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  function togglePhone(docId: number, clinicIdx: number) {
    setShownPhones(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(docId) ?? []);
      set.has(clinicIdx) ? set.delete(clinicIdx) : set.add(clinicIdx);
      next.set(docId, set);
      return next;
    });
  }

  function mapsUrl(clinic: ApiDoctor["clinics"][number]): string {
    if (clinic.lat && clinic.lng)
      return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
    if (clinic.mapUrl) return clinic.mapUrl;
    const q = encodeURIComponent([clinic.address, clinic.location].filter(Boolean).join(", "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": isRTL ? "ar" : "en" } },
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const sub = addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.village ?? "";
          const city = addr.city ?? addr.town ?? addr.state_district ?? addr.county ?? "";
          setLocationName([sub, city].filter(Boolean).join(", ") || data.display_name?.split(",")[0] || "");
        } catch {
          // silently fail — keep previous value
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false),
      { timeout: 10000 },
    );
  }, [isRTL]);

  useEffect(() => { detectLocation(); }, []);

  const { data: allDoctors = [], isLoading } = useQuery<ApiDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (doctorName.trim()) params.set("q", doctorName.trim());
    if (specialty) params.set("specialty", specialty);
    setLocation(`/search?${params.toString()}`);
  };

  const sortedDoctors = useMemo(() => {
    return [...allDoctors].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "fee") return a.fee - b.fee;
      return 0;
    });
  }, [allDoctors, sortBy]);

  return (
    <Layout>
      <div className="min-h-screen bg-white font-sans pb-20">
        {/* Header: Location & Search */}
        <header className="bg-[#0F172A] pt-2 pb-4 px-4 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-col gap-1.5">
            {/* Top row: badge left, location right */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="text-xs font-medium text-gray-300 tracking-wide">
                  {isRTL ? "المنصة الطبية الأولى في مصر" : "Egypt's #1 Medical Booking Platform"}
                </span>
              </div>
              {/* Location indicator */}
              <div className="inline-flex items-center gap-1 bg-[#1E293B]/80 border border-[#334155] px-2 py-0.5 rounded-full text-white backdrop-blur-sm">
                <Navigation className="w-3 h-3 text-[#D4A853] fill-[#D4A853]/20" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-medium leading-none">
                    {isRTL ? "الموقع الحالي" : "Current Location"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide">
                    {isDetecting
                      ? (isRTL ? "جاري التحديد..." : "Detecting...")
                      : locationName || (isRTL ? "غير محدد" : "Unknown")}
                  </span>
                </div>
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="ml-1 pl-1 border-l border-[#334155] text-[8px] text-[#D4A853] hover:text-[#C49A48] font-semibold tracking-wide uppercase transition-colors disabled:opacity-50"
                >
                  {isDetecting
                    ? isRTL ? "..." : "..."
                    : isRTL ? "تحديث" : "Refresh"}
                </button>
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center py-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1.5">
                {isRTL ? (
                  <>
                    ابحث واحجز مع{" "}
                    <span className="text-[#D4A853]">أفضل الأطباء</span>{" "}
                    في مصر
                  </>
                ) : (
                  <>
                    Find &amp; Book the{" "}
                    <span className="text-[#D4A853]">Best Doctors</span>{" "}
                    in Egypt
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
                {isRTL
                  ? "تواصل مع أكثر من 2,500 طبيب موثق."
                  : "Connect with 2,500+ verified medical professionals."}
              </p>
            </div>

            {/* Single Pill Search */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl sm:rounded-full p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              {/* Doctor / clinic search input */}
              <div className="flex items-center flex-1 h-9 pl-4">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isRTL
                      ? "ابحث عن الأطباء، التخصصات، أو العيادات..."
                      : "Search doctors, specialties, or clinics..."
                  }
                  className="flex-1 bg-transparent border-none outline-none px-3 text-[#0F172A] text-sm font-medium placeholder:font-normal placeholder:text-gray-400 w-full"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>

              {/* Divider 1 */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Specialty dropdown */}
              <div className="flex items-center sm:w-40 h-9 px-3 border-t sm:border-t-0 border-gray-100">
                <HeartPulse className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  className="flex-1 bg-transparent border-none outline-none text-[#0F172A] font-medium cursor-pointer pl-2 text-sm w-full truncate"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">{isRTL ? "أي تخصص" : "Any Specialty"}</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>
                      {t.specialties[s.name] ?? s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider 2 */}
              <div className="hidden sm:block h-6 w-[1px] bg-gray-200 mx-1 shrink-0" />

              {/* Near Me button */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetecting}
                className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap"
              >
                <LocateFixed className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {isRTL ? "بالقرب مني" : "Near Me"}
              </button>

              {/* Find Doctors */}
              <Button
                type="submit"
                className="bg-[#D4A853] text-[#0F172A] font-bold rounded-xl sm:rounded-full px-6 h-9 mt-1.5 sm:mt-0 sm:ml-1.5 hover:bg-[#C49A48] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm border-none shrink-0"
              >
                {isRTL ? "ابحث" : "Find Doctors"}
              </Button>
            </form>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="bg-[#1E293B] border-b border-[#334155] py-1.5">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center text-xs sm:text-sm text-gray-300 gap-x-8 gap-y-4">
            {HOME_STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 tracking-wide">
                <span className="text-[#D4A853] font-bold">{s.value}</span>
                <span className="font-medium text-gray-400 uppercase text-[11px] sm:text-xs tracking-wider">
                  {isRTL ? s.labelAr : s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Browse by Specialty */}
        {specialties.length > 0 && (() => {
          const SPECIALTY_EMOJI: Record<string, string> = {
            neurology: "🧠", cardiology: "❤️", dentistry: "🦷",
            ophthalmology: "👁️", orthopedics: "🦴", dermatology: "🌿",
            pediatrics: "👶", oncology: "🧬", general: "🩺",
            pulmonology: "🫁", endocrinology: "🧪", psychiatry: "💊",
            gynecology: "🌸", urology: "🔬", gastroenterology: "🍃",
            nephrology: "💧", rheumatology: "🩹", "internal medicine": "⚕️",
          };
          const countBySpecialty: Record<string, number> = {};
          allDoctors.forEach(d => {
            if (d.specialty) countBySpecialty[d.specialty.toLowerCase()] = (countBySpecialty[d.specialty.toLowerCase()] ?? 0) + 1;
          });
          return (
            <div style={{ backgroundColor: '#e8eef5', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
              <section className="max-w-5xl mx-auto px-4 pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    {isRTL ? "تصفح حسب التخصص" : "Browse by Specialty"}
                  </h2>
                  <button
                    onClick={() => setLocation("/search")}
                    className="text-sm font-semibold text-[#D4A853] hover:underline"
                  >
                    {isRTL ? "عرض الكل ←" : "View all →"}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {specialties.map((sp) => {
                    const key = sp.name.toLowerCase();
                    const emoji = SPECIALTY_EMOJI[key] ?? "🏥";
                    const count = countBySpecialty[sp.name.toLowerCase()] ?? 0;
                    return (
                      <button
                        key={sp.id}
                        onClick={() => setLocation(`/search?specialty=${encodeURIComponent(sp.name)}`)}
                        className="rounded-xl p-2.5 flex flex-col items-center gap-1 transition-all group hover:border-[#D4A853]"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px 0 rgba(0,0,0,0.08)' }}
                      >
                        <span className="text-base">{emoji}</span>
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#D4A853] transition-colors text-center">
                          {isRTL ? sp.nameAr : sp.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {count} {isRTL ? "طبيب" : "doctors"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          );
        })()}

        {/* Main List */}
        <main className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
              {isRTL ? "الأطباء القريبون منك" : "Doctors Near You"}
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="text-[#0F172A]">
                {isRTL ? "ترتيب:" : "Sort by:"}
              </span>
              <select
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-[#0F172A]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="rating">
                  {isRTL ? "الأعلى تقييماً" : "Highest Rated"}
                </option>
                <option value="fee">
                  {isRTL ? "أقل رسوم" : "Lowest Fee"}
                </option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 w-full px-5 py-4"
                >
                  {/* 4-column grid on sm+, vertical stack on mobile */}
                  <div className="flex flex-col sm:grid sm:items-center gap-4 sm:gap-6"
                    style={{ gridTemplateColumns: "auto 1fr 1fr auto" }}>

                    {/* ── Col 1: Avatar + Rating ── */}
                    <div className="relative shrink-0 self-center">
                      <img
                        src={doc.image}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                        alt={doc.name}
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-slate-100 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="text-[10px] font-bold text-slate-800 leading-none">{doc.rating}</span>
                      </div>
                    </div>

                    {/* ── Col 2: Doctor Info ── */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Link href={`/doctor/${doc.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug hover:text-[#D4A853] cursor-pointer transition-colors">
                          {doc.name}
                        </h3>
                      </Link>
                      <span className="inline-flex items-center gap-1 self-start bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        <HeartPulse className="w-2.5 h-2.5 shrink-0" />
                        {t.specialties[doc.specialty] ?? doc.specialty}
                      </span>
                    </div>

                    {/* ── Col 3: Clinic Info ── */}
                    <div className="flex flex-col gap-1.5">
                      {doc.clinics.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">
                          {isRTL ? "لا توجد عيادات" : "No clinics listed"}
                        </span>
                      )}
                      {doc.clinics.map((clinic, ci) => {
                        const phoneVisible = shownPhones.get(doc.id)?.has(ci) ?? false;
                        const hasPhone = Boolean(clinic.phone);
                        return (
                          <div key={clinic.id} className="flex items-center gap-1">
                            <a
                              href={mapsUrl(clinic)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-500 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                            >
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {clinic.location || doc.location}
                            </a>
                            {hasPhone && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); togglePhone(doc.id, ci); }}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                  phoneVisible
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 hover:bg-green-50 hover:text-green-700 text-slate-400"
                                }`}
                              >
                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                {phoneVisible && (
                                  <a
                                    href={`tel:${clinic.phone}`}
                                    onClick={e => e.stopPropagation()}
                                    className="hover:underline"
                                  >
                                    {clinic.phone}
                                  </a>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Col 4: Price + Actions ── */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="text-center">
                        <span className="text-base font-bold text-slate-900">{doc.fee}</span>
                        <span className="text-[10px] font-medium text-slate-400 ml-1">{t.dashboard.egp}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/doctor/${doc.id}`}>
                          <Button className="bg-[#0F172A] text-white rounded-xl font-semibold text-[11px] hover:bg-slate-700 shadow-sm transition-all active:scale-[0.97] h-8 px-4 whitespace-nowrap">
                            {isRTL ? "احجز" : "Book"}
                          </Button>
                        </Link>
                        <Link href={`/profile/${doc.id}`}>
                          <Button
                            variant="outline"
                            className="text-slate-700 rounded-xl font-semibold text-[11px] border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all h-8 px-4 whitespace-nowrap"
                          >
                            {isRTL ? "الملف" : "Profile"}
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="px-6 py-3 rounded-xl border-gray-300 text-gray-600 font-semibold text-sm hover:bg-white transition-colors bg-transparent h-auto"
              onClick={() => setLocation("/search")}
            >
              {isRTL ? "تحميل المزيد من الأطباء" : "Load More Doctors"}
            </Button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
