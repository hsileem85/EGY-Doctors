import { Link, useParams } from "wouter";
import { ArrowLeft, Building2, MapPin, Phone, Globe, MessageCircle, Stethoscope, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { getMedicalCenterPublicProfile, CENTER_SERVICE_OPTIONS, type MedicalCenterPublicProfile } from "@/lib/api";

function whatsappUrl(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const intl = digits.startsWith("0") ? "20" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

export default function MedicalCenterPublicProfile() {
  const { id } = useParams();
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  const { data: center, isLoading } = useQuery<MedicalCenterPublicProfile>({
    queryKey: ["medicalCenterPublicProfile", id],
    queryFn: () => getMedicalCenterPublicProfile(parseInt(id!, 10)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F1F5F9] pb-20">
          <div className="bg-[#0F172A] text-white py-8">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="animate-pulse h-40 bg-[#1E293B] rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!center) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? "المركز الطبي غير موجود" : "Medical center not found"}
          </h1>
        </div>
      </Layout>
    );
  }

  const name = isRTL && center.nameAr ? center.nameAr : center.name;
  const bio = isRTL && center.bioAr ? center.bioAr : center.bio;
  const cityName = isRTL && center.cityNameAr ? center.cityNameAr : center.cityName;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F1F5F9] pb-20">
        {/* Header banner */}
        <div className="bg-[#0F172A] text-white py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#D4A853] transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {isRTL ? "الرجوع" : "Back"}
            </button>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {center.image ? (
                <img
                  src={center.image}
                  alt={name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#D4A853]/30 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center border-4 border-[#D4A853]/30 shadow-lg bg-[#1E293B]">
                  <Building2 className="h-10 w-10 text-[#D4A853]" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{name}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                  {cityName && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[#D4A853]" />
                      <span>{cityName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-[#D4A853]" />
                    <span>
                      {center.doctorsCount} {isRTL ? "طبيب" : center.doctorsCount === 1 ? "doctor" : "doctors"}
                    </span>
                  </div>
                </div>

                {(center.phone || center.website) && (
                  <div className="flex items-center flex-wrap gap-3">
                    {center.phone && (
                      <>
                        <a
                          href={`tel:${center.phone}`}
                          className="inline-flex items-center gap-1.5 text-sm text-[#D4A853] hover:text-[#c49a4a] font-medium transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {center.phone}
                        </a>
                        <a
                          href={whatsappUrl(center.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#1ebe59] font-medium transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </>
                    )}
                    {center.website && (
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white font-medium transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {isRTL ? "الموقع الإلكتروني" : "Website"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {bio && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {isRTL ? "نبذة" : "About"}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{bio}</p>
                  </CardContent>
                </Card>
              )}

              {(center.address || (center.lat != null && center.lng != null)) && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-[#D4A853]" />
                      <h2 className="text-lg font-bold text-gray-900">
                        {isRTL ? "الموقع" : "Location"}
                      </h2>
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-gray-600">{center.address}</p>
                      {center.lat != null && center.lng != null && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#c49a4a] bg-[#D4A853]/8 hover:bg-[#D4A853]/15 border border-[#D4A853]/20 hover:border-[#D4A853]/40 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <MapPin className="h-3 w-3" />
                          {isRTL ? "الخريطة" : "Map"}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {isRTL ? "الأطباء" : "Doctors"}
                    </h2>
                    {center.doctors.length > 0 && (
                      <span className="ml-auto text-xs text-gray-400 font-medium">
                        {center.doctorsCount}
                      </span>
                    )}
                  </div>

                  {center.doctors.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {isRTL ? "لا يوجد أطباء مسجلين حالياً" : "No doctors listed yet"}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {center.doctors.map((doctor) => {
                        const specialtyName = isRTL && doctor.specialtyNameAr ? doctor.specialtyNameAr : doctor.specialtyName;
                        return (
                          <Link key={doctor.id} href={`/profile/${doctor.id}`}>
                            <div className="rounded-xl border border-gray-200 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/5 transition-colors p-4 cursor-pointer flex items-center gap-2 flex-wrap">
                              {specialtyName && (
                                <Badge className="bg-[#D4A853]/10 text-[#8B6914] border-[#D4A853]/30 hover:bg-[#D4A853]/20">
                                  {specialtyName}
                                </Badge>
                              )}
                              <p className="font-semibold text-gray-900">
                                {isRTL && doctor.nameAr ? doctor.nameAr : doctor.name}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {center.specialties.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {isRTL ? "التخصصات" : "Specialties"}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {center.specialties.map((sp, i) => (
                        <Badge
                          key={i}
                          className="bg-[#D4A853]/10 text-[#8B6914] border-[#D4A853]/30 hover:bg-[#D4A853]/20"
                        >
                          {isRTL && sp.nameAr ? sp.nameAr : sp.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {center.services.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      {isRTL ? "الخدمات المتاحة" : "Available Services"}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {center.services.map((svc) => {
                        const opt = CENTER_SERVICE_OPTIONS.find((o) => o.value === svc);
                        if (!opt) return null;
                        return (
                          <Badge
                            key={svc}
                            className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          >
                            {isRTL ? opt.labelAr : opt.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#c49a4a] font-semibold"
                asChild
              >
                <Link href={`/search?medicalCenterId=${center.id}`}>
                  {isRTL ? "عرض الأطباء وحجز موعد" : "View Doctors & Book"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
