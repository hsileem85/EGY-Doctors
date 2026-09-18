import { Link } from "wouter";
import { useParams } from "wouter";
import { ArrowLeft, Stethoscope, MapPin, Star, Phone, Award, BookOpen, Calendar, CheckCircle2, User, MessageCircle, Send, Globe, UserPlus, UserCheck, Building2 } from "lucide-react";
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
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getDoctor, submitReview, getMagazinePosts, followDoctor, type ApiDoctor, type ApiMagazinePost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PostInteractionBar } from "@/components/PostInteractionBar";
import { SocialVideoPlayer } from "@/components/SocialVideoPlayer";
import { useAuth } from "@/context/AuthContext";

const PAYMENT_METHOD_LABELS: Record<string, { en: string; ar: string }> = {
  CASH: { en: "Cash", ar: "نقداً" },
  CARD: { en: "Card", ar: "بطاقة" },
  WALLET: { en: "Wallet", ar: "محفظة" },
  FAWRY: { en: "Fawry", ar: "فوري" },
};

export default function DoctorPublicProfile() {
  const { id } = useParams();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: doctorPosts = [] } = useQuery<ApiMagazinePost[]>({
    queryKey: ["doctorPosts", id],
    queryFn: () => getMagazinePosts({ doctorId: parseInt(id!, 10) }),
    enabled: !!id,
  });

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

  const { toast } = useToast();

  const followMutation = useMutation({
    mutationFn: () => followDoctor(parseInt(id!, 10)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["doctor", id] });
      const prev = queryClient.getQueryData<ApiDoctor>(["doctor", id]);
      queryClient.setQueryData<ApiDoctor>(["doctor", id], (old) =>
        old ? { ...old, isFollowing: !old.isFollowing } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["doctor", id], ctx.prev);
      toast({ title: isRTL ? "تعذّر تحديث المتابعة" : "Failed to update follow", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    },
  });

  const handleFollow = () => {
    if (!user) {
      toast({ title: isRTL ? "يرجى تسجيل الدخول أولاً" : "Sign in to follow this doctor" });
      return;
    }
    followMutation.mutate();
  };

  const isOwnProfile = user?.doctorId === doctor?.id;

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

                {/* Poly clinic affiliation */}
                {doctor.polyClinic && (
                  <p className="text-violet-300 text-sm flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 shrink-0" />
                    {isRTL
                      ? `جزء من ${doctor.polyClinic.nameAr ?? doctor.polyClinic.name}`
                      : `Part of ${doctor.polyClinic.name}`}
                  </p>
                )}

                {/* Social links row */}
                {(doctor.websiteUrl || doctor.facebookUrl || doctor.instagramUrl || doctor.tiktokUrl || doctor.youtubeUrl || doctor.xUrl) && (
                  <div className="flex items-center gap-2 mb-3">
                    {doctor.websiteUrl && (
                      <a href={doctor.websiteUrl} target="_blank" rel="noopener noreferrer" title="Website"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {doctor.facebookUrl && (
                      <a href={doctor.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                      </a>
                    )}
                    {doctor.instagramUrl && (
                      <a href={doctor.instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    )}
                    {doctor.tiktokUrl && (
                      <a href={doctor.tiktokUrl} target="_blank" rel="noopener noreferrer" title="TikTok"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                      </a>
                    )}
                    {doctor.youtubeUrl && (
                      <a href={doctor.youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                    {doctor.xUrl && (
                      <a href={doctor.xUrl} target="_blank" rel="noopener noreferrer" title="X (Twitter)"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4A853]/20 flex items-center justify-center transition-colors text-gray-300 hover:text-[#D4A853]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                  </div>
                )}

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
                  <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#c49a4a] font-semibold px-6 shadow-lg shadow-[#D4A853]/20 w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    {isRTL ? "احجز موعد" : "Book Appointment"}
                  </Button>
                </Link>

                {!isOwnProfile && (
                  <Button
                    variant="outline"
                    onClick={handleFollow}
                    disabled={followMutation.isPending}
                    className={`w-full font-semibold px-6 transition-colors ${
                      doctor.isFollowing
                        ? "bg-[#D4A853]/10 border-[#D4A853]/40 text-[#D4A853] hover:bg-[#D4A853]/20 hover:border-[#D4A853]/60"
                        : "bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    {doctor.isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {isRTL ? "متابَع" : "Following"}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isRTL ? "متابعة" : "Follow"}
                      </>
                    )}
                  </Button>
                )}

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
                    {doctor.clinics.length > 0 && (
                      <span className="ml-auto text-xs text-gray-400 font-medium">
                        {doctor.clinics.length} {isRTL ? "فرع" : doctor.clinics.length === 1 ? "branch" : "branches"}
                      </span>
                    )}
                  </div>

                  {/* Affiliated center shown as the clinic when no individual clinics */}
                  {doctor.clinics.length === 0 && doctor.affiliatedCenter && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 overflow-hidden">
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {isRTL
                              ? (doctor.affiliatedCenter.nameAr ?? doctor.affiliatedCenter.name)
                              : doctor.affiliatedCenter.name}
                          </p>
                          {(doctor.affiliatedCenter.address || doctor.affiliatedCenter.cityName) && (
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {[doctor.affiliatedCenter.address, doctor.affiliatedCenter.cityName].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {doctor.affiliatedCenter.phone && (
                            <div className="flex items-center flex-wrap gap-3 mt-1.5">
                              <a
                                href={`tel:${doctor.affiliatedCenter.phone}`}
                                className="inline-flex items-center gap-1.5 text-sm text-[#D4A853] hover:text-[#c49a4a] font-medium transition-colors"
                              >
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                {doctor.affiliatedCenter.phone}
                              </a>
                              <a
                                href={whatsappUrl(doctor.affiliatedCenter.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#1ebe59] font-medium transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                        {doctor.affiliatedCenter.lat && doctor.affiliatedCenter.lng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.affiliatedCenter.lat},${doctor.affiliatedCenter.lng}`}
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
                  )}

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
                            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                              <span className="text-xs text-gray-500 mr-1">
                                {isRTL ? "الدفع:" : "Payment:"}
                              </span>
                              {(Array.isArray((clinic as typeof clinic & { acceptedPaymentMethods?: string[] }).acceptedPaymentMethods)
                                ? (clinic as typeof clinic & { acceptedPaymentMethods: string[] }).acceptedPaymentMethods
                                 : ["CASH"]
                              ).map(method => (
                                <Badge key={method} variant="outline" className="text-[11px] font-medium">
                                  {PAYMENT_METHOD_LABELS[method]?.[isRTL ? "ar" : "en"] ?? method}
                                </Badge>
                              ))}
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

                  {/* Published Content */}
                  {doctorPosts.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#D4A853]" />
                        {isRTL ? "محتوى منشور" : "Published Content"}
                      </h3>
                      <div className="space-y-4">
                        {doctorPosts.map(post => (
                          <div key={post.id} className="rounded-xl border border-gray-100 overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                                  post.type === "article" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                  post.type === "video" ? "bg-red-50 text-red-600 border-red-200" :
                                  "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {post.type === "article" ? (isRTL ? "مقال" : "Article") :
                                   post.type === "video" ? (isRTL ? "فيديو" : "Video") :
                                   (isRTL ? "نصيحة" : "Quick Tip")}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              {post.title && <h4 className="font-semibold text-gray-900 text-sm mb-1">{post.title}</h4>}
                              {post.content && <p className="text-gray-600 text-sm leading-relaxed">{post.content}</p>}
                            </div>
                            {post.type === "video" && post.mediaUrl && (
                              <SocialVideoPlayer url={post.mediaUrl} title={post.title ?? "Video"} />
                            )}
                            <div className="px-4">
                              <PostInteractionBar
                                postId={post.id}
                                initialLikesCount={post.likesCount}
                                initialCommentsCount={post.commentsCount}
                                initialSharesCount={post.sharesCount}
                                isLikedByCurrentUser={post.isLikedByCurrentUser}
                                doctorName={post.doctorName}
                                postTitle={post.title ?? ""}
                                doctorId={doctor.id}
                                isRTL={isRTL}
                                variant="light"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
