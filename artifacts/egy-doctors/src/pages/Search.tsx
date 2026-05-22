import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Filter, Search as SearchIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { doctors, specialties, locations } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function Search() {
  const { t } = useLanguage();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const initialSpecialty = searchParams.get("specialty") || "";
  const initialLocation = searchParams.get("location") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    initialLocation ? [initialLocation] : []
  );

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleLocation = (l: string) => {
    setSelectedLocations(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    );
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSpecialty =
        selectedSpecialties.length === 0 || selectedSpecialties.includes(doctor.specialty);
      const matchLocation =
        selectedLocations.length === 0 || selectedLocations.includes(doctor.location);
      return matchSearch && matchSpecialty && matchLocation;
    });
  }, [searchQuery, selectedSpecialties, selectedLocations]);

  return (
    <Layout>
      <div className="bg-white border-b sticky top-16 z-40">
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

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  {t.search.specialty}
                </h3>
                <div className="space-y-3">
                  {specialties.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox
                        id={`spec-${s}`}
                        checked={selectedSpecialties.includes(s)}
                        onCheckedChange={() => toggleSpecialty(s)}
                        data-testid={`checkbox-specialty-${s}`}
                      />
                      <Label htmlFor={`spec-${s}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                        {t.specialties[s] ?? s}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  {t.search.location}
                </h3>
                <div className="space-y-3">
                  {locations.map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <Checkbox
                        id={`loc-${l}`}
                        checked={selectedLocations.includes(l)}
                        onCheckedChange={() => toggleLocation(l)}
                        data-testid={`checkbox-location-${l}`}
                      />
                      <Label htmlFor={`loc-${l}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                        {t.locations[l] ?? l}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedSpecialties.length > 0 || selectedLocations.length > 0) && (
                <Button
                  variant="ghost"
                  className="w-full mt-6 text-primary hover:text-primary/80 hover:bg-primary/5"
                  onClick={() => { setSelectedSpecialties([]); setSelectedLocations([]); }}
                >
                  {t.search.clearFilters}
                </Button>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {t.search.doctorsFound(filteredDoctors.length)}
              </h2>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="space-y-6">
                {filteredDoctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} showSlots={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.search.noFound}</h3>
                <p className="text-gray-500 max-w-md mx-auto">{t.search.noFoundDesc}</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => { setSelectedSpecialties([]); setSelectedLocations([]); setSearchQuery(""); }}
                >
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
