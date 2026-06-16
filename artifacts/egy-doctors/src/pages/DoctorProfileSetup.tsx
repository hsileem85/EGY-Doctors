import { useState } from "react";
import { useLocation } from "wouter";
import {
  Upload, Camera, Clock, ArrowLeft, MapPin, GraduationCap,
  Briefcase, LocateFixed, Plus, Trash2, ChevronDown, ChevronUp, Building2,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { specialties, locations } from "@/lib/data";
import { Link } from "wouter";

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;
type Day = typeof DAYS[number];
type ClinicSchedule = Record<Day, { active: boolean; from: string; to: string }>;

const defaultSchedule = (): ClinicSchedule => ({
  Sat: { active: true,  from: "10:00", to: "18:00" },
  Sun: { active: false, from: "09:00", to: "17:00" },
  Mon: { active: true,  from: "12:00", to: "20:00" },
  Tue: { active: false, from: "09:00", to: "17:00" },
  Wed: { active: true,  from: "10:00", to: "16:00" },
  Thu: { active: false, from: "09:00", to: "17:00" },
  Fri: { active: false, from: "09:00", to: "17:00" },
});

type Clinic = {
  id: string;
  name: string;
  location: string;
  address: string;
  lat: string;
  lng: string;
  fee: string;
  schedule: ClinicSchedule;
};

function makeClinic(overrides?: Partial<Clinic>): Clinic {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    location: locations[0] ?? "",
    address: "",
    lat: "30.0444",
    lng: "31.2357",
    fee: "",
    schedule: defaultSchedule(),
    ...overrides,
  };
}

export default function DoctorProfileSetup() {
  const { t, dir } = useLanguage();
  const [pathname, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = pathname.includes("edit-profile");
  const isRTL = dir === "rtl";

  const [profile, setProfile] = useState({
    fullName: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    subSpecialty: "Consultant Cardiologist",
    experience: "15",
    qualificationDegree: "MD, PhD, FRCS",
    bio: "",
  });

  const [clinics, setClinics] = useState<Clinic[]>([
    makeClinic({
      name: "Heart Care Clinic",
      location: "New Cairo",
      address: "15 South Teseen St, 4th Floor",
      lat: "30.0444",
      lng: "31.2357",
      fee: "450",
    }),
  ]);

  const [expandedId, setExpandedId] = useState<string>(clinics[0].id);

  const addClinic = () => {
    const c = makeClinic();
    setClinics(prev => [...prev, c]);
    setExpandedId(c.id);
  };

  const removeClinic = (id: string) => {
    setClinics(prev => {
      const next = prev.filter(c => c.id !== id);
      if (expandedId === id && next.length > 0) setExpandedId(next[0].id);
      return next;
    });
  };

  const updateClinic = (id: string, patch: Partial<Omit<Clinic, "id" | "schedule">>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const updateSchedule = (id: string, day: Day, field: keyof ClinicSchedule[Day], value: boolean | string) => {
    setClinics(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, schedule: { ...c.schedule, [day]: { ...c.schedule[day], [field]: value } } };
    }));
  };

  const handleSave = () => {
    toast({
      title: isEditMode
        ? (isRTL ? "تم حفظ الملف الشخصي!" : "Profile Updated!")
        : t.profileSetup.publishedSuccess,
      description: isEditMode
        ? (isRTL ? "تم حفظ تغييرات ملفك الشخصي بنجاح." : "Your profile changes have been saved successfully.")
        : t.profileSetup.publishedSuccess,
      className: "bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20",
    });
    setTimeout(() => setLocation("/dashboard"), 1500);
  };

  return (
    <Layout>
      <div className="bg-gray-50/50 py-8 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? (isRTL ? "تعديل الملف الشخصي" : "Edit Profile") : t.profileSetup.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditMode
                  ? (isRTL ? "حدث معلوماتك وعياداتك والجدول واحفظ التغييرات." : "Update your information, clinics, schedule, and save changes.")
                  : t.register.successDesc}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isEditMode && (
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {isRTL ? "الرجوع إلى لوحة التحكم" : "Back to Dashboard"}
                  </Button>
                </Link>
              )}
              <Button onClick={handleSave} size="lg" className="w-full md:w-auto" data-testid="button-save-profile">
                {isEditMode ? (isRTL ? "حفظ التغييرات" : "Save Changes") : t.profileSetup.savePublish}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left column — Personal Info */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profileSetup.personalInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer group">
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 mt-3">{t.profileSetup.uploadPhoto}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.profileSetup.fullName}</Label>
                      <Input
                        value={profile.fullName}
                        onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                        data-testid="input-profile-fullname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.profileSetup.specialty}</Label>
                      <Select value={profile.specialty} onValueChange={v => setProfile(p => ({ ...p, specialty: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {specialties.map(s => <SelectItem key={s} value={s}>{t.specialties[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.profileSetup.subSpecialty}</Label>
                      <Input
                        value={profile.subSpecialty}
                        onChange={e => setProfile(p => ({ ...p, subSpecialty: e.target.value }))}
                        placeholder="e.g. Consultant Cardiologist"
                        data-testid="input-profile-subspecialty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        {isRTL ? "سنوات الخبرة" : "Years of Experience"}
                      </Label>
                      <Input
                        type="number"
                        value={profile.experience}
                        onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                        placeholder="e.g. 15"
                        data-testid="input-profile-experience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {isRTL ? "الدرجة العلمية" : "Qualification Degree"}
                      </Label>
                      <Input
                        value={profile.qualificationDegree}
                        onChange={e => setProfile(p => ({ ...p, qualificationDegree: e.target.value }))}
                        placeholder="e.g. MD, PhD, FRCS"
                        data-testid="input-profile-degree"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profileSetup.bio}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea
                      value={profile.bio}
                      onChange={e => { if (e.target.value.length <= 500) setProfile(p => ({ ...p, bio: e.target.value })); }}
                      placeholder={t.profileSetup.aboutMe}
                      className="min-h-[120px] resize-y"
                      data-testid="textarea-profile-bio"
                    />
                    <div className="text-end text-xs text-gray-400 font-medium">
                      {t.profileSetup.charCount(profile.bio.length)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — Clinics */}
            <div className="md:col-span-2 space-y-4">

              {/* Clinics label */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {isRTL ? "العيادات" : "Clinics"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isRTL ? "أضف عيادة أو أكثر مع جدولها المنفصل." : "Add one or more clinics, each with its own schedule."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                  onClick={addClinic}
                >
                  <Plus className="h-4 w-4" />
                  {isRTL ? "إضافة عيادة" : "Add Clinic"}
                </Button>
              </div>

              {clinics.map((clinic, idx) => {
                const isOpen = expandedId === clinic.id;
                return (
                  <Card key={clinic.id} className={`overflow-hidden transition-all border ${isOpen ? "border-primary/30 shadow-sm" : "border-gray-200"}`}>
                    {/* Clinic Header */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/80 transition-colors"
                      onClick={() => setExpandedId(isOpen ? "" : clinic.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isOpen ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="text-start">
                          <p className="text-sm font-semibold text-gray-900">
                            {clinic.name || (isRTL ? `عيادة ${idx + 1}` : `Clinic ${idx + 1}`)}
                          </p>
                          {clinic.location && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />{clinic.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {clinics.length > 1 && (
                          <span
                            role="button"
                            onClick={e => { e.stopPropagation(); removeClinic(clinic.id); }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* Clinic Body */}
                    {isOpen && (
                      <CardContent className="border-t border-gray-100 pt-5 space-y-6">

                        {/* Clinic Info */}
                        <div className="space-y-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {isRTL ? "معلومات العيادة" : "Clinic Information"}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t.profileSetup.clinicName}</Label>
                              <Input
                                value={clinic.name}
                                onChange={e => updateClinic(clinic.id, { name: e.target.value })}
                                placeholder={isRTL ? "اسم العيادة" : "Clinic name"}
                                data-testid={`input-clinic-name-${idx}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t.profileSetup.cityArea}</Label>
                              <Select value={clinic.location} onValueChange={v => updateClinic(clinic.id, { location: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {locations.map(l => <SelectItem key={l} value={l}>{t.locations[l]}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.profileSetup.clinicAddress}</Label>
                            <Input
                              value={clinic.address}
                              onChange={e => updateClinic(clinic.id, { address: e.target.value })}
                              placeholder={isRTL ? "عنوان العيادة" : "Street address"}
                              data-testid={`input-clinic-address-${idx}`}
                            />
                          </div>

                          {/* Map */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {isRTL ? "موقع العيادة على الخريطة" : "Clinic Location on Map"}
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">{isRTL ? "خط الطول" : "Latitude"}</Label>
                                <Input
                                  value={clinic.lat}
                                  onChange={e => updateClinic(clinic.id, { lat: e.target.value })}
                                  placeholder="30.0444"
                                  data-testid={`input-clinic-lat-${idx}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">{isRTL ? "خط العرض" : "Longitude"}</Label>
                                <Input
                                  value={clinic.lng}
                                  onChange={e => updateClinic(clinic.id, { lng: e.target.value })}
                                  placeholder="31.2357"
                                  data-testid={`input-clinic-lng-${idx}`}
                                />
                              </div>
                            </div>
                            <ClinicMap
                              lat={clinic.lat}
                              lng={clinic.lng}
                              isRTL={isRTL}
                              onLocate={(lat, lng) => updateClinic(clinic.id, { lat, lng })}
                              onError={(title, desc) => toast({ title, description: desc, className: "bg-red-50 text-red-900 border-red-200" })}
                            />
                          </div>

                          {/* Fee */}
                          <div className="space-y-2 w-full md:w-1/2">
                            <Label>{t.profileSetup.consultationFee}</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={clinic.fee}
                                onChange={e => updateClinic(clinic.id, { fee: e.target.value })}
                                className="pe-12"
                                placeholder="0"
                                data-testid={`input-clinic-fee-${idx}`}
                              />
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                {t.dashboard.egp}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {isRTL ? "جدول العيادة الأسبوعي" : "Weekly Schedule for This Clinic"}
                          </p>
                          {DAYS.map(day => (
                            <div
                              key={day}
                              className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${clinic.schedule[day].active ? "border-primary/20 bg-primary/5" : "border-gray-100 bg-gray-50/50"}`}
                            >
                              <div className="w-32 flex items-center gap-3">
                                <Checkbox
                                  id={`${clinic.id}-${day}`}
                                  checked={clinic.schedule[day].active}
                                  onCheckedChange={c => updateSchedule(clinic.id, day, "active", c === true)}
                                />
                                <Label
                                  htmlFor={`${clinic.id}-${day}`}
                                  className={`cursor-pointer ${clinic.schedule[day].active ? "text-gray-900 font-medium" : "text-gray-500 font-normal"}`}
                                >
                                  {t.profileSetup.days[day as keyof typeof t.profileSetup.days]}
                                </Label>
                              </div>
                              <div className={`flex items-center gap-2 flex-1 transition-opacity ${clinic.schedule[day].active ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                                <Select
                                  disabled={!clinic.schedule[day].active}
                                  value={clinic.schedule[day].from}
                                  onValueChange={v => updateSchedule(clinic.id, day, "from", v)}
                                >
                                  <SelectTrigger className="bg-white"><SelectValue placeholder={t.profileSetup.timeFrom} /></SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }).map((_, i) => {
                                      const time = `${i.toString().padStart(2, "0")}:00`;
                                      return <SelectItem key={time} value={time}>{time}</SelectItem>;
                                    })}
                                  </SelectContent>
                                </Select>
                                <span className="text-gray-400 text-sm">—</span>
                                <Select
                                  disabled={!clinic.schedule[day].active}
                                  value={clinic.schedule[day].to}
                                  onValueChange={v => updateSchedule(clinic.id, day, "to", v)}
                                >
                                  <SelectTrigger className="bg-white"><SelectValue placeholder={t.profileSetup.timeTo} /></SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }).map((_, i) => {
                                      const time = `${i.toString().padStart(2, "0")}:00`;
                                      return <SelectItem key={time} value={time}>{time}</SelectItem>;
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {/* Add Clinic button (bottom) */}
              <button
                type="button"
                onClick={addClinic}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 rounded-xl py-4 text-sm font-medium text-gray-500 hover:text-primary transition-all"
              >
                <Plus className="w-4 h-4" />
                {isRTL ? "إضافة عيادة أخرى" : "Add Another Clinic"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Extracted Map sub-component to avoid re-render noise ─── */
function ClinicMap({
  lat, lng, isRTL,
  onLocate,
  onError,
}: {
  lat: string; lng: string; isRTL: boolean;
  onLocate: (lat: string, lng: string) => void;
  onError: (title: string, desc: string) => void;
}) {
  return (
    <div className="mt-1 rounded-xl border overflow-hidden h-44 bg-gray-100 relative group">
      <img
        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=640x320&markers=${lat},${lng},red-pushpin`}
        alt="Clinic location map"
        className="w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <MapPin className="h-5 w-5 text-white" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) {
            onError(
              isRTL ? "غير مدعوم" : "Not Supported",
              isRTL ? "المتصفح لا يدعم تحديد الموقع الجغرافي." : "Your browser does not support geolocation.",
            );
            return;
          }
          navigator.geolocation.getCurrentPosition(
            pos => {
              const la = pos.coords.latitude.toString();
              const lo = pos.coords.longitude.toString();
              onLocate(la, lo);
              window.open(`https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=15/${la}/${lo}`, "_blank");
            },
            () => onError(
              isRTL ? "خطأ في تحديد الموقع" : "Location Error",
              isRTL ? "تعذر الحصول على موقعك. يرجى التحقق من إعدادات الموقع." : "Could not get your location. Please check location settings.",
            ),
          );
        }}
        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs px-2 py-1 rounded-md shadow-sm font-medium text-gray-700 transition-colors flex items-center gap-1"
      >
        <LocateFixed className="h-3 w-3" />
        {isRTL ? "تحديد موقعي" : "Get My Location"}
      </button>
      <p className="absolute bottom-2 left-2 text-[10px] text-gray-400 bg-white/80 rounded px-1.5 py-0.5">
        OpenStreetMap
      </p>
    </div>
  );
}
