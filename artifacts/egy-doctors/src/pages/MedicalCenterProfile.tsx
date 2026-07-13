import { useState, useEffect } from "react";
import { Building2, Save, ArrowLeft, CheckCircle2, Globe, Facebook, Instagram, MapPin, LocateFixed, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { getMedicalCenterProfile, updateMedicalCenterProfile, getServices, type MedicalCenterProfile, type CenterSubType } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const subTypeLabels: Record<CenterSubType, { en: string; ar: string }> = {
  POLY_CLINIC:        { en: "Poly Clinic",        ar: "عيادة متعددة التخصصات" },
  HOSPITAL:           { en: "Hospital",            ar: "مستشفى" },
  LAB:                { en: "Lab",                 ar: "معمل تحاليل" },
  SCAN_CENTER:        { en: "Scan Center",         ar: "مركز أشعة" },
  VETERINARY_CLINIC:  { en: "Veterinary Clinic",   ar: "عيادة بيطرية" },
};

const typeLabels: Record<string, { en: string; ar: string }> = {
  hospital:    { en: "Hospital",   ar: "مستشفى" },
  clinic:      { en: "Clinic",     ar: "عيادة" },
  polyclinic:  { en: "Poly Clinic", ar: "عيادة متعددة" },
  lab:         { en: "Lab",        ar: "معمل" },
  scan:        { en: "Scan Center", ar: "مركز أشعة" },
};

interface FormState {
  name: string;
  nameAr: string;
  type: string;
  subType: CenterSubType | "";
  phone: string;
  address: string;
  bio: string;
  bioAr: string;
  commercialRegistrationNumber: string;
  website: string;
  facebook: string;
  instagram: string;
  lat: string;
  lng: string;
  services: number[];
}

const EMPTY: FormState = {
  name: "", nameAr: "", type: "clinic", subType: "",
  phone: "", address: "", bio: "", bioAr: "", commercialRegistrationNumber: "",
  website: "", facebook: "", instagram: "", lat: "", lng: "", services: [],
};

export default function MedicalCenterProfile() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [centerId, setCenterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notApproved, setNotApproved] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: getServices });

  useEffect(() => {
    getMedicalCenterProfile()
      .then((p: MedicalCenterProfile) => {
        setCenterId(p.id);
        setNotApproved(!p.isApproved);
        setForm({
          name:   p.name   ?? "",
          nameAr: p.nameAr ?? "",
          type:   p.type   ?? "clinic",
          subType: (p.subType as CenterSubType) ?? "",
          phone:  p.phone  ?? "",
          address: p.address ?? "",
          bio:    p.bio    ?? "",
          bioAr:  p.bioAr  ?? "",
          commercialRegistrationNumber: p.commercialRegistrationNumber ?? "",
          website:   p.website  ?? "",
          facebook:  p.facebook ?? "",
          instagram: p.instagram ?? "",
          lat: p.lat?.toString() ?? "",
          lng: p.lng?.toString() ?? "",
          services: p.services ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const f = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateMedicalCenterProfile({
        name:   form.name,
        nameAr: form.nameAr || undefined,
        type:   form.type,
        subType: (form.subType as CenterSubType) || undefined,
        phone:  form.phone || undefined,
        address: form.address || undefined,
        bio:    form.bio || undefined,
        bioAr:  form.bioAr || undefined,
        commercialRegistrationNumber: form.commercialRegistrationNumber || undefined,
        website:   form.website   || null,
        facebook:  form.facebook  || null,
        instagram: form.instagram || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        services: form.services,
      });
      void qc.invalidateQueries({ queryKey: ["medicalCentersDirectory"] });
      if (centerId != null) {
        void qc.invalidateQueries({ queryKey: ["medicalCenterPublicProfile", String(centerId)] });
      }
      toast({
        title: isRTL ? "تم الحفظ!" : "Profile Saved!",
        description: isRTL ? "تم حفظ بيانات مركزك بنجاح." : "Your center profile has been saved.",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      setTimeout(() => setLocation("/medical-center/dashboard"), 1200);
    } catch (err) {
      toast({
        title: isRTL ? "خطأ في الحفظ" : "Save failed",
        description: err instanceof Error ? err.message : (isRTL ? "حاول مرة أخرى" : "Please try again"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const t = {
    title:    isRTL ? "إعداد ملف المركز" : "Center Profile Setup",
    subtitle: isRTL ? "حدد معلومات مركزك واحفظها." : "Update your center information and save changes.",
    back:     isRTL ? "العودة للوحة" : "Back to Dashboard",
    save:     isRTL ? "حفظ التغييرات" : "Save Changes",
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50" dir={dir}>
        <div className="max-w-3xl mx-auto p-4 md:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-500 text-sm">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/medical-center/dashboard">
                <Button variant="outline" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                <Save className="h-4 w-4" />
                {isSaving ? (isRTL ? "جارٍ الحفظ..." : "Saving...") : t.save}
              </Button>
            </div>
          </div>

          {/* Pending approval banner */}
          {notApproved && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">⏳</div>
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  {isRTL ? "ملفك قيد المراجعة" : "Your profile is pending approval"}
                </p>
                <p className="text-amber-600 text-xs mt-0.5">
                  {isRTL
                    ? "سيتم مراجعة بياناتك من قِبل الفريق وسنُعلمك بالنتيجة."
                    : "Our team will review your information and notify you shortly."}
                </p>
              </div>
            </div>
          )}

          {centerId && (
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {isRTL ? `رقم المركز: ${centerId}` : `Center ID: ${centerId}`}
            </div>
          )}

          <div className="space-y-6">
            {/* Logo placeholder */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{isRTL ? "شعار المركز" : "Center Logo"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-2">
                <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">{isRTL ? "رفع الصورة (قريباً)" : "Image upload coming soon"}</p>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{isRTL ? "المعلومات الأساسية" : "Basic Information"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "اسم المركز (إنجليزي)" : "Center Name (English)"}</Label>
                    <Input value={form.name} onChange={(e) => f("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "اسم المركز (عربي)" : "Center Name (Arabic)"}</Label>
                    <Input value={form.nameAr} onChange={(e) => f("nameAr", e.target.value)} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "نوع المنشأة" : "Facility Type"}</Label>
                    <Select value={form.type} onValueChange={(v) => f("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{isRTL ? v.ar : v.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "التصنيف الفرعي" : "Sub-Type"}</Label>
                    <Select value={form.subType || "none"} onValueChange={(v) => f("subType", v === "none" ? "" : v as CenterSubType)}>
                      <SelectTrigger><SelectValue placeholder={isRTL ? "اختر..." : "Select..."} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{isRTL ? "لا يوجد" : "None"}</SelectItem>
                        {(Object.entries(subTypeLabels) as [CenterSubType, { en: string; ar: string }][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{isRTL ? v.ar : v.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => f("phone", e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "رقم السجل التجاري" : "Commercial Registration No."}</Label>
                    <Input value={form.commercialRegistrationNumber} onChange={(e) => f("commercialRegistrationNumber", e.target.value)} dir="ltr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "العنوان" : "Address"}</Label>
                  <Input value={form.address} onChange={(e) => f("address", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Location Coordinates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {isRTL ? "الإحداثيات الجغرافية" : "Location Coordinates"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {isRTL
                      ? "أضف إحداثيات GPS لعرض موقعك بدقة على الخريطة."
                      : "Add GPS coordinates to display your location accurately on the map."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLocating}
                    className="shrink-0 text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast({ title: isRTL ? "المتصفح لا يدعم تحديد الموقع" : "Geolocation not supported by your browser", variant: "destructive" });
                        return;
                      }
                      setIsLocating(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          f("lat", pos.coords.latitude.toFixed(6));
                          f("lng", pos.coords.longitude.toFixed(6));
                          setIsLocating(false);
                          toast({ title: isRTL ? "تم تحديد موقعك بنجاح" : "Location detected successfully" });
                        },
                        () => {
                          setIsLocating(false);
                          toast({ title: isRTL ? "تعذّر تحديد الموقع — تأكد من منح الإذن" : "Could not get location — please allow location access", variant: "destructive" });
                        },
                        { timeout: 10000, enableHighAccuracy: true },
                      );
                    }}
                  >
                    {isLocating
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <LocateFixed className="h-3.5 w-3.5" />}
                    {isRTL ? "موقعي الحالي" : "Get My Location"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "خط العرض (Latitude)" : "Latitude"}</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 30.0444"
                      value={form.lat}
                      onChange={(e) => f("lat", e.target.value)}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "خط الطول (Longitude)" : "Longitude"}</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 31.2357"
                      value={form.lng}
                      onChange={(e) => f("lng", e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>
                {form.lat && form.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${form.lat},${form.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {isRTL ? "معاينة الموقع على الخريطة" : "Preview on map"}
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{isRTL ? "الخدمات المتوفرة" : "Available Services"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">
                  {isRTL
                    ? "اختر الخدمات التي يقدمها مركزك. ستظهر للمرضى في صفحة البحث والرئيسية."
                    : "Select the services your center offers. These are shown publicly on search and home pages."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {services.map((opt) => {
                    const selected = form.services.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          f(
                            "services",
                            selected
                              ? form.services.filter((s) => s !== opt.id)
                              : [...form.services, opt.id],
                          )
                        }
                        className={`text-sm font-medium rounded-lg px-3 py-2 border transition-colors text-start ${
                          selected
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {isRTL ? opt.nameAr : opt.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{isRTL ? "نبذة عن المركز" : "About the Center"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "وصف بالإنجليزية" : "Description (English)"}</Label>
                  <Textarea rows={3} value={form.bio} onChange={(e) => f("bio", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "وصف بالعربية" : "Description (Arabic)"}</Label>
                  <Textarea rows={3} value={form.bioAr} onChange={(e) => f("bioAr", e.target.value)} dir="rtl" />
                </div>
              </CardContent>
            </Card>

            {/* Social & Web */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  {isRTL ? "الموقع والتواصل الاجتماعي" : "Website & Social Media"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    {isRTL ? "الموقع الإلكتروني" : "Website"}
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(e) => f("website", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5 text-blue-500" />
                    {isRTL ? "صفحة فيسبوك" : "Facebook Page"}
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://facebook.com/yourcenter"
                    value={form.facebook}
                    onChange={(e) => f("facebook", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-500" />
                    {isRTL ? "حساب إنستغرام" : "Instagram"}
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/yourcenter"
                    value={form.instagram}
                    onChange={(e) => f("instagram", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
