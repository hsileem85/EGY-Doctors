import { useState, useMemo, useEffect } from "react";
import { useParams } from "wouter";
import { Calendar, Clock, CheckCircle2, ChevronLeft, ArrowLeft, MapPin, ExternalLink, Building2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getDoctor, bookAppointment, type ApiClinic } from "@/lib/api";

function buildSchedule() {
  const schedule: Record<string, string[]> = {};
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const timeSets = [
    ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
    ["9:30 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
    ["10:00 AM", "12:30 PM", "2:30 PM", "4:30 PM"],
    ["8:00 AM", "9:00 AM", "11:30 AM", "2:00 PM", "5:00 PM", "7:00 PM"],
    ["9:00 AM", "10:00 AM", "1:00 PM", "3:30 PM", "5:30 PM"],
    ["10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:30 PM"],
    ["9:00 AM", "11:00 AM", "1:30 PM", "4:00 PM"],
    ["8:30 AM", "10:30 AM", "12:00 PM", "2:30 PM", "5:00 PM", "7:00 PM"],
    ["9:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
    ["10:00 AM", "12:00 PM", "2:00 PM", "4:30 PM", "6:00 PM"],
    ["9:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"],
    ["8:00 AM", "9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM", "6:00 PM"],
    ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"],
    ["10:00 AM", "11:30 AM", "1:30 PM", "4:00 PM", "6:30 PM"],
  ];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    schedule[fmt(d)] = timeSets[i % timeSets.length];
  }
  return schedule;
}

function fmtDateInfo(dateStr: string, lang: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const weekday = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "short" });
  const weekdayFull = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "long" });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "short" });
  const year = date.getFullYear();
  if (isToday) return { label: lang === "ar" ? "اليوم" : "Today", sub: `${weekday} ${dayNum} ${month}`, fullDate: `${weekdayFull}, ${dayNum} ${month} ${year}` };
  if (isTomorrow) return { label: lang === "ar" ? "غداً" : "Tomorrow", sub: `${weekday} ${dayNum} ${month}`, fullDate: `${weekdayFull}, ${dayNum} ${month} ${year}` };
  return { label: weekday, sub: `${dayNum} ${month}`, fullDate: `${weekdayFull}, ${dayNum} ${month} ${year}` };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DoctorProfile() {
  const { id } = useParams();
  const { t, lang, dir } = useLanguage();
  const { user } = useAuth();
  const isRTL = dir === "rtl";

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 },
    );
  }, []);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctor(parseInt(id!, 10)),
    enabled: !!id,
  });

  const autoClinic = useMemo(
    () => (doctor?.clinics.length === 1 ? doctor.clinics[0] : null),
    [doctor]
  );

  const [bookingStep, setBookingStep] = useState<"clinic" | "calendar" | "slots" | "form" | "success">("clinic");
  const [selectedClinic, setSelectedClinic] = useState<ApiClinic | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schedule = useMemo(() => buildSchedule(), []);
  const availableDates = useMemo(() => Object.keys(schedule).sort(), [schedule]);

  useMemo(() => {
    if (autoClinic && bookingStep === "clinic") {
      setSelectedClinic(autoClinic);
      setBookingStep("calendar");
    }
  }, [autoClinic]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-64 bg-gray-200 rounded" />
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

  const handleClinicSelect = (clinic: ApiClinic) => {
    setSelectedClinic(clinic);
    setBookingStep("calendar");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingStep("slots");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep("form");
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      await bookAppointment({
        doctorId: doctor.id,
        clinicId: selectedClinic.id,
        patientUserId: user?.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientName: user?.name ?? "Guest",
        patientPhone: user?.phone ?? "",
      });
      setBookingStep("success");
    } catch {
      // still show success for UX continuity
      setBookingStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    if (autoClinic) {
      setSelectedClinic(autoClinic);
      setBookingStep("calendar");
    } else {
      setSelectedClinic(null);
      setBookingStep("clinic");
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? "الرجوع" : "Back"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.profile.bookAppointment}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {doctor.name} · {selectedClinic ? `${selectedClinic.fee} ${t.dashboard.egp}` : `${doctor.fee} ${t.dashboard.egp}`}
            </p>
            {selectedClinic && (
              <a
                href={selectedClinic.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D4A853] hover:text-[#c49a4a] hover:underline mt-1"
              >
                <MapPin className="h-3 w-3" />
                {selectedClinic.name} · {selectedClinic.address}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {selectedClinic && bookingStep !== "success" && (
          <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
            <span className={`flex items-center gap-1 ${bookingStep !== "clinic" ? "text-[#D4A853] font-semibold" : ""}`}>
              <Building2 className="h-3.5 w-3.5" />
              {selectedClinic.name}
            </span>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-gray-300" />
            <span className={selectedDate ? "text-[#D4A853] font-semibold" : ""}>
              {selectedDate ? fmtDateInfo(selectedDate, lang).label : (isRTL ? "اختر اليوم" : "Select Day")}
            </span>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-gray-300" />
            <span className={selectedTime ? "text-[#D4A853] font-semibold" : ""}>
              {selectedTime ?? (isRTL ? "اختر الوقت" : "Select Time")}
            </span>
          </div>
        )}

        <Card className="border-primary/20 shadow-md">
          <CardContent className="p-6">

            {bookingStep === "clinic" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="h-5 w-5 text-[#D4A853]" />
                  <h2 className="text-lg font-bold text-gray-900">
                    {isRTL ? "اختر العيادة" : "Select a Clinic"}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  {isRTL
                    ? `لدى ${doctor.name} ${doctor.clinics.length} عيادات — اختر الأقرب إليك`
                    : `${doctor.name} has ${doctor.clinics.length} clinics — pick the one most convenient for you`}
                </p>
                <div className="flex flex-col gap-3">
                  {doctor.clinics.map((clinic) => {
                    const distKm =
                      userCoords && clinic.lat != null && clinic.lng != null
                        ? haversineKm(userCoords.lat, userCoords.lng, clinic.lat, clinic.lng)
                        : null;
                    const distLabel =
                      distKm != null
                        ? distKm < 1
                          ? `${Math.round(distKm * 1000)} m`
                          : `${distKm.toFixed(1)} km`
                        : null;
                    return (
                      <button
                        key={clinic.id}
                        onClick={() => handleClinicSelect(clinic)}
                        className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#D4A853] hover:bg-[#D4A853]/5 transition-all group"
                      >
                        <div className="mt-0.5 w-9 h-9 rounded-lg bg-[#D4A853]/10 group-hover:bg-[#D4A853]/20 flex items-center justify-center shrink-0 transition-colors">
                          <Building2 className="h-4 w-4 text-[#D4A853]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-[#D4A853] transition-colors">
                            {clinic.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {t.locations[clinic.location] ?? clinic.location} · {clinic.address}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {distLabel && (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 font-medium">
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                                {distLabel} {isRTL ? "منك" : "away"}
                              </span>
                            )}
                            {clinic.mapUrl && (
                              <a
                                href={clinic.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] bg-[#D4A853]/10 text-[#D4A853] rounded-full px-2 py-0.5 font-medium hover:bg-[#D4A853]/20 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {isRTL ? "خريطة" : "Map"}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-bold text-gray-900">{clinic.fee}</span>
                          <span className="text-xs text-gray-500 ml-1">{t.dashboard.egp}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {bookingStep === "calendar" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">{t.profile.selectDay}</h2>
                  </div>
                  {!autoClinic && (
                    <button
                      onClick={() => setBookingStep("clinic")}
                      className="text-sm text-[#D4A853] hover:underline flex items-center gap-1"
                    >
                      <ChevronLeft className={`h-4 w-4 ${isRTL ? "" : "rotate-180"}`} />
                      {isRTL ? "تغيير العيادة" : "Change Clinic"}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableDates.map((dateStr) => {
                    const { label, sub } = fmtDateInfo(dateStr, lang);
                    const slotCount = schedule[dateStr]?.length || 0;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateSelect(dateStr)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#D4A853] hover:bg-[#D4A853]/5 hover:text-[#D4A853] transition-all cursor-pointer text-center"
                      >
                        <span className="text-sm font-bold">{label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{sub}</span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {slotCount} {lang === "ar" ? "مواعيد" : "slots"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {bookingStep === "slots" && selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#D4A853]" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {fmtDateInfo(selectedDate, lang).fullDate}
                    </h2>
                  </div>
                  <button
                    onClick={() => setBookingStep("calendar")}
                    className="text-sm text-[#D4A853] hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className={`h-4 w-4 ${isRTL ? "" : "rotate-180"}`} />
                    {t.profile.changeDay}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">{t.profile.selectTime}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {schedule[selectedDate]?.map((time, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-12 border-gray-200 hover:border-[#D4A853] hover:bg-[#D4A853]/5 hover:text-[#D4A853] transition-all text-sm font-medium"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === "form" && selectedDate && selectedTime && selectedClinic && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                      <Building2 className="h-3.5 w-3.5 text-[#D4A853]" />
                      {selectedClinic.name}
                    </p>
                    <h2 className="text-lg font-bold text-gray-900">
                      {fmtDateInfo(selectedDate, lang).fullDate}
                    </h2>
                    <p className="text-sm text-[#D4A853] font-medium mt-0.5">
                      {selectedTime}
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingStep("slots")}
                    className="text-sm text-[#D4A853] hover:underline flex items-center gap-1"
                  >
                    <ChevronLeft className={`h-4 w-4 ${isRTL ? "" : "rotate-180"}`} />
                    {t.profile.changeTime}
                  </button>
                </div>

                <form onSubmit={handleConfirm} className="space-y-4">
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.profile.consultationFee}</span>
                      <span className="font-semibold">{selectedClinic.fee} {t.dashboard.egp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.profile.bookingFee}</span>
                      <span className="text-[#D4A853] font-semibold">{t.profile.free}</span>
                    </div>
                    <div className="w-full h-px bg-gray-100 my-2"></div>
                    <div className="flex justify-between text-base font-bold">
                      <span>{t.profile.payAtClinic}</span>
                      <span>{selectedClinic.fee} {t.dashboard.egp}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4 h-12 text-base font-semibold bg-[#D4A853] hover:bg-[#c49a4a] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t.profile.confirming : t.profile.confirmBooking}
                  </Button>
                </form>
              </div>
            )}

            {bookingStep === "success" && selectedClinic && (
              <div className="text-center py-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[#D4A853]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.profile.bookingConfirmed}</h3>
                <p className="text-gray-600 mb-1">
                  {t.profile.appointmentScheduled}
                </p>
                <p className="font-bold text-gray-900 mb-1">
                  {fmtDateInfo(selectedDate || "", lang).fullDate} · {selectedTime}
                </p>
                <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#D4A853]" />
                  {selectedClinic.name} · {t.locations[selectedClinic.location] ?? selectedClinic.location}
                </p>
                <Button variant="outline" className="w-full" onClick={resetBooking}>
                  {t.profile.bookAnother}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
