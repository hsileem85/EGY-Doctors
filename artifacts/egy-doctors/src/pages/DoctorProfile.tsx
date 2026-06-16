import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { Calendar, MapPin, Star, Stethoscope, Clock, CheckCircle2, ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doctors } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

/* ── helpers: turn doctor.slots into a real schedule ── */
function buildSchedule(slots: string[]) {
  const schedule: Record<string, string[]> = {};
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  slots.forEach((slot) => {
    const time = slot.replace(/^.*?\s/, "");
    let dateKey: string;
    if (slot.startsWith("Today")) dateKey = fmt(today);
    else if (slot.startsWith("Tomorrow")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      dateKey = fmt(d);
    } else {
      dateKey = fmt(today);
    }
    if (!schedule[dateKey]) schedule[dateKey] = [];
    schedule[dateKey].push(time);
  });

  // fill extra days with demo slots so the calendar has options
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = fmt(d);
    if (!schedule[key]) schedule[key] = [];
    if (i > 0 && schedule[key].length === 0) {
      schedule[key] = i % 2 === 0
        ? ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
        : ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
    }
  }
  return schedule;
}

function fmtDateLabel(dateStr: string, lang: string) {
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

export default function DoctorProfile() {
  const { id } = useParams();
  const { t, lang, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const doctor = doctors.find((d) => d.id === id);

  const [bookingStep, setBookingStep] = useState<"calendar" | "slots" | "form" | "success">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schedule = useMemo(() => (doctor ? buildSchedule(doctor.slots) : {}), [doctor]);
  const availableDates = useMemo(
    () => Object.keys(schedule).filter((d) => schedule[d].length > 0).sort(),
    [schedule]
  );

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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingStep("slots");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep("form");
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingStep("success");
    }, 1000);
  };

  const resetBooking = () => {
    setBookingStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setPatientName("");
    setPatientPhone("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border shadow-sm p-8 flex flex-col md:flex-row gap-8">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover shadow-sm mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-start">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                    <p className="text-primary font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                      <Stethoscope className="h-5 w-5" />
                      {specialty}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-semibold">
                    <Star className="h-4 w-4 fill-current" />
                    <span>4.9</span>
                    <span className="text-amber-600/60 font-normal text-sm">(120)</span>
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">{doctor.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{doctor.clinicAddress}</span>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D4A853]/10 text-[#D4A853] px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                      {t.profile.fee}
                    </span>
                    <span>{doctor.fee} {t.dashboard.egp}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">{t.profile.aboutDoctor}</h2>
              <p className="text-gray-600 leading-relaxed">
                {doctor.name} is a highly respected specialist in {specialty} located in {location}.
                With extensive experience in treating various conditions, the clinic provides state-of-the-art
                facilities and a patient-centric approach to healthcare.
              </p>
            </div>
          </div>

          {/* ── Right Column — Booking Widget ── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-primary/20 shadow-md">
              {/* Header */}
              <div className="bg-[#0F172A] text-white p-4 rounded-t-xl">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#D4A853]" />
                  {t.profile.bookAppointment}
                </h3>
              </div>

              <CardContent className="p-6">
                {/* Step 1: Calendar — pick a day */}
                {bookingStep === "calendar" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {t.profile.selectDay}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      {availableDates.map((dateStr) => {
                        const { label, sub } = fmtDateLabel(dateStr, lang);
                        const isActive = selectedDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => handleDateSelect(dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[4.5rem] h-16 rounded-lg border transition-all cursor-pointer ${
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

                {/* Step 2: Time slots for selected day */}
                {bookingStep === "slots" && selectedDate && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                          {fmtDateLabel(selectedDate, lang).label}
                        </p>
                        <p className="font-bold text-gray-900">
                          {fmtDateLabel(selectedDate, lang).sub}
                        </p>
                      </div>
                      <button
                        onClick={() => setBookingStep("calendar")}
                        className="text-xs text-[#D4A853] hover:underline flex items-center gap-1"
                      >
                        <ChevronLeft className={`h-3 w-3 ${isRTL ? "" : "rotate-180"}`} />
                        {t.profile.changeDay}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{t.profile.selectTime}</p>
                    <div className="grid grid-cols-2 gap-3">
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

                {/* Step 3: Patient form */}
                {bookingStep === "form" && selectedDate && selectedTime && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                          {fmtDateLabel(selectedDate, lang).label} · {selectedTime}
                        </p>
                        <p className="font-bold text-gray-900">
                          {t.profile.selectedSlot}
                        </p>
                      </div>
                      <button
                        onClick={() => setBookingStep("slots")}
                        className="text-xs text-[#D4A853] hover:underline flex items-center gap-1"
                      >
                        <ChevronLeft className={`h-3 w-3 ${isRTL ? "" : "rotate-180"}`} />
                        {t.profile.changeTime}
                      </button>
                    </div>

                    <form onSubmit={handleConfirm} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.profile.patientName}</Label>
                        <Input
                          id="name"
                          placeholder={t.profile.fullName}
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t.profile.phoneNumber}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t.profile.consultationFee}</span>
                          <span className="font-semibold">{doctor.fee} {t.dashboard.egp}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t.profile.bookingFee}</span>
                          <span className="text-[#D4A853] font-semibold">{t.profile.free}</span>
                        </div>
                        <div className="w-full h-px bg-gray-100 my-2"></div>
                        <div className="flex justify-between text-base font-bold">
                          <span>{t.profile.payAtClinic}</span>
                          <span>{doctor.fee} {t.dashboard.egp}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-4 h-12 text-base font-semibold bg-[#D4A853] hover:bg-[#c49a4a] text-white"
                        disabled={isSubmitting || !patientName || !patientPhone}
                      >
                        {isSubmitting ? t.profile.confirming : t.profile.confirmBooking}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Step 4: Success */}
                {bookingStep === "success" && (
                  <div className="text-center py-6 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-[#D4A853]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t.profile.bookingConfirmed}</h3>
                    <p className="text-gray-600 mb-6">
                      {t.profile.appointmentScheduled} <br />
                      <span className="font-bold text-gray-900">
                        {fmtDateLabel(selectedDate || "", lang).label} · {selectedTime}
                      </span>
                    </p>
                    <Button variant="outline" className="w-full" onClick={resetBooking}>
                      {t.profile.bookAnother}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
