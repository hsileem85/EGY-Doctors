import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Upload, Camera, Clock, ArrowLeft, MapPin,
  LocateFixed, Plus, Trash2, ChevronDown, ChevronUp, Building2,
} from "lucide-react";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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
import { useQuery } from "@tanstack/react-query";
import { getSpecialties, getCities, getAreas, getMyDoctorProfile, updateDoctorProfile, addClinic as apiAddClinic, updateClinic as apiUpdateClinic, deleteClinic as apiDeleteClinic, submitDoctorForReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { queryClient } from "@/App";

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

type AvailabilityPeriod = "week" | "month" | "quarter" | "year" | "custom";

type Clinic = {
  id: string;
  name: string;
  cityName: string;
  areaId: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  fee: string;
  followUpDays: string;
  followUpPrice: string;
  bookingConfirmationMethod: "automatic" | "manual";
  schedule: ClinicSchedule;
  availabilityPeriod: AvailabilityPeriod;
  availabilityFrom: string;
  availabilityTo: string;
  sessionsPerHour: string;
};

function makeClinic(overrides?: Partial<Clinic>): Clinic {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    cityName: "",
    areaId: "",
    address: "",
    phone: "",
    lat: "",
    lng: "",
    fee: "",
    followUpDays: "15",
    followUpPrice: "0",
    bookingConfirmationMethod: "automatic",
    schedule: defaultSchedule(),
    availabilityPeriod: "month",
    availabilityFrom: "",
    availabilityTo: "",
    sessionsPerHour: "2",
    ...overrides,
  };
}

export default function DoctorProfileSetup() {
  const { t, dir } = useLanguage();
  const [pathname, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const isEditMode = pathname.includes("edit-profile");
  const isRTL = dir === "rtl";

  // Block access for doctors who are not yet approved — redirect to dashboard (pending screen)
  const accountStatus = user?.accountStatus ?? null;
  const isBlocked = !!user && user.role === "doctor" && (accountStatus === "pending" || accountStatus === "rejected");
  useEffect(() => {
    if (isBlocked) setLocation("/dashboard");
  }, [isBlocked, setLocation]);

  const { data: apiSpecialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });
  const { data: apiCities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });
  const { data: apiAreas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: () => getAreas(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["myDoctorProfile"],
    queryFn: getMyDoctorProfile,
    enabled: !!user && user.role === "doctor",
    retry: false,
  });

  const [profile, setProfile] = useState({
    fullName: "",
    specialty: "",
    qualificationDegree: "",
    bio: "",
    bioAr: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    xUrl: "",
  });

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([makeClinic()]);
  const [expandedId, setExpandedId] = useState<string>(() => clinics[0].id);
  const [deletedDbIds, setDeletedDbIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = url;
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "تعذر معالجة الصورة" : "Could not process image", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!myProfile || profileLoaded) return;
    if (myProfile.specialtyId && apiSpecialties.length === 0) return;
    const hasClinicsWithArea = myProfile.clinics?.some((c: { areaId?: number | null }) => c.areaId);
    if (hasClinicsWithArea && apiAreas.length === 0) return;

    const matchedSpecialty = myProfile.specialtyId != null
      ? apiSpecialties.find(s => s.id === myProfile.specialtyId)
      : undefined;

    setProfile({
      fullName: myProfile.name || user?.name || "",
      specialty: matchedSpecialty?.name ?? "",
      qualificationDegree: "",
      bio: myProfile.bio ?? "",
      bioAr: myProfile.bioAr ?? "",
    });

    setSocialLinks({
      websiteUrl: myProfile.websiteUrl ?? "",
      facebookUrl: myProfile.facebookUrl ?? "",
      instagramUrl: myProfile.instagramUrl ?? "",
      tiktokUrl: myProfile.tiktokUrl ?? "",
      youtubeUrl: myProfile.youtubeUrl ?? "",
      xUrl: myProfile.xUrl ?? "",
    });

    if (myProfile.image) {
      setImagePreview(myProfile.image);
    }

    if (myProfile.clinics && myProfile.clinics.length > 0) {
      const hydrated: Clinic[] = myProfile.clinics.map((c) => {
        const area = c.areaId ? apiAreas.find(a => a.id === c.areaId) : undefined;
        const city = area ? apiCities.find(ci => ci.id === area.cityId) : undefined;
        return {
          id: String(c.id),
          name: c.name ?? "",
          cityName: city?.name ?? "",
          areaId: c.areaId ? String(c.areaId) : "",
          address: c.address ?? "",
          phone: c.phone ?? "",
          lat: c.lat != null ? String(c.lat) : "",
          lng: c.lng != null ? String(c.lng) : "",
          fee: c.fee != null ? String(c.fee) : "",
          followUpDays: c.followUpDays != null ? String(c.followUpDays) : "15",
          followUpPrice: c.followUpPrice != null ? String(c.followUpPrice) : "0",
          bookingConfirmationMethod: (c.bookingConfirmationMethod === "manual" ? "manual" : "automatic") as "automatic" | "manual",
          schedule: c.schedule
            ? { ...defaultSchedule(), ...(c.schedule as Partial<ClinicSchedule>) }
            : defaultSchedule(),
          availabilityPeriod: (c.availabilityPeriod ?? "month") as AvailabilityPeriod,
          availabilityFrom: c.availabilityFrom ?? "",
          availabilityTo: c.availabilityTo ?? "",
          sessionsPerHour: c.sessionsPerHour != null ? String(c.sessionsPerHour) : "2",
        };
      });
      setClinics(hydrated);
      setExpandedId(hydrated[0].id);
    }

    setProfileLoaded(true);
  }, [myProfile, user, profileLoaded, apiSpecialties, apiCities, apiAreas]);

  const addClinic = () => {
    const c = makeClinic();
    setClinics(prev => [...prev, c]);
    setExpandedId(c.id);
  };

  const removeClinic = (id: string) => {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      setDeletedDbIds(prev => [...prev, numId]);
    }
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedSpecialty = apiSpecialties.find(s => s.name === profile.specialty);
      const firstClinicAreaId = clinics[0]?.areaId ? parseInt(clinics[0].areaId, 10) : undefined;
      const firstClinicArea = firstClinicAreaId ? apiAreas.find(a => a.id === firstClinicAreaId) : undefined;
      const firstClinicCity = firstClinicArea ? apiCities.find(c => c.id === firstClinicArea.cityId) : undefined;

      const firstClinicFee = clinics[0]?.fee ? parseFloat(clinics[0].fee) : undefined;

      await updateDoctorProfile({
        name: profile.fullName || undefined,
        bio: profile.bio || undefined,
        bioAr: profile.bioAr || undefined,
        image: imagePreview || undefined,
        specialtyId: selectedSpecialty?.id,
        cityId: firstClinicCity?.id,
        areaId: firstClinicAreaId,
        fee: firstClinicFee,
        websiteUrl: socialLinks.websiteUrl || null,
        facebookUrl: socialLinks.facebookUrl || null,
        instagramUrl: socialLinks.instagramUrl || null,
        tiktokUrl: socialLinks.tiktokUrl || null,
        youtubeUrl: socialLinks.youtubeUrl || null,
        xUrl: socialLinks.xUrl || null,
      });

      await Promise.all(deletedDbIds.map(id => apiDeleteClinic(id)));

      await Promise.all(clinics.map(clinic => {
        const numId = parseInt(clinic.id, 10);
        const areaId = clinic.areaId ? parseInt(clinic.areaId, 10) : undefined;
        const followUpDaysVal = clinic.followUpDays ? parseInt(clinic.followUpDays, 10) : undefined;
        const followUpPriceVal = clinic.followUpPrice !== "" ? parseInt(clinic.followUpPrice, 10) : undefined;
        const sessionsPerHourVal = clinic.sessionsPerHour ? parseInt(clinic.sessionsPerHour, 10) : undefined;
        const data = {
          name: clinic.name || `Clinic`,
          address: clinic.address || undefined,
          phone: clinic.phone || undefined,
          fee: clinic.fee ? parseFloat(clinic.fee) : undefined,
          followUpDays: followUpDaysVal && !isNaN(followUpDaysVal) ? followUpDaysVal : undefined,
          followUpPrice: followUpPriceVal !== undefined && !isNaN(followUpPriceVal) ? followUpPriceVal : undefined,
          bookingConfirmationMethod: clinic.bookingConfirmationMethod,
          areaId: areaId && !isNaN(areaId) ? areaId : undefined,
          lat: clinic.lat ? parseFloat(clinic.lat) : undefined,
          lng: clinic.lng ? parseFloat(clinic.lng) : undefined,
          schedule: clinic.schedule,
          availabilityPeriod: clinic.availabilityPeriod,
          availabilityFrom: clinic.availabilityPeriod === "custom" && clinic.availabilityFrom ? clinic.availabilityFrom : null,
          availabilityTo: clinic.availabilityPeriod === "custom" && clinic.availabilityTo ? clinic.availabilityTo : null,
          sessionsPerHour: sessionsPerHourVal && !isNaN(sessionsPerHourVal) ? sessionsPerHourVal : undefined,
        };
        if (isNaN(numId)) {
          return apiAddClinic(data);
        } else {
          return apiUpdateClinic(numId, data);
        }
      }));

      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["myDoctorProfile"] });
      queryClient.removeQueries({ queryKey: ["doctors"] });
      queryClient.removeQueries({ queryKey: ["doctor"] });
      toast({
        title: isEditMode ? (isRTL ? "تم حفظ الملف الشخصي!" : "Profile Updated!") : t.profileSetup.publishedSuccess,
        description: isRTL ? "تم حفظ تغييرات ملفك الشخصي بنجاح." : "Your profile changes have been saved successfully.",
        className: "bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20",
      });
      setTimeout(() => setLocation("/dashboard"), 1500);
    } catch {
      toast({
        title: isRTL ? "حدث خطأ" : "Error",
        description: isRTL ? "تعذر حفظ الملف الشخصي. يرجى المحاولة مجدداً." : "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isProfileComplete = profile.specialty !== "" && clinics.some(c => c.areaId !== "");

  const handleSaveAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedSpecialty = apiSpecialties.find(s => s.name === profile.specialty);
      const firstClinicAreaId = clinics[0]?.areaId ? parseInt(clinics[0].areaId, 10) : undefined;
      const firstClinicArea = firstClinicAreaId ? apiAreas.find(a => a.id === firstClinicAreaId) : undefined;
      const firstClinicCity = firstClinicArea ? apiCities.find(c => c.id === firstClinicArea.cityId) : undefined;
      const firstClinicFee = clinics[0]?.fee ? parseFloat(clinics[0].fee) : undefined;

      await updateDoctorProfile({
        name: profile.fullName || undefined,
        bio: profile.bio || undefined,
        bioAr: profile.bioAr || undefined,
        image: imagePreview || undefined,
        specialtyId: selectedSpecialty?.id,
        cityId: firstClinicCity?.id,
        areaId: firstClinicAreaId,
        fee: firstClinicFee,
        websiteUrl: socialLinks.websiteUrl || null,
        facebookUrl: socialLinks.facebookUrl || null,
        instagramUrl: socialLinks.instagramUrl || null,
        tiktokUrl: socialLinks.tiktokUrl || null,
        youtubeUrl: socialLinks.youtubeUrl || null,
        xUrl: socialLinks.xUrl || null,
      });

      await Promise.all(deletedDbIds.map(id => apiDeleteClinic(id)));

      await Promise.all(clinics.map(clinic => {
        const numId = parseInt(clinic.id, 10);
        const areaId = clinic.areaId ? parseInt(clinic.areaId, 10) : undefined;
        const followUpDaysVal = clinic.followUpDays ? parseInt(clinic.followUpDays, 10) : undefined;
        const followUpPriceVal = clinic.followUpPrice !== "" ? parseInt(clinic.followUpPrice, 10) : undefined;
        const sessionsPerHourVal = clinic.sessionsPerHour ? parseInt(clinic.sessionsPerHour, 10) : undefined;
        const data = {
          name: clinic.name || `Clinic`,
          address: clinic.address || undefined,
          phone: clinic.phone || undefined,
          fee: clinic.fee ? parseFloat(clinic.fee) : undefined,
          followUpDays: followUpDaysVal && !isNaN(followUpDaysVal) ? followUpDaysVal : undefined,
          followUpPrice: followUpPriceVal !== undefined && !isNaN(followUpPriceVal) ? followUpPriceVal : undefined,
          bookingConfirmationMethod: clinic.bookingConfirmationMethod,
          areaId: areaId && !isNaN(areaId) ? areaId : undefined,
          lat: clinic.lat ? parseFloat(clinic.lat) : undefined,
          lng: clinic.lng ? parseFloat(clinic.lng) : undefined,
          schedule: clinic.schedule,
          availabilityPeriod: clinic.availabilityPeriod,
          availabilityFrom: clinic.availabilityPeriod === "custom" && clinic.availabilityFrom ? clinic.availabilityFrom : null,
          availabilityTo: clinic.availabilityPeriod === "custom" && clinic.availabilityTo ? clinic.availabilityTo : null,
          sessionsPerHour: sessionsPerHourVal && !isNaN(sessionsPerHourVal) ? sessionsPerHourVal : undefined,
        };
        if (isNaN(numId)) {
          return apiAddClinic(data);
        } else {
          return apiUpdateClinic(numId, data);
        }
      }));

      await submitDoctorForReview();
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["myDoctorProfile"] });
      setLocation("/dashboard");
    } catch {
      toast({
        title: isRTL ? "حدث خطأ" : "Error",
        description: isRTL ? "تعذر إرسال الطلب. يرجى المحاولة مجدداً." : "Failed to submit for review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlocked) return null;

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
              <Button onClick={handleSave} size="lg" className="w-full md:w-auto" data-testid="button-save-profile" disabled={isSaving || isSubmitting}>
                {isSaving ? (isRTL ? "جاري الحفظ..." : "Saving...") : isEditMode ? (isRTL ? "حفظ التغييرات" : "Save Changes") : t.profileSetup.savePublish}
              </Button>
              {!isEditMode && (
                <Button
                  onClick={handleSaveAndSubmit}
                  size="lg"
                  className="w-full md:w-auto bg-[#D4A853] text-[#0F172A] hover:bg-[#c49943]"
                  disabled={!isProfileComplete || isSaving || isSubmitting}
                  title={!isProfileComplete ? (isRTL ? "أكمل التخصص وأضف عيادة واحدة على الأقل أولاً" : "Add your specialty and at least one clinic first") : undefined}
                  data-testid="button-submit-for-review"
                >
                  {isSubmitting ? (isRTL ? "جاري الإرسال..." : "Submitting...") : (isRTL ? "إرسال للمراجعة" : "Submit for Review")}
                </Button>
              )}
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      data-testid="input-profile-photo"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary/60 transition-colors cursor-pointer group focus:outline-none"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </button>
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
                          {apiSpecialties.map(s => <SelectItem key={s.id} value={s.name}>{t.specialties[s.name] ?? s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? "الدرجة العلمية" : "Qualification Degree"}</Label>
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

            </div>

            {/* Right column — Bio + Clinics */}
            <div className="md:col-span-2 space-y-4">

              {/* Bio row */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profileSetup.bio}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium">
                        {isRTL ? "النبذة (إنجليزي)" : "Biography (English)"}
                      </Label>
                      <Textarea
                        value={profile.bio}
                        onChange={e => { if (e.target.value.length <= 500) setProfile(p => ({ ...p, bio: e.target.value })); }}
                        placeholder={t.profileSetup.aboutMe}
                        className="min-h-[120px] resize-y"
                        dir="ltr"
                        data-testid="textarea-profile-bio"
                      />
                      <div className="text-end text-xs text-gray-400 font-medium">
                        {t.profileSetup.charCount(profile.bio.length)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium">
                        {isRTL ? "النبذة (عربي)" : "Biography (Arabic)"}
                      </Label>
                      <Textarea
                        value={profile.bioAr}
                        onChange={e => {
                          const filtered = e.target.value.replace(/[^\u0600-\u06FF\s\d\u0660-\u0669،.؟!٪'"،\-\n]/g, "");
                          if (filtered.length <= 500) setProfile(p => ({ ...p, bioAr: filtered }));
                        }}
                        placeholder={isRTL ? "نبذة عنك..." : "About me (Arabic)..."}
                        className="min-h-[120px] resize-y"
                        dir="rtl"
                        data-testid="textarea-profile-bio-ar"
                      />
                      <div className="text-end text-xs text-gray-400 font-medium">
                        {t.profileSetup.charCount(profile.bioAr.length)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media & Web Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{isRTL ? "روابط التواصل الاجتماعي والموقع" : "Social Media & Web Links"}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">{isRTL ? "اختياري — الروابط المُدخلة ستظهر على ملفك الشخصي العام" : "Optional — provided links will appear on your public profile"}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      { key: "websiteUrl",   label: isRTL ? "الموقع الإلكتروني" : "Personal Website",   placeholder: "https://yourwebsite.com" },
                      { key: "facebookUrl",  label: "Facebook",  placeholder: "https://facebook.com/yourpage" },
                      { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
                      { key: "tiktokUrl",    label: "TikTok",    placeholder: "https://tiktok.com/@yourhandle" },
                      { key: "youtubeUrl",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel" },
                      { key: "xUrl",         label: "X (Twitter)", placeholder: "https://x.com/yourhandle" },
                    ] as const).map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium">{label}</Label>
                        <Input
                          type="url"
                          value={socialLinks[key]}
                          onChange={e => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          dir="ltr"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                          {(clinic.cityName || clinic.areaId) && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {[clinic.cityName, apiAreas.find(a => String(a.id) === clinic.areaId)?.name].filter(Boolean).join(" · ")}
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
                              <Label>{isRTL ? "المحافظة" : "City / Governorate"}</Label>
                              <Select
                                value={clinic.cityName}
                                onValueChange={v => updateClinic(clinic.id, { cityName: v, areaId: "" })}
                              >
                                <SelectTrigger><SelectValue placeholder={isRTL ? "اختر المحافظة" : "Select city"} /></SelectTrigger>
                                <SelectContent>
                                  {apiCities.map(c => <SelectItem key={c.id} value={c.name}>{t.governorates[c.name] ?? c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>{isRTL ? "المنطقة" : "Area"}</Label>
                              <Select
                                value={clinic.areaId}
                                onValueChange={v => updateClinic(clinic.id, { areaId: v })}
                                disabled={!clinic.cityName}
                              >
                                <SelectTrigger><SelectValue placeholder={isRTL ? "اختر المنطقة" : "Select area"} /></SelectTrigger>
                                <SelectContent className="max-h-48 overflow-y-auto">
                                  {apiAreas
                                    .filter(a => {
                                      const city = apiCities.find(c => c.name === clinic.cityName);
                                      return city ? a.cityId === city.id : false;
                                    })
                                    .map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nameAr && isRTL ? a.nameAr : a.name}</SelectItem>)}
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

                          <div className="space-y-2">
                            <Label>{isRTL ? "رقم هاتف العيادة" : "Clinic Phone Number"}</Label>
                            <Input
                              value={clinic.phone}
                              onChange={e => updateClinic(clinic.id, { phone: e.target.value })}
                              placeholder={isRTL ? "مثال: 01012345678" : "e.g. 01012345678"}
                              type="tel"
                              data-testid={`input-clinic-phone-${idx}`}
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

                        {/* ── Booking & Follow-up Settings ── */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {isRTL ? "إعدادات الحجز والمتابعة" : "Booking & Follow-up Settings"}
                          </p>

                          {/* Booking Confirmation Mode */}
                          <div className="space-y-2">
                            <Label>{isRTL ? "طريقة تأكيد الحجز" : "Booking Confirmation"}</Label>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => updateClinic(clinic.id, { bookingConfirmationMethod: "automatic" })}
                                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                                  clinic.bookingConfirmationMethod === "automatic"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                ⚡ {isRTL ? "تلقائي" : "Automatic"}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateClinic(clinic.id, { bookingConfirmationMethod: "manual" })}
                                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                                  clinic.bookingConfirmationMethod === "manual"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                ✋ {isRTL ? "يدوي" : "Manual"}
                              </button>
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {clinic.bookingConfirmationMethod === "manual"
                                ? (isRTL ? "ستصل طلبات الحجز إلى لوحتك وتحتاج إلى موافقتك." : "Booking requests will arrive in your dashboard and require your approval.")
                                : (isRTL ? "تُؤكَّد المواعيد فوراً بعد الحجز." : "Appointments are confirmed instantly after booking.")}
                            </p>
                          </div>

                          {/* Follow-up Settings */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{isRTL ? "مدة المتابعة (أيام)" : "Follow-up Window (days)"}</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  value={clinic.followUpDays}
                                  onChange={e => updateClinic(clinic.id, { followUpDays: e.target.value })}
                                  placeholder="15"
                                  data-testid={`input-clinic-followup-days-${idx}`}
                                />
                              </div>
                              <p className="text-[11px] text-gray-400">
                                {isRTL ? "عدد الأيام المسموح فيها بإجراء متابعة بعد آخر زيارة." : "Days after last visit within which a follow-up applies."}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>{isRTL ? "سعر المتابعة" : "Follow-up Price"}</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  value={clinic.followUpPrice}
                                  onChange={e => updateClinic(clinic.id, { followUpPrice: e.target.value })}
                                  className="pe-12"
                                  placeholder="0"
                                  data-testid={`input-clinic-followup-price-${idx}`}
                                />
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                  {t.dashboard.egp}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400">
                                {isRTL ? "0 = متابعة مجانية" : "Set to 0 for a free follow-up."}
                              </p>
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
                                  <SelectContent className="max-h-48 overflow-y-auto">
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
                                  <SelectContent className="max-h-48 overflow-y-auto">
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

                        {/* Availability window + slot frequency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label>{isRTL ? "مدة إتاحة الحجز" : "Booking Availability Period"}</Label>
                            <Select
                              value={clinic.availabilityPeriod}
                              onValueChange={v => updateClinic(clinic.id, { availabilityPeriod: v as AvailabilityPeriod })}
                            >
                              <SelectTrigger className="bg-white" data-testid={`select-availability-period-${idx}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="week">{isRTL ? "أسبوع" : "Week"}</SelectItem>
                                <SelectItem value="month">{isRTL ? "شهر" : "Month"}</SelectItem>
                                <SelectItem value="quarter">{isRTL ? "3 أشهر" : "Quarter (3 months)"}</SelectItem>
                                <SelectItem value="year">{isRTL ? "سنة" : "Year"}</SelectItem>
                                <SelectItem value="custom">{isRTL ? "فترة مخصصة" : "Custom range"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-[11px] text-gray-400">
                              {isRTL ? "المدة التي تظهر فيها المواعيد المتاحة للمرضى في تقويم الحجز." : "How far ahead patients can see and book slots on the calendar."}
                            </p>
                            {clinic.availabilityPeriod === "custom" && (
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <Input
                                  type="date"
                                  value={clinic.availabilityFrom}
                                  onChange={e => updateClinic(clinic.id, { availabilityFrom: e.target.value })}
                                  data-testid={`input-availability-from-${idx}`}
                                />
                                <Input
                                  type="date"
                                  value={clinic.availabilityTo}
                                  onChange={e => updateClinic(clinic.id, { availabilityTo: e.target.value })}
                                  data-testid={`input-availability-to-${idx}`}
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>{isRTL ? "عدد الجلسات في الساعة" : "Sessions per Hour"}</Label>
                            <Select
                              value={clinic.sessionsPerHour}
                              onValueChange={v => updateClinic(clinic.id, { sessionsPerHour: v })}
                            >
                              <SelectTrigger className="bg-white" data-testid={`select-sessions-per-hour-${idx}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 6, 12].map(n => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} {isRTL ? "/ ساعة" : "/ hour"} ({Math.round(60 / n)} {isRTL ? "دقيقة" : "min"})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[11px] text-gray-400">
                              {isRTL ? "يحدد مدة كل موعد في التقويم (60 ÷ عدد الجلسات)." : "Determines each slot's length on the calendar (60 ÷ sessions per hour)."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Fix Leaflet default icon paths broken by Vite's asset pipeline ─── */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
});

const DEFAULT_LAT = 30.0444;
const DEFAULT_LNG = 31.2357;

function MapClickHandler({ onPinDrop }: { onPinDrop: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onPinDrop(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyToPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.5 });
  }, [lat, lng, map]);
  return null;
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
  const parsedLat = parseFloat(lat) || DEFAULT_LAT;
  const parsedLng = parseFloat(lng) || DEFAULT_LNG;
  const position: [number, number] = [parsedLat, parsedLng];

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      onError(
        isRTL ? "غير مدعوم" : "Not Supported",
        isRTL ? "المتصفح لا يدعم تحديد الموقع الجغرافي." : "Your browser does not support geolocation.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => onLocate(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6)),
      () => onError(
        isRTL ? "خطأ في تحديد الموقع" : "Location Error",
        isRTL ? "تعذر الحصول على موقعك. يرجى التحقق من إعدادات الموقع." : "Could not get your location. Please check location settings.",
      ),
    );
  };

  return (
    <div className="mt-1 rounded-xl border overflow-hidden relative" style={{ height: "176px" }}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapClickHandler onPinDrop={(la, lo) => onLocate(la.toFixed(6), lo.toFixed(6))} />
        <FlyToPosition lat={parsedLat} lng={parsedLng} />
      </MapContainer>
      <button
        type="button"
        onClick={handleGeolocate}
        className="absolute bottom-2 right-2 z-[1000] bg-white/90 hover:bg-white text-xs px-2 py-1 rounded-md shadow-sm font-medium text-gray-700 transition-colors flex items-center gap-1"
      >
        <LocateFixed className="h-3 w-3" />
        {isRTL ? "تحديد موقعي" : "Get My Location"}
      </button>
    </div>
  );
}
