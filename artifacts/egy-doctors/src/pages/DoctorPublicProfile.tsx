import { Link } from "wouter";
import { useParams } from "wouter";
import { ArrowLeft, Stethoscope, MapPin, Star, Phone, Award, BookOpen, Calendar, CheckCircle2, User, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";

function whatsappUrl(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const intl = digits.startsWith("0") ? "20" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoctor, submitReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DoctorPublicProfile() {
  const { id } = useParams();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (user?.name && !reviewName) setReviewName(user.name);
  }, [user?.name]);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctor(parseInt(id!, 10)),
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
  const location = t.locations[doctor.cityName] ?? t.governorates[doctor.cityName] ?? doctor.cityName;

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    const name = reviewName.trim();
    if (!name) { setReviewError(isRTL ? "الرجاء إدخال اسمك" : "Please enter your name"); return; }
    if (reviewRating === 0) { setReviewError(isRTL ? "الرجاء اختيار تقييم" : "Please select a rating"); return; }
    setReviewError("");
    setReviewStatus("submitting");
    try {
      await submitReview(parseInt(id!, 10), { patientName: name, rating: reviewRating, text: reviewText.trim() || undefined });
      setReviewStatus("success");
      setReviewName("");
      setReviewRating(0);
      setReviewText("");
      await queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    } catch {
      setReviewStatus("error");
      setReviewError(isRTL ? "حدث خطأ، حاول مجدداً" : "Something went wrong, please try again.");
    }
  }

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
                    {doctor.clinics.map((clinic) => (
                      <div key={clinic.id} className="rounded-xl border border-gray-200 overflow-hidden">
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
                              <a
                                href={whatsappUrl(clinic.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#1ebe59] font-medium transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                WhatsApp
                              </a>
                              <span className="text-gray-300">·</span>
                              <span className="text-sm font-bold text-gray-800">
                                {clinic.fee} <span className="font-normal text-gray-500">{t.dashboard.egp}</span>
                              </span>
                            </div>
                          </div>
                          {(clinic.mapUrl || (clinic.lat != null && clinic.lng != null)) && (
                            <a
                              href={clinic.mapUrl || `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#c49a4a] bg-[#D4A853]/8 hover:bg-[#D4A853]/15 border border-[#D4A853]/20 hover:border-[#D4A853]/40 rounded-lg px-3 py-1.5 transition-colors"
                            >
                              <MapPin className="h-3 w-3" />
                              {isRTL ? "الخريطة" : "Map"}
                            </a>
                          )}
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
                  {doctor.reviewList && doctor.reviewList.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.reviewList.map((review) => (
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
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {isRTL ? "لا توجد تقييمات بعد" : "No reviews yet"}
                    </p>
                  )}

                  {/* Write a review form — patients only */}
                  {user?.role === "patient" && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Send className="h-4 w-4 text-[#D4A853]" />
                        {isRTL ? "اكتب تقييماً" : "Write a Review"}
                      </h3>

                      {reviewStatus === "success" ? (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                          <p className="text-green-700 font-semibold text-sm">
                            {isRTL ? "شكراً! تم إرسال تقييمك بنجاح." : "Thank you! Your review has been submitted."}
                          </p>
                          <button
                            onClick={() => setReviewStatus("idle")}
                            className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
                          >
                            {isRTL ? "إضافة تقييم آخر" : "Add another review"}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          {/* Name */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {isRTL ? "الاسم" : "Your Name"} <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={reviewName}
                              onChange={e => setReviewName(e.target.value)}
                              placeholder={isRTL ? "اسمك" : "Enter your name"}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853]"
                            />
                          </div>

                          {/* Star rating */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              {isRTL ? "تقييمك" : "Your Rating"} <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  onMouseEnter={() => setReviewHover(star)}
                                  onMouseLeave={() => setReviewHover(0)}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`h-7 w-7 transition-colors ${
                                      star <= (reviewHover || reviewRating)
                                        ? "text-amber-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                              {reviewRating > 0 && (
                                <span className="ml-2 text-xs text-gray-500">
                                  {["", isRTL ? "سيئ" : "Poor", isRTL ? "مقبول" : "Fair", isRTL ? "جيد" : "Good", isRTL ? "جيد جداً" : "Very Good", isRTL ? "ممتاز" : "Excellent"][reviewRating]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Comment */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {isRTL ? "تعليقك (اختياري)" : "Your Comment (optional)"}
                            </label>
                            <textarea
                              value={reviewText}
                              onChange={e => setReviewText(e.target.value)}
                              rows={3}
                              placeholder={isRTL ? "شارك تجربتك مع هذا الطبيب..." : "Share your experience with this doctor..."}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853] resize-none"
                            />
                          </div>

                          {reviewError && (
                            <p className="text-red-500 text-xs">{reviewError}</p>
                          )}

                          <Button
                            type="submit"
                            disabled={reviewStatus === "submitting"}
                            className="bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold px-6"
                          >
                            {reviewStatus === "submitting"
                              ? (isRTL ? "جارٍ الإرسال..." : "Submitting...")
                              : (isRTL ? "إرسال التقييم" : "Submit Review")}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
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
                      <Award className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "رسوم الاستشارة" : "Consultation Fee"}</p>
                      <p className="font-semibold text-gray-900">{doctor.fee} {t.dashboard.egp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "التقييم" : "Rating"}</p>
                      <p className="font-semibold text-gray-900">{doctor.rating} / 5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{isRTL ? "المدينة" : "City"}</p>
                      <p className="font-semibold text-gray-900">{location}</p>
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
