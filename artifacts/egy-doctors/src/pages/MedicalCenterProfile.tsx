import { useState } from "react";
import { Building2, Upload, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
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

type MedicalSubtype = "hospital" | "clinic" | "polyclinic" | "lab" | "scan";
type Day = "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

const medicalSubtypeLabels = {
  en: { hospital: "Hospital", clinic: "Clinic", polyclinic: "Poly Clinic", lab: "Lab", scan: "Scan Center" },
  ar: { hospital: "مستشفى", clinic: "عيادة", polyclinic: "عيادة متعددة", lab: "معمل", scan: "مركز أشعة" },
};

const defaultSchedule: Record<Day, { active: boolean; from: string; to: string }> = {
  Saturday: { active: true, from: "09:00", to: "17:00" },
  Sunday: { active: false, from: "09:00", to: "17:00" },
  Monday: { active: true, from: "09:00", to: "17:00" },
  Tuesday: { active: true, from: "09:00", to: "17:00" },
  Wednesday: { active: true, from: "09:00", to: "17:00" },
  Thursday: { active: true, from: "09:00", to: "17:00" },
  Friday: { active: false, from: "09:00", to: "17:00" },
};

export default function MedicalCenterProfile() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: "Alfa Scan Radiology",
    type: "scan" as MedicalSubtype,
    email: "info@alfascan.com",
    phone: "+20 2 1234 5678",
    location: "Cairo",
    address: "123 Nile Corniche, Downtown Cairo",
    about: "Leading radiology center providing advanced diagnostic imaging services with state-of-the-art equipment.",
    services: "MRI, CT Scan, X-Ray, Ultrasound, Mammography",
  });

  const [schedule, setSchedule] = useState(defaultSchedule);

  const handleSave = () => {
    toast({
      title: isRTL ? "تم حفظ الملف!" : "Profile Saved!",
      description: isRTL ? "تم حفظ تغييرات ملف مركزك بنجاح." : "Your center profile changes have been saved successfully.",
      className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    });
    setTimeout(() => setLocation("/medical-center/dashboard"), 1500);
  };

  const handleScheduleChange = (day: Day, field: "active" | "from" | "to", value: boolean | string) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const t = {
    title: isRTL ? "إعداد ملف المركز" : "Center Profile Setup",
    subtitle: isRTL ? "حدث معلومات مركزك واحفظها." : "Update your center information and save changes.",
    back: isRTL ? "العودة للوحة" : "Back to Dashboard",
    save: isRTL ? "حفظ التغييرات" : "Save Changes",
    basicInfo: isRTL ? "المعلومات الأساسية" : "Basic Information",
    centerName: isRTL ? "اسم المركز" : "Center Name",
    centerType: isRTL ? "نوع المركز" : "Center Type",
    email: isRTL ? "البريد الإلكتروني" : "Email",
    phone: isRTL ? "رقم الهاتف" : "Phone",
    location: isRTL ? "الموقع" : "Location",
    address: isRTL ? "العنوان" : "Address",
    about: isRTL ? "نبذة عامة" : "About",
    services: isRTL ? "الخدمات (مفصولة بفواصل)" : "Services (comma separated)",
    schedule: isRTL ? "المنتظار" : "Weekly Schedule",
    uploadLogo: isRTL ? "رفع الشعار" : "Upload Logo",
    days: isRTL
      ? { Saturday: "السبت", Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة" }
      : { Saturday: "Saturday", Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday" },
  };

  const locations = ["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Suez", "Port Said", "Luxor", "Aswan", "Sharm El Sheikh"];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-500">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/medical-center/dashboard">
                <Button variant="outline" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
              </Link>
              <Button onClick={handleSave} className="gap-1">
                <Save className="h-4 w-4" />
                {t.save}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Logo upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t.uploadLogo}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-center">{isRTL ? "انقر لرفع صورة" : "Click to upload image"}</p>
              </CardContent>
            </Card>

            {/* Right: Form */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t.basicInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="centerName">{t.centerName}</Label>
                      <Input
                        id="centerName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="centerType">{t.centerType}</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) => setFormData({ ...formData, type: v as MedicalSubtype })}
                      >
                        <SelectTrigger id="centerType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["hospital", "clinic", "polyclinic", "lab", "scan"] as MedicalSubtype[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {medicalSubtypeLabels[lang][s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="centerEmail">{t.email}</Label>
                      <Input
                        id="centerEmail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="centerPhone">{t.phone}</Label>
                      <Input
                        id="centerPhone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="centerLocation">{t.location}</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(v) => setFormData({ ...formData, location: v })}
                      >
                        <SelectTrigger id="centerLocation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="centerAddress">{t.address}</Label>
                      <Input
                        id="centerAddress"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centerAbout">{t.about}</Label>
                    <Textarea
                      id="centerAbout"
                      rows={3}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centerServices">{t.services}</Label>
                    <Input
                      id="centerServices"
                      value={formData.services}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                      placeholder="MRI, CT Scan, X-Ray..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Schedule */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t.schedule}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(Object.keys(schedule) as Day[]).map((day) => (
                    <div
                      key={day}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        schedule[day].active ? "border-primary/20 bg-primary/5" : "border-gray-100 bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={schedule[day].active}
                        onChange={(e) => handleScheduleChange(day, "active", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm font-medium w-24 ${schedule[day].active ? "text-gray-900" : "text-gray-400"}`}>
                        {t.days[day]}
                      </span>
                      <select
                        value={schedule[day].from}
                        onChange={(e) => handleScheduleChange(day, "from", e.target.value)}
                        disabled={!schedule[day].active}
                        className="text-sm border rounded-md px-2 py-1 disabled:opacity-40"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                            {String(i).padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400">-</span>
                      <select
                        value={schedule[day].to}
                        onChange={(e) => handleScheduleChange(day, "to", e.target.value)}
                        disabled={!schedule[day].active}
                        className="text-sm border rounded-md px-2 py-1 disabled:opacity-40"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                            {String(i).padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
