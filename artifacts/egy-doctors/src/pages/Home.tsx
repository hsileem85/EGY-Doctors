import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  Search,
  MapPin,
  HeartPulse,
  Star,
  Navigation,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { doctors, specialties, stats } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

type SortOption = "nearest" | "rating" | "fee";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("nearest");
  const [isDetecting, setIsDetecting] = useState(false);
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (doctorName.trim()) params.set("q", doctorName.trim());
    if (specialty) params.set("specialty", specialty);
    setLocation(`/search?${params.toString()}`);
  };

  const sortedDoctors = [...doctors].sort((a, b) => {
    if (sortBy === "nearest") {
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    }
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "fee") return a.fee - b.fee;
    return 0;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-[#F1F5F9] font-sans pb-20">
        {/* Header: Location & Search */}
        <header className="bg-[#0F172A] pt-8 pb-10 px-4 shadow-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Location indicator */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2.5 bg-[#1E293B]/80 border border-[#334155] px-5 py-2.5 rounded-full text-white backdrop-blur-sm">
                <Navigation className="w-5 h-5 text-[#D4A853] fill-[#D4A853]/20" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium leading-none mb-0.5">
                    {isRTL ? "الموقع الحالي" : "Current Location"}
                  </span>
                  <span className="text-sm font-bold tracking-wide">
                    {isRTL ? "المعادي، محافظة القاهرة" : "Maadi, Cairo Governorate"}
                  </span>
                </div>
                <button
                  onClick={() => setIsDetecting(true)}
                  className="ml-3 pl-3 border-l border-[#334155] text-xs text-[#D4A853] hover:text-[#C49A48] font-semibold tracking-wide uppercase transition-colors"
                >
                  {isDetecting
                    ? isRTL
                      ? "جاري التحديد..."
                      : "Detecting..."
                    : isRTL
                      ? "تغيير"
                      : "Change"}
                </button>
              </div>
            </div>

            {/* Single Pill Search */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center flex-1 h-12 sm:h-14 pl-4">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isRTL
                      ? "ابحث عن الأطباء، التخصصات، أو العيادات..."
                      : "Search doctors, specialties, or clinics..."
                  }
                  className="flex-1 bg-transparent border-none outline-none px-3 text-[#0F172A] font-medium placeholder:font-normal placeholder:text-gray-400 w-full"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-gray-200 mx-1"></div>

              <div className="flex items-center flex-1 sm:flex-none sm:w-48 h-12 sm:h-14 px-4 border-t sm:border-t-0 border-gray-100">
                <HeartPulse className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  className="flex-1 bg-transparent border-none outline-none text-[#0F172A] font-medium cursor-pointer pl-2 text-sm w-full truncate"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">
                    {isRTL ? "أي تخصص" : "Any Specialty"}
                  </option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {t.specialties[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="bg-[#D4A853] text-[#0F172A] font-bold rounded-xl sm:rounded-full px-8 h-12 sm:h-14 mt-2 sm:mt-0 sm:ml-2 hover:bg-[#C49A48] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base border-none"
              >
                {isRTL ? "ابحث عن الأطباء" : "Find Doctors"}
              </Button>
            </form>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="bg-[#1E293B] border-b border-[#334155] py-4">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center text-xs sm:text-sm text-gray-300 gap-x-8 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2 tracking-wide">
                <span className="text-[#D4A853] font-bold">{s.value}</span>
                <span className="font-medium text-gray-400 uppercase text-[11px] sm:text-xs tracking-wider">
                  {isRTL ? s.labelAr : s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main List */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
              {isRTL ? "الأطباء القريبون منك" : "Doctors Near You"}
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span className="text-[#0F172A]">
                {isRTL ? "ترتيب:" : "Sort by:"}
              </span>
              <select
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-[#0F172A]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="nearest">
                  {isRTL ? "الأقرب أولاً" : "Nearest First"}
                </option>
                <option value="rating">
                  {isRTL ? "الأعلى تقييماً" : "Highest Rated"}
                </option>
                <option value="fee">
                  {isRTL ? "أقل رسوم" : "Lowest Fee"}
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {sortedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-start"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={doc.image}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shadow-sm border border-gray-100"
                    alt={doc.name}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    <div className="bg-[#D4A853]/10 text-[#0F172A] font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#D4A853] text-[#D4A853]" />
                      {doc.rating}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <Link href={`/doctor/${doc.id}`}>
                        <h3 className="text-lg font-bold text-[#0F172A] leading-tight hover:text-[#D4A853] cursor-pointer transition-colors truncate">
                          {doc.name}
                        </h3>
                      </Link>
                      <p className="text-[#0F172A]/70 text-xs font-medium flex items-center gap-1 mt-0.5">
                        <HeartPulse className="w-3.5 h-3.5 text-[#D4A853]" />
                        {t.specialties[doc.specialty] ?? doc.specialty}
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] px-2 py-0.5 rounded-lg border border-gray-200 flex items-center gap-1 shrink-0">
                      <Navigation className="w-3 h-3 text-[#D4A853] fill-[#D4A853]/20" />
                      <span className="font-bold text-[#0F172A] text-[11px]">{doc.distance}</span>
                    </div>
                  </div>

                  {/* Info Pills — compact inline row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                    <span className="font-bold text-[#0F172A]">{doc.fee} {t.dashboard.egp}</span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {t.locations[doc.location] ?? doc.location}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-[#D4A853] font-semibold">
                      <CalendarDays className="w-3 h-3" />
                      {doc.nextAvailable}
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="w-full sm:w-[80px] flex flex-col gap-1 shrink-0 sm:border-l border-gray-100 sm:pl-2 sm:py-0.5 mt-1 sm:mt-0">
                  <Link href={`/doctor/${doc.id}`}>
                    <Button className="w-full bg-[#0F172A] text-white rounded-lg py-2 font-semibold text-xs hover:bg-[#1E293B] shadow-sm transition-all active:scale-[0.98] h-auto">
                      {isRTL ? "احجز" : "Book"}
                    </Button>
                  </Link>
                  <Link href={`/doctor/${doc.id}`}>
                    <Button
                      variant="outline"
                      className="w-full bg-white text-[#0F172A] rounded-lg py-1.5 font-semibold text-xs border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all h-auto"
                    >
                      {isRTL ? "الملف" : "Profile"}
                    </Button>
                  </Link>
                  <a
                    href={doc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[11px] font-medium text-[#D4A853] hover:text-[#c49a4a] transition-colors py-0.5"
                  >
                    <Navigation className="w-3 h-3" />
                    {isRTL ? "الخريطة" : "Map"}
                  </a>
                </div>
              </div>
            ))}
          </div>

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
