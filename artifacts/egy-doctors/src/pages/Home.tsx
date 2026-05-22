import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { DoctorCard } from "@/components/DoctorCard";
import { doctors, specialties, locations } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [specialty, setSpecialty] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("location", city);
    setLocation(`/search?${params.toString()}`);
  };

  const featuredDoctors = doctors.slice(0, 3);

  return (
    <Layout>
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl">
              {t.home.heroSubtitle}
            </p>

            <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">
                  {t.home.specialty}
                </label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="h-12 border-gray-200" data-testid="select-specialty">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Stethoscope className="h-4 w-4" />
                      <SelectValue placeholder={t.home.chooseSpecialty} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s} value={s}>{t.specialties[s] ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">
                  {t.home.location}
                </label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-12 border-gray-200" data-testid="select-location">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <SelectValue placeholder={t.home.chooseCityOrArea} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l} value={l}>{t.locations[l] ?? l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 text-base font-semibold" data-testid="button-search">
                <Search className="h-5 w-5 me-2" />
                {t.home.search}
              </Button>
            </form>
          </div>
        </div>
      </section>

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
