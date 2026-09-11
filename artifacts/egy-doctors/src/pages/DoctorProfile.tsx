import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Calendar, Clock, CheckCircle2, ChevronLeft, ArrowLeft, MapPin, ExternalLink, Building2, Hourglass, Lock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getDoctor, getAppointments, bookAppointment, initiateAppointmentPayment, type ApiClinic, type ClinicScheduleMap, type DoctorScheduleMap } from "@/lib/api";

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DEFAULT_SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_SCHEDULE_HORIZON_DAYS = 30;

const AVAILABILITY_PERIOD_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

interface AvailabilityConfig {
  availabilityPeriod?: string | null;
  availabilityFrom?: string | null;
  availabilityTo?: string | null;
  sessionsPerHour?: number | null;
}

/** Parses a "9:00 AM" / "14:30" style time string into minutes-since-midnight, or null if unparseable. */
function parseTimeToMinutes(time: string): number | null {
  const ampm = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const isPM = ampm[3].toUpperCase() === "PM";
    if (h === 12) h = 0;
    if (isPM) h += 12;
    return h * 60 + m;
  }
  const h24 = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    return parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10);
  }
  return null;
}

function formatMinutesAsLabel(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const isPM = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

/** Returns the calendar horizon in days for a given availability config, defaulting to 30 days. */
function getScheduleHorizonDays(availability: AvailabilityConfig | null | undefined): number {
  if (!availability?.availabilityPeriod) return DEFAULT_SCHEDULE_HORIZON_DAYS;
  if (availability.availabilityPeriod === "custom" && availability.availabilityFrom && availability.availabilityTo) {
    const from = new Date(availability.availabilityFrom + "T00:00:00");
    const to = new Date(availability.availabilityTo + "T00:00:00");
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }
  return AVAILABILITY_PERIOD_DAYS[availability.availabilityPeriod] ?? DEFAULT_SCHEDULE_HORIZON_DAYS;
}

/** Returns the slot duration in minutes derived from sessionsPerHour (60 / sessionsPerHour), defaulting to 30 minutes. */
function getSlotIntervalMinutes(availability: AvailabilityConfig | null | undefined): number {
  const sessionsPerHour = availability?.sessionsPerHour;
  if (!sessionsPerHour || sessionsPerHour <= 0) return DEFAULT_SLOT_INTERVAL_MINUTES;
  return Math.max(1, Math.round(60 / sessionsPerHour));
}

/**
 * Builds a { "YYYY-MM-DD": ["9:00 AM", ...] } map for the configured availability window,
 * strictly from the doctor/clinic's configured schedule, excluding already-booked slots.
 * Slot duration and calendar horizon are derived from `availability`.
 */
function buildSchedule(
  scheduleSource: ClinicScheduleMap | DoctorScheduleMap | null | undefined,
  bookedByDate: Map<string, Set<string>>,
  availability: AvailabilityConfig | null | undefined,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (!scheduleSource) return result;

  const normalizedSchedule: Record<string, { active?: boolean; from: string; to: string }> = {};
  for (const [key, val] of Object.entries(scheduleSource)) {
    const canonical = DAY_KEYS.find((d) => d.toLowerCase() === key.trim().slice(0, 3).toLowerCase());
    if (canonical && val) normalizedSchedule[canonical] = val as { active?: boolean; from: string; to: string };
  }

  const horizonDays = getScheduleHorizonDays(availability);
  const slotIntervalMinutes = getSlotIntervalMinutes(availability);
  const today = new Date();
  for (let i = 0; i < horizonDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayKey = DAY_KEYS[d.getDay()];
    const window = normalizedSchedule[dayKey];
    if (!window || window.active === false || !window.from || !window.to) continue;

    const from = parseTimeToMinutes(window.from);
    const to = parseTimeToMinutes(window.to);
    if (from === null || to === null || from >= to) continue;

    const booked = bookedByDate.get(dateStr);
    const isToday = i === 0;
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    const slots: string[] = [];
    for (let m = from; m < to; m += slotIntervalMinutes) {
      if (isToday && m <= nowMinutes) continue;
      const label = formatMinutesAsLabel(m);
      if (booked?.has(label)) continue;
      slots.push(label);
    }
    if (slots.length > 0) result[dateStr] = slots;
  }
  return result;
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

  const virtualClinic = useMemo((): ApiClinic | null => {
    if (!doctor || doctor.clinics.length > 0 || !doctor.affiliatedCenter) return null;
    const ac = doctor.affiliatedCenter;
    return {
      id: -1,
      name: ac.name,
      nameAr: ac.nameAr ?? undefined,
      address: ac.address ?? "",
      mapUrl: ac.lat && ac.lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${ac.lat},${ac.lng}`
        : "",
      phone: ac.phone ?? "",
      fee: doctor.fee,
      location: ac.cityName ?? doctor.cityName ?? "",
      areaName: ac.cityName ?? "",
      lat: ac.lat ?? null,
      lng: ac.lng ?? null,
      bookingConfirmationMethod: null,
    };
  }, [doctor]);

  const autoClinic = useMemo(
    () => (virtualClinic ?? (doctor?.clinics.length === 1 ? doctor.clinics[0] : null)),
    [doctor, virtualClinic]
  );

  const [bookingStep, setBookingStep] = useState<"clinic" | "calendar" | "slots" | "form" | "success">("clinic");
  const [selectedClinic, setSelectedClinic] = useState<ApiClinic | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVirtualClinic = !selectedClinic || selectedClinic.id <= 0;
  // Medical-center-affiliated doctors always have a real (auto-created) clinic,
  // so isVirtualClinic is false for them — but older records may still have the
  // schedule saved only at the doctor level. Fall back to doctor.schedule
  // whenever the selected real clinic has no schedule configured.
  const scheduleSource: ClinicScheduleMap | DoctorScheduleMap | null | undefined = isVirtualClinic
    ? doctor?.schedule
    : (selectedClinic?.schedule ?? doctor?.schedule);
  // Availability config (period + sessions/hour) is authoritative at the clinic level;
  // fall back to the doctor-level config when the clinic has none configured.
  const availabilityConfig: AvailabilityConfig | null = useMemo(() => {
    const clinicConfig: AvailabilityConfig | null = isVirtualClinic ? null : (selectedClinic ?? null);
    const hasClinicConfig = clinicConfig && (
      clinicConfig.availabilityPeriod != null || clinicConfig.sessionsPerHour != null
    );
    if (hasClinicConfig) return clinicConfig;
    if (!doctor) return null;
    return {
      availabilityPeriod: doctor.availabilityPeriod,
      availabilityFrom: doctor.availabilityFrom,
      availabilityTo: doctor.availabilityTo,
      sessionsPerHour: doctor.sessionsPerHour,
    };
  }, [isVirtualClinic, selectedClinic, doctor]);

  const { data: existingAppointments } = useQuery({
    queryKey: ["appointments-for-booking", doctor?.id, isVirtualClinic ? null : selectedClinic?.id],
    queryFn: () =>
      getAppointments(
        isVirtualClinic
          ? { doctorId: doctor!.id }
          : { doctorId: doctor!.id, clinicId: selectedClinic!.id },
      ),
    enabled: !!doctor && bookingStep !== "clinic",
  });

  const bookedByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const appt of existingAppointments ?? []) {
      if (appt.status === "cancelled") continue;
      if (!map.has(appt.appointmentDate)) map.set(appt.appointmentDate, new Set());
      map.get(appt.appointmentDate)!.add(appt.appointmentTime);
    }
    return map;
  }, [existingAppointments]);

  const schedule = useMemo(
    () => buildSchedule(scheduleSource, bookedByDate, availabilityConfig),
    [scheduleSource, bookedByDate, availabilityConfig],
  );
  const availableDates = useMemo(() => Object.keys(schedule).sort(), [schedule]);
  const hasNoConfiguredSchedule = bookingStep !== "clinic" && !scheduleSource;

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

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4A853]/20">
              <Lock className="h-8 w-8 text-[#D4A853]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRTL ? "يجب تسجيل الدخول أولاً" : "Sign In Required"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isRTL
                ? `يرجى تسجيل الدخول لحجز موعد مع ${doctor.name}`
                : `Please sign in to book an appointment with ${doctor.name}`}
            </p>
            <Link href={`/auth?redirect=/doctor/${doctor.id}`}>
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#c49a4a] font-semibold mb-3">
                {isRTL ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </Link>
            <Link href={`/auth?tab=signup`}>
              <Button variant="outline" className="w-full">
                {isRTL ? "إنشاء حساب جديد" : "Create an Account"}
              </Button>
            </Link>
          </div>
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
      const appointment = await bookAppointment({
        doctorId: doctor.id,
        clinicId: selectedClinic.id > 0 ? selectedClinic.id : undefined,
        patientUserId: user?.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientName: user?.name ?? "Guest",
        patientPhone: user?.phone ?? "",
      });
      if (appointment.feeCharged && appointment.feeCharged > 0) {
        const payment = await initiateAppointmentPayment(appointment.id);
        if (payment.iframeUrl) {
          window.location.assign(payment.iframeUrl);
          return;
        }
      }
      setBookingStep("success");
    } catch {
      setBookingStep("form");
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
            {selectedClinic && (selectedClinic.mapUrl || (selectedClinic.lat != null && selectedClinic.lng != null)) && (
              <a
                href={selectedClinic.mapUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.lat},${selectedClinic.lng}`}
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
                            {(clinic.mapUrl || (clinic.lat != null && clinic.lng != null)) && (
                              <a
                                href={clinic.mapUrl || `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
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
                {hasNoConfiguredSchedule ? (
                  <div className="text-center py-10">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">
                      {isRTL ? "لا يوجد مواعيد متاحة حالياً" : "No availability configured yet"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                      {isRTL
                        ? "لم يقم الطبيب بتحديد مواعيد العمل بعد. يرجى المحاولة لاحقاً."
                        : "This doctor hasn't set up their availability yet. Please check back later."}
                    </p>
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">
                      {isRTL ? "لا توجد مواعيد متاحة قريباً" : "No open slots in the coming weeks"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                      {isRTL
                        ? "جميع المواعيد المتاحة محجوزة حالياً. يرجى المحاولة لاحقاً."
                        : "All available slots are currently booked. Please check back later."}
                    </p>
                  </div>
                ) : (
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
                )}
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

            {bookingStep === "success" && selectedClinic && (() => {
              const isManual = selectedClinic.bookingConfirmationMethod === "manual";
              return (
                <div className="text-center py-6 animate-in zoom-in duration-300">
                  {isManual ? (
                    <>
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Hourglass className="h-8 w-8 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.profile.bookingPending}</h3>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-xs mx-auto">
                        {t.profile.bookingPendingDesc}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-[#D4A853]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.profile.bookingConfirmed}</h3>
                      <p className="text-gray-600 mb-1">{t.profile.appointmentScheduled}</p>
                    </>
                  )}
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
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
