import { Link } from "wouter";
import { useParams } from "wouter";
import { ArrowLeft, Stethoscope, MapPin, Star, Phone, Clock, Award, BookOpen, Calendar, CheckCircle2, User } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { doctors } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function DoctorPublicProfile() {
  const { id } = useParams();
  const { t, lang, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const doctor = doctors.find((d) => d.id === id);

  if (!doctor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t.profile.doctorNotFound}</h1>
        </div>
      </Layout>
    );
  }

  const specialty = t.specialties[doctor.specialty] ?? doctor.specialty;
  const location = t.locations[doctor.location] ?? doctor.location;

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
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#D4A853]/30 shadow-lg"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{doctor.name}</h1>
                  <Badge className="bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/30 hover:bg-[#D4A853]/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isRTL ? "موثق" : "Verified"}
                  </Badge>
                </div>

                <p className="text-[#D4A853] text-base flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4" />
                  {specialty}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <button
                    onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-medium text-white">{doctor.rating}</span>
                    <span className="text-gray-400">({doctor.reviews} {t.card.reviews})</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-[#D4A853]" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-[#D4A853]" />
                    <span>{doctor.fee} {t.dashboard.egp}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:self-center">
                <Link href={`/doctor/${doctor.id}`}>
                  <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#c49a4a] font-semibold px-6 shadow-lg shadow-[#D4A853]/20">
                    <Calendar className="h-4 w-4 mr-2" />
                    {isRTL ? "احجز موعد" : "Book Appointment"}
                  </Button>
                </Link>
                <span className="inline-flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  {isRTL ? "اتصل بالعيادة" : "Contact via booking"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {isRTL ? "نبذة عن الطبيب" : "About Doctor"}
                    </h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                </CardContent>
              </Card>

              {/* Clinics */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {isRTL ? "العيادات" : "Clinics"}
                    </h2>
                    <span className="ml-auto text-xs text-gray-400 font-medium">
                      {doctor.clinics.length} {isRTL ? "فرع" : doctor.clinics.length === 1 ? "branch" : "branches"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {doctor.clinics.map((clinic, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-start gap-3 p-4">
                          <div className="w-9 h-9 rounded-lg bg-[#D4A853]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="h-4 w-4 text-[#D4A853]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{clinic.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {t.locations[clinic.location] ?? clinic.location} · {clinic.address}
                            </p>
                            <div className="flex items-center flex-wrap gap-3 mt-1.5">
                              <a
                                href={`tel:${clinic.phone}`}
                                className="inline-flex items-center gap-1.5 text-sm text-[#D4A853] hover:text-[#c49a4a] font-medium transition-colors"
                              >
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                {clinic.phone}
                              </a>
                              <span className="text-gray-300">·</span>
                              <span className="text-sm font-bold text-gray-800">
                                {clinic.fee} <span className="font-normal text-gray-500">{t.dashboard.egp}</span>
                              </span>
                            </div>
                          </div>
                          <a
                            href={clinic.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#c49a4a] bg-[#D4A853]/8 hover:bg-[#D4A853]/15 border border-[#D4A853]/20 hover:border-[#D4A853]/40 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            {isRTL ? "الخريطة" : "Map"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Reviews */}
              <Card id="reviews-section">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {isRTL ? "تقييمات المرضى" : "Patient Reviews"}
                    </h2>
                    <span className="text-sm text-gray-500 ml-1">
                      ({doctor.reviews})
                    </span>
                  </div>
                  <div className="space-y-4">
                    {doctor.reviewList?.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center text-[#D4A853] font-semibold text-xs">
                              {review.patientName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{review.patientName}</span>
                          </div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1.5 ml-10">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed ml-10">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "أقرب موعد" : "Next Available"}</p>
                      <p className="font-semibold text-gray-900">{doctor.nextAvailable}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "رسوم الاستشارة" : "Consultation Fee"}</p>
                      <p className="font-semibold text-gray-900">{doctor.fee} {t.dashboard.egp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "المسافة" : "Distance"}</p>
                      <p className="font-semibold text-gray-900">{doctor.distance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Book CTA */}
              <Card className="bg-[#0F172A] border-[#D4A853]/20">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 text-sm mb-4">
                    {isRTL
                      ? "احجز موعدك الآن مع د. " + doctor.name
                      : "Book your appointment with Dr. " + doctor.name + " now"}
                  </p>
                  <Link href={`/doctor/${doctor.id}`}>
                    <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#c49a4a] font-semibold">
                      <Calendar className="h-4 w-4 mr-2" />
                      {isRTL ? "احجز موعد" : "Book Appointment"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
