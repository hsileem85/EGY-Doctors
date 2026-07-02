import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Filter, Search as SearchIcon, X, SlidersHorizontal, Building2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { getDoctors, getSpecialties, getCities } from "@/lib/api";

export default function Search() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const initialQuery = searchParams.get("q") || "";
  const initialSpecialty = searchParams.get("specialty") || "";
  const initialCity = searchParams.get("city") || "";
  const medicalCenterId = searchParams.get("medicalCenterId");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    initialCity ? [initialCity] : []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: allDoctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  const toggleSpecialty = (s: string) =>
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleCity = (c: string) =>
    setSelectedCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const medicalCenterName = useMemo(() => {
    if (!medicalCenterId) return null;
    const match = allDoctors.find(d => d.affiliatedCenter?.id === Number(medicalCenterId));
    return match?.affiliatedCenter?.name ?? null;
  }, [medicalCenterId, allDoctors]);

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter(doctor => {
      const matchSearch =
        searchQuery === "" ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSpecialty =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => doctor.specialty.toLowerCase().includes(s.toLowerCase()));

      const matchCity =
        selectedCities.length === 0 ||
        selectedCities.some(c => doctor.cityName.toLowerCase().includes(c.toLowerCase()));

      const matchMedicalCenter =
        !medicalCenterId || doctor.affiliatedCenter?.id === Number(medicalCenterId);

      return matchSearch && matchSpecialty && matchCity && matchMedicalCenter;
    });
  }, [searchQuery, selectedSpecialties, selectedCities, medicalCenterId, allDoctors]);

  const activeFilterCount = selectedSpecialties.length + selectedCities.length;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedCities([]);
    setSearchQuery("");
  };

  const filterPanel = (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <Filter className="h-5 w-5" />
          <h2>{t.search.filters}</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            {t.search.clearFilters}
          </button>
        )}
      </div>

      {specialties.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            {t.search.specialty}
          </h3>
          <div className="space-y-2.5">
            {specialties.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <Checkbox
                  id={`spec-${s.id}`}
                  checked={selectedSpecialties.includes(s.name)}
                  onCheckedChange={() => toggleSpecialty(s.name)}
                  data-testid={`checkbox-specialty-${s.name}`}
                />
                <Label htmlFor={`spec-${s.id}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                  {t.specialties[s.name] ?? s.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {cities.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            {t.search.location}
          </h3>
          <div className="space-y-2.5">
            {cities.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <Checkbox
                  id={`city-${c.id}`}
                  checked={selectedCities.includes(c.name)}
                  onCheckedChange={() => toggleCity(c.name)}
                  data-testid={`checkbox-location-${c.name}`}
                />
                <Label htmlFor={`city-${c.id}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                  {t.governorates[c.name] ?? t.locations[c.name] ?? c.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Sticky search bar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-2xl">
              <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t.search.placeholder}
                className="ps-12 h-11 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-primary shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                data-testid="input-search-doctors"
              />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(v => !v)}
              className={`md:hidden flex items-center gap-1.5 h-11 px-4 rounded-full border text-sm font-semibold transition-colors shrink-0 ${
                showMobileFilters || hasActiveFilters
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t.search.filters}
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-5 h-5 rounded-full bg-white text-primary text-[11px] font-black flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="md:hidden container mx-auto px-4 pt-4 pb-2">
          {filterPanel}
          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1 h-10 bg-primary text-white"
              onClick={() => setShowMobileFilters(false)}
            >
              {`Show ${filteredDoctors.length} results`}
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-[72px]">
              {filterPanel}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {medicalCenterId && (
              <div className="mb-4 flex items-center justify-between gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Building2 className="h-4 w-4 text-primary" />
                  {isRTL
                    ? `عرض أطباء ${medicalCenterName ?? "المركز الطبي"} فقط`
                    : `Showing doctors from ${medicalCenterName ?? "this medical center"} only`}
                </span>
                <button
                  onClick={() => setLocation("/search")}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80 shrink-0"
                >
                  <X className="h-3 w-3" />
                  {isRTL ? "إزالة" : "Clear"}
                </button>
              </div>
            )}

            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                {loadingDoctors
                  ? t.search.doctorsFound(0)
                  : t.search.doctorsFound(filteredDoctors.length)}
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden md:flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                  {t.search.clearFilters}
                </button>
              )}
            </div>

            {loadingDoctors ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-48" />
                ))}
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDoctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} showSlots={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.search.noFound}</h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm">{t.search.noFoundDesc}</p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  {t.search.clearAllFilters}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
