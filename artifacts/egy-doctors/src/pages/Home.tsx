import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Stethoscope, Building2, Shield, User, LogIn, UserPlus, FlaskConical, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { DoctorCard } from "@/components/DoctorCard";
import { doctors, specialties, locations, governorates, insuranceNetworks } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [governorate, setGovernorate] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [insurance, setInsurance] = useState<string>("");
  const { t, dir } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (doctorName.trim()) params.set("q", doctorName.trim());
    if (specialty) params.set("specialty", specialty);
    if (governorate) params.set("governorate", governorate);
    if (city) params.set("location", city);
    if (insurance) params.set("insurance", insurance);
    setLocation(`/search?${params.toString()}`);
  };

  const featuredDoctors = doctors.slice(0, 3);

  return (
    <Layout>
      {/* Hero - Immersive Floating Search */}
      <section className="relative overflow-hidden">
        {/* Full-bleed background */}
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}hero-bg.png`}
            alt="Modern hospital interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(158,65%,15%)]/60 via-[hsl(158,65%,20%)]/50 to-[hsl(158,65%,25%)]/70"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
            {t.home.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
            {t.home.heroSubtitle}
          </p>

          {/* Patient auth CTAs */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/auth">
              <Button
                variant="outline"
                className="h-9 px-4 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-sm"
                data-testid="hero-patient-login"
              >
                <LogIn className="h-4 w-4 me-2" />
                {dir === "rtl" ? "تسجيل دخول" : "Sign In"}
              </Button>
            </Link>
            <Link href="/auth?tab=signup">
              <Button
                className="h-9 px-4 bg-white text-primary hover:bg-white/90 text-sm"
                data-testid="hero-patient-register"
              >
                <UserPlus className="h-4 w-4 me-2" />
                {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
              </Button>
            </Link>
          </div>

          {/* Frosted glass floating search */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block px-1">
                {t.home.doctorName}
              </label>
              <div className="flex items-center gap-2 h-12 px-3 border border-white/20 rounded-lg bg-white/10">
                <User className="h-4 w-4 text-white/60 shrink-0" />
                <Input
                  type="text"
                  placeholder={t.home.chooseDoctorName}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 border-0 shadow-none focus-visible:ring-0 px-0 min-w-0"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  data-testid="input-doctor-name"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block px-1">
                {t.home.specialty}
              </label>
              <div className="flex items-center gap-2 h-12 px-3 border border-white/20 rounded-lg bg-white/10">
                <Stethoscope className="h-4 w-4 text-white/60 shrink-0" />
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="flex-1 bg-transparent text-sm text-white border-0 shadow-none focus:ring-0 px-0 min-w-0 [&>span]:text-white/50 data-[state=open]:ring-0">
                    <SelectValue placeholder={t.home.chooseSpecialty} />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s} value={s}>{t.specialties[s] ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block px-1">
                {t.home.governorate}
              </label>
              <div className="flex items-center gap-2 h-12 px-3 border border-white/20 rounded-lg bg-white/10">
                <Building2 className="h-4 w-4 text-white/60 shrink-0" />
                <Select value={governorate} onValueChange={setGovernorate}>
                  <SelectTrigger className="flex-1 bg-transparent text-sm text-white border-0 shadow-none focus:ring-0 px-0 min-w-0 [&>span]:text-white/50 data-[state=open]:ring-0">
                    <SelectValue placeholder={t.home.chooseGovernorate} />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map(g => (
                      <SelectItem key={g} value={g}>{t.governorates[g] ?? g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block px-1">
                {t.home.location}
              </label>
              <div className="flex items-center gap-2 h-12 px-3 border border-white/20 rounded-lg bg-white/10">
                <MapPin className="h-4 w-4 text-white/60 shrink-0" />
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="flex-1 bg-transparent text-sm text-white border-0 shadow-none focus:ring-0 px-0 min-w-0 [&>span]:text-white/50 data-[state=open]:ring-0">
                    <SelectValue placeholder={t.home.chooseCityOrArea} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l} value={l}>{t.locations[l] ?? l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 block px-1">
                {t.home.insurance}
              </label>
              <div className="flex items-center gap-2 h-12 px-3 border border-white/20 rounded-lg bg-white/10">
                <Shield className="h-4 w-4 text-white/60 shrink-0" />
                <Select value={insurance} onValueChange={setInsurance}>
                  <SelectTrigger className="flex-1 bg-transparent text-sm text-white border-0 shadow-none focus:ring-0 px-0 min-w-0 [&>span]:text-white/50 data-[state=open]:ring-0">
                    <SelectValue placeholder={t.home.chooseInsurance} />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceNetworks.map(i => (
                      <SelectItem key={i} value={i}>{t.insuranceNetworks[i] ?? i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full h-12 px-8 bg-white text-primary rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg"
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
                {t.home.search}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Specialists */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.home.featuredSpecialists}</h2>
              <p className="text-gray-600">{t.home.featuredSubtitle}</p>
            </div>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-primary/5 hidden md:flex"
              onClick={() => setLocation("/search")}
              data-testid="link-view-all"
            >
              {t.home.viewAll}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-8 md:hidden text-primary border-primary/20 bg-white"
            onClick={() => setLocation("/search")}
          >
            {t.home.viewAll}
          </Button>
        </div>
      </section>

      {/* Featured Medical Partners */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {dir === "rtl" ? "شركاؤنا الطبية المميزة" : "Featured Medical Partners"}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {dir === "rtl"
                ? "مستشفيات، مراكز تحاليل، ومراكز أشعة معتمدة لتقديم أفضل رعاية صحية."
                : "Trusted hospitals, labs, and radiology centers delivering top-tier care."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Saudi German Hospital */}
            <div className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  SGH
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {dir === "rtl" ? "مستشفى سعودي ألماني" : "Saudi German Hospital"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {dir === "rtl" ? "مستشفى متعدد التخصصات" : "Multi-Specialty Hospital"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {dir === "rtl"
                  ? "رعاية صحية شاملة بأحدث التقنيات وفريق طبي متخصص."
                  : "Comprehensive care with cutting-edge technology and a team of 300+ specialists."}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                <Building2 className="h-3 w-3" />
                {dir === "rtl" ? "القاهرة · الإسكندرية" : "Cairo · Alexandria"}
              </div>
            </div>

            {/* Dar Al Fouad */}
            <div className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  DAF
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {dir === "rtl" ? "دار الفواد" : "Dar Al Fouad"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {dir === "rtl" ? "مستشفى ومركز طبي" : "Hospital & Medical Center"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {dir === "rtl"
                  ? "مركز رعاية صحية متكامل مع تخصصات القلب والكبد والعظام."
                  : "Full-service health center with heart, liver, and organ transplant specialties."}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                <Building2 className="h-3 w-3" />
                {dir === "rtl" ? "6 أوتوستا · القاهرة" : "6th of October · Cairo"}
              </div>
            </div>

            {/* Alfa Lab */}
            <div className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  AL
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {dir === "rtl" ? "ألفا لاب" : "Alfa Lab"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {dir === "rtl" ? "مراكز تحاليل" : "Laboratory Network"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {dir === "rtl"
                  ? "شبكة مراكز تحاليل رائدة بأحدث الأجهزة ونتائج دقيقة."
                  : "A leading lab network with state-of-the-art equipment and accurate results."}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                <FlaskConical className="h-3 w-3" />
                {dir === "rtl" ? "40+ فرع · مصر" : "40+ Branches · Egypt"}
              </div>
            </div>

            {/* Alfa Scan */}
            <div className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  AS
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {dir === "rtl" ? "ألفا سكان" : "Alfa Scan"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {dir === "rtl" ? "مراكز أشعة ورنتجن" : "Radiology & Imaging"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {dir === "rtl"
                  ? "أحدث أجهزة الأشعة التشخيصية مع فريق من أفضل الأطباء."
                  : "Advanced diagnostic imaging with MRI, CT, and ultrasound by top radiologists."}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                <Scan className="h-3 w-3" />
                {dir === "rtl" ? "25+ فرع · مصر" : "25+ Branches · Egypt"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
