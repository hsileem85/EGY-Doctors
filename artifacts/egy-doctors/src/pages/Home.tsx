import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Stethoscope, Building2, Shield, User, LogIn, UserPlus } from "lucide-react";
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
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600"
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
            <Link href="/patient-auth">
              <Button
                variant="outline"
                className="h-9 px-4 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-sm"
                data-testid="hero-patient-login"
              >
                <LogIn className="h-4 w-4 me-2" />
                {dir === "rtl" ? "تسجيل دخول" : "Sign In"}
              </Button>
            </Link>
            <Link href="/patient-auth">
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
    </Layout>
  );
}
