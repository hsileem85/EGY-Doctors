import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Stethoscope, Star, Navigation, Calendar, CheckCircle2, ChevronLeft } from "lucide-react";
import { Doctor } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";

interface DoctorCardProps {
  doctor: Doctor;
  showSlots?: boolean;
}

/* ── parse slots like "Today 4:00 PM" into schedule ───────────── */
function getScheduleFromSlots(slots: string[]) {
  const schedule: Record<string, string[]> = {};
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  slots.forEach((slot) => {
    const time = slot.replace(/^.*?\s/, ""); // strip "Today ", "Tomorrow ", etc.
    let dateKey: string;
    if (slot.startsWith("Today")) dateKey = formatDate(today);
    else if (slot.startsWith("Tomorrow")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      dateKey = formatDate(d);
    } else {
      // e.g. "Thu 5:30 PM" — map to today+2 (rough), or today
      dateKey = formatDate(today);
    }
    if (!schedule[dateKey]) schedule[dateKey] = [];
    schedule[dateKey].push(time);
  });

  // Generate a few extra days for the calendar
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = formatDate(d);
    if (!schedule[key]) schedule[key] = [];
    if (i > 0 && schedule[key].length === 0) {
      // Add some realistic fake slots for demo
      schedule[key] = i % 2 === 0
        ? ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
        : ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
    }
  }
  return schedule;
}

function formatDateLabel(dateStr: string, lang: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const weekday = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "short" });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "short" });

  if (isToday) return { label: lang === "ar" ? "اليوم" : "Today", sub: `${weekday} ${dayNum}` };
  if (isTomorrow) return { label: lang === "ar" ? "غداً" : "Tomorrow", sub: `${weekday} ${dayNum}` };
  return { label: weekday, sub: `${dayNum} ${month}` };
}

export function DoctorCard({ doctor, showSlots = false }: DoctorCardProps) {
  const { t, dir, lang } = useLanguage();
  const isRTL = dir === "rtl";

  const [bookingState, setBookingState] = useState<"idle" | "calendar" | "slots" | "form" | "success">("idle");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialty = t.specialties[doctor.specialty] ?? doctor.specialty;
  const location = t.locations[doctor.location] ?? doctor.location;

  const schedule = getScheduleFromSlots(doctor.slots);
  const availableDates = Object.keys(schedule).filter((d) => schedule[d].length > 0).sort();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingState("slots");
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setBookingState("form");
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingState("success");
    }, 1000);
  };

  const resetBooking = () => {
    setBookingState("idle");
    setSelectedDate(null);
    setSelectedSlot(null);
    setPatientName("");
    setPatientPhone("");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      {/* Header: Avatar + Name + Fee */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {doctor.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/5 text-primary hover:bg-primary/10 border-0 text-xs px-2 py-0.5 shrink-0 font-semibold"
            >
              {doctor.fee} {t.dashboard.egp}
            </Badge>
          </div>
          <p className="text-primary text-sm flex items-center gap-1 mt-0.5">
            <Stethoscope className="h-3.5 w-3.5" />
            {specialty}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          120+ {t.card.reviews}
        </span>
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
        {doctor.bio}
      </p>

      {/* Location */}
      <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4">
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span className="line-clamp-1">
          {location} {isRTL ? "\u00b7" : "\u00b7"} {doctor.clinicAddress}
        </span>
      </div>

      {/* ── Bottom Action Area ── */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        {showSlots ? (
          <div className="flex flex-col gap-3">
            {/* Row 1: Distance (left) + Book & Profile (right) */}
            {bookingState === "idle" && (
              <div className="flex items-center justify-between gap-3">
                {/* Clickable distance link */}
                <a
                  href={doctor.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#D4A853] hover:text-[#c49a4a] hover:underline transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{doctor.distance}</span>
                  <span className="text-xs text-gray-400 font-normal uppercase">{isRTL ? "متباعد" : "Away"}</span>
                </a>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10 hover:border-[#D4A853]"
                    onClick={() => setBookingState("calendar")}
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {isRTL ? "الحجز" : "Book"}
                  </Button>

                  <Link href={`/doctor/${doctor.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-9 px-4 border-gray-200 hover:border-[#D4A853] hover:text-[#D4A853]"
                      data-testid={`link-doctor-profile-${doctor.id}`}
                    >
                      {t.card.viewProfile}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* ── Booking Widget (inline) ── */}
            {bookingState !== "idle" && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                {/* Widget header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#D4A853]" />
                    {isRTL ? "حجز موعد" : "Book Appointment"}
                  </h4>
                  <button
                    onClick={resetBooking}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <ChevronLeft className={`h-3 w-3 ${isRTL ? "" : "rotate-180"}`} />
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                </div>

                {/* Step 1: Calendar / Date picker */}
                {bookingState === "calendar" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">
                      {isRTL ? "اختر اليوم" : "Select a day"}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      {availableDates.map((dateStr) => {
                        const { label, sub } = formatDateLabel(dateStr, lang);
                        const isActive = selectedDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => handleDateSelect(dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[4.5rem] h-16 rounded-lg border transition-all ${
                              isActive
                                ? "bg-[#D4A853] text-white border-[#D4A853]"
                                : "bg-white border-gray-200 hover:border-[#D4A853] hover:text-[#D4A853]"
                            }`}
                          >
                            <span className="text-xs font-bold">{label}</span>
                            <span className="text-[10px] opacity-80">{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Time slots */}
                {bookingState === "slots" && selectedDate && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => setBookingState("calendar")}
                        className="text-xs text-[#D4A853] hover:underline"
                      >
                        {isRTL ? "تغيير اليوم" : "Change day"}
                      </button>
                      <span className="text-xs text-gray-400">
                        {formatDateLabel(selectedDate, lang).label}, {formatDateLabel(selectedDate, lang).sub}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {isRTL ? "اختر الوقت" : "Select a time slot"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {schedule[selectedDate]?.map((time, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="h-10 text-xs border-gray-200 hover:border-[#D4A853] hover:bg-[#D4A853]/5 hover:text-[#D4A853]"
                          onClick={() => handleSlotSelect(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Booking form */}
                {bookingState === "form" && selectedDate && selectedSlot && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => setBookingState("slots")}
                        className="text-xs text-[#D4A853] hover:underline"
                      >
                        {isRTL ? "تغيير الوقت" : "Change slot"}
                      </button>
                      <span className="text-xs text-gray-400">
                        {formatDateLabel(selectedDate, lang).label} · {selectedSlot}
                      </span>
                    </div>
                    <form onSubmit={handleConfirmBooking} className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{isRTL ? "الاسم" : "Patient Name"}</Label>
                        <Input
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder={isRTL ? "الاسم الكامل" : "Full name"}
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
                        <Input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-gray-500">{isRTL ? "الكشف" : "Consultation fee"}</span>
                        <span className="font-semibold">{doctor.fee} {t.dashboard.egp}</span>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-10 bg-[#D4A853] hover:bg-[#c49a4a] text-white font-semibold"
                        disabled={isSubmitting || !patientName || !patientPhone}
                      >
                        {isSubmitting
                          ? (isRTL ? "جارٍ التأكيد..." : "Confirming...")
                          : (isRTL ? "تأكيد الحجز" : "Confirm Booking")}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Step 4: Success */}
                {bookingState === "success" && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-[#D4A853]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 text-[#D4A853]" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {isRTL ? "تم تأكيد الحجز!" : "Booking Confirmed!"}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      {formatDateLabel(selectedDate || "", lang).label} · {selectedSlot}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={resetBooking}
                    >
                      {isRTL ? "حجز آخر" : "Book Another"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link href={`/doctor/${doctor.id}`}>
            <Button
              className="w-full"
              data-testid={`link-doctor-profile-${doctor.id}`}
            >
              {t.card.bookAppointment}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
