import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Filter, Search as SearchIcon, X, SlidersHorizontal, Building2, MapPin, Users, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import {
  getDoctors, getSpecialties, getCities, getAreas, getMedicalCentersDirectory, getServices,
  type MedicalCenterDirectoryEntry, type ApiService, type ApiArea,
} from "@/lib/api";

export default function Search() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const initialQuery = searchParams.get("q") || "";
  const initialSpecialty = searchParams.get("specialty") || "";
  const initialCityId = searchParams.get("cityId") ? Number(searchParams.get("cityId")) : null;
  const initialAreaId = searchParams.get("areaId") ? Number(searchParams.get("areaId")) : null;
  const initialServices = searchParams.get("services") || "";
  const medicalCenterId = searchParams.get("medicalCenterId");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [selectedCityId, setSelectedCityId] = useState<number | null>(initialCityId);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(initialAreaId);
  const [selectedServices, setSelectedServices] = useState<number[]>(
    initialServices
      ? initialServices.split(",").filter(Boolean).map(Number).filter((n) => !Number.isNaN(n))
      : []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: allDoctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors", selectedCityId, selectedAreaId],
    queryFn: () => getDoctors({
      ...(selectedCityId ? { cityId: selectedCityId } : {}),
      ...(selectedAreaId ? { areaId: selectedAreaId } : {}),
    }),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  const { data: areas = [] } = useQuery<ApiArea[]>({
    queryKey: ["areas", selectedCityId],
    queryFn: () => getAreas(selectedCityId ?? undefined),
    enabled: selectedCityId !== null,
  });

  const { data: medicalCenters = [] } = useQuery<MedicalCenterDirectoryEntry[]>({
    queryKey: ["medicalCentersDirectory"],
    queryFn: () => getMedicalCentersDirectory(),
  });

  const { data: serviceOptions = [] } = useQuery<ApiService[]>({
    queryKey: ["services"],
    queryFn: () => getServices(),
  });

  const toggleSpecialty = (s: string) =>
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleCityChange = (cityId: number | null) => {
    setSelectedCityId(cityId);
    setSelectedAreaId(null);
    const params = new URLSearchParams(searchString);
    if (cityId) params.set("cityId", String(cityId)); else params.delete("cityId");
    params.delete("areaId");
    setLocation(`/search?${params.toString()}`, { replace: true });
  };

  const handleAreaChange = (areaId: number | null) => {
    setSelectedAreaId(areaId);
    const params = new URLSearchParams(searchString);
    if (areaId) params.set("areaId", String(areaId)); else params.delete("areaId");
    setLocation(`/search?${params.toString()}`, { replace: true });
  };

  const toggleService = (s: number) => {
    setSelectedServices(prev => {
      const next = prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s];
      const params = new URLSearchParams(searchString);
      if (next.length > 0) params.set("services", next.join(","));
      else params.delete("services");
      setLocation(`/search?${params.toString()}`, { replace: true });
      return next;
    });
  };

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

      const matchMedicalCenter =
        !medicalCenterId || doctor.affiliatedCenter?.id === Number(medicalCenterId);

      const matchService =
        selectedServices.length === 0 ||
        (doctor.affiliatedCenter?.services ?? []).some(s => selectedServices.includes(s.id));

      return matchSearch && matchSpecialty && matchMedicalCenter && matchService;
    });
  }, [searchQuery, selectedSpecialties, selectedServices, medicalCenterId, allDoctors]);

  const selectedCityName = useMemo(
    () => selectedCityId ? (cities.find(c => c.id === selectedCityId)?.name ?? null) : null,
    [selectedCityId, cities],
  );

  const filteredMedicalCenters = useMemo(() => {
    return medicalCenters.filter(center => {
      const matchSearch =
        searchQuery === "" ||
        center.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCity =
        !selectedCityName ||
        (center.cityName ?? "").toLowerCase().includes(selectedCityName.toLowerCase());

      const matchService =
        selectedServices.length === 0 ||
        (center.services ?? []).some(s => selectedServices.includes(s.id));

      const matchMedicalCenter = !medicalCenterId || center.id === Number(medicalCenterId);

      return matchSearch && matchCity && matchService && matchMedicalCenter;
    });
  }, [searchQuery, selectedCityName, selectedServices, medicalCenterId, medicalCenters]);

  const activeFilterCount =
    selectedSpecialties.length + selectedServices.length +
    (selectedCityId ? 1 : 0) + (selectedAreaId ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedCityId(null);
    setSelectedAreaId(null);
    setSelectedServices([]);
    setSearchQuery("");
    setLocation("/search", { replace: true });
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

      <div className="mb-2">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          {isRTL ? "الخدمات" : "Services"}
        </h3>
        <div className="space-y-2.5">
          {serviceOptions.map(opt => (
            <div key={opt.id} className="flex items-center gap-2">
              <Checkbox
                id={`service-${opt.id}`}
                checked={selectedServices.includes(opt.id)}
                onCheckedChange={() => toggleService(opt.id)}
                data-testid={`checkbox-service-${opt.id}`}
              />
              <Label htmlFor={`service-${opt.id}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                {isRTL ? opt.nameAr : opt.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Sticky search bar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text search */}
            <div className="relative flex-1 min-w-[160px]">
              <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t.search.placeholder}
                className="ps-12 h-11 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-primary shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                data-testid="input-search-doctors"
              />
            </div>
            {/* City select */}
            <div className="hidden sm:flex items-center gap-1.5 h-11 px-3 rounded-full border border-gray-200 bg-gray-50 min-w-[130px]">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                className="bg-transparent border-none outline-none text-sm text-gray-700 w-full cursor-pointer"
                value={selectedCityId ?? ""}
                onChange={e => handleCityChange(e.target.value ? Number(e.target.value) : null)}
                data-testid="select-city"
              >
                <option value="">{isRTL ? "كل المدن" : "All Cities"}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{isRTL ? c.nameAr : c.name}</option>
                ))}
              </select>
            </div>
            {/* Area select */}
            <div className={`hidden sm:flex items-center gap-1.5 h-11 px-3 rounded-full border border-gray-200 bg-gray-50 min-w-[130px] ${!selectedCityId ? "opacity-50 pointer-events-none" : ""}`}>
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                className="bg-transparent border-none outline-none text-sm text-gray-700 w-full cursor-pointer"
                value={selectedAreaId ?? ""}
                onChange={e => handleAreaChange(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedCityId}
                data-testid="select-area"
              >
                <option value="">{isRTL ? "كل المناطق" : "All Areas"}</option>
                {areas.map(a => (
                  <option key={a.id} value={a.id}>{isRTL ? a.nameAr : a.name}</option>
                ))}
              </select>
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
              {`Show ${filteredDoctors.length + filteredMedicalCenters.length} results`}
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

            {filteredMedicalCenters.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">
                  {isRTL
                    ? `المراكز الطبية (${filteredMedicalCenters.length})`
                    : `Medical Centers (${filteredMedicalCenters.length})`}
                </h2>
                <div className="space-y-3">
                  {filteredMedicalCenters.map(center => (
                    <div
                      key={center.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 w-full p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center border"
                    >
                      <div className="shrink-0">
                        {center.image ? (
                          <img
                            src={center.image}
                            alt={center.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-primary/10">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {isRTL && center.nameAr ? center.nameAr : center.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                          {center.cityName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {isRTL && center.cityNameAr ? center.cityNameAr : center.cityName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {center.doctorsCount} {isRTL ? "طبيب" : center.doctorsCount === 1 ? "doctor" : "doctors"}
                          </span>
                        </div>

                        {center.services && center.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {center.services.map(svc => (
                              <span
                                key={svc.id}
                                className={`inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 border ${
                                  selectedServices.includes(svc.id)
                                    ? "text-primary bg-primary/10 border-primary/30"
                                    : "text-gray-600 bg-gray-100 border-gray-200"
                                }`}
                              >
                                {isRTL ? svc.nameAr : svc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          className="px-5 py-2 rounded-xl border-gray-300 text-gray-600 font-semibold text-xs hover:bg-white transition-colors bg-transparent h-auto"
                          onClick={() => setLocation(`/search?medicalCenterId=${center.id}`)}
                        >
                          {isRTL ? "عرض الأطباء" : "View Doctors"}
                          <ChevronRight className="w-3 h-3 ms-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
