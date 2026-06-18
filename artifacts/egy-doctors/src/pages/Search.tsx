import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Filter, Search as SearchIcon } from "lucide-react";
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
  const { t } = useLanguage();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const initialQuery = searchParams.get("q") || "";
  const initialSpecialty = searchParams.get("specialty") || "";
  const initialCity = searchParams.get("city") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    initialCity ? [initialCity] : []
  );

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

      return matchSearch && matchSpecialty && matchCity;
    });
  }, [searchQuery, selectedSpecialties, selectedCities, allDoctors]);

  const hasActiveFilters = selectedSpecialties.length > 0 || selectedCities.length > 0;

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedCities([]);
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t.search.placeholder}
              className="ps-12 h-12 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-primary shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="input-search-doctors"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border p-6 sticky top-40 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                <Filter className="h-5 w-5" />
                <h2>{t.search.filters}</h2>
              </div>

              {/* Specialty filter */}
              {specialties.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    {t.search.specialty}
                  </h3>
                  <div className="space-y-3">
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

              {/* City filter */}
              {cities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    {t.search.location}
                  </h3>
                  <div className="space-y-3">
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

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-primary hover:text-primary/80 hover:bg-primary/5"
                  onClick={clearFilters}
                >
                  {t.search.clearFilters}
                </Button>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {loadingDoctors
                  ? (t.search.doctorsFound(0))
                  : t.search.doctorsFound(filteredDoctors.length)}
              </h2>
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
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.search.noFound}</h3>
                <p className="text-gray-500 max-w-md mx-auto">{t.search.noFoundDesc}</p>
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
