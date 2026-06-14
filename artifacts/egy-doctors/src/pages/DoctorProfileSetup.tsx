import { useState } from "react";
import { useLocation } from "wouter";
import { Upload, Camera, Clock, ArrowLeft, MapPin, GraduationCap, Briefcase, LocateFixed } from "lucide-react";
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

export default function DoctorProfileSetup() {
  const { t, dir } = useLanguage();
  const [pathname, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = pathname.includes("edit-profile");
  
  const [formData, setFormData] = useState({
    fullName: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    subSpecialty: "Consultant Cardiologist",
    clinicName: "Heart Care Clinic",
    clinicAddress: "15 South Teseen St, 4th Floor",
    clinicMapLat: "30.0444",
    clinicMapLng: "31.2357",
    location: "New Cairo",
    fee: "450",
    experience: "15",
    qualificationDegree: "MD, PhD, FRCS",
    bio: "",
    schedule: {
      Sat: { active: true, from: "10:00", to: "18:00" },
      Sun: { active: false, from: "09:00", to: "17:00" },
      Mon: { active: true, from: "12:00", to: "20:00" },
      Tue: { active: false, from: "09:00", to: "17:00" },
      Wed: { active: true, from: "10:00", to: "16:00" },
      Thu: { active: false, from: "09:00", to: "17:00" },
      Fri: { active: false, from: "09:00", to: "17:00" }
    } as Record<Day, { active: boolean, from: string, to: string }>
  });

    const handleSave = () => {
    let title: string;
    let description: string;
    if (isEditMode) {
      title = dir === 'rtl' ? 'تم حفظ الملف الشخصي!' : 'Profile Updated!';
      description = dir === 'rtl' ? 'تم حفظ تغييرات ملفك الشخصي بنجاح.' : 'Your profile changes have been saved successfully.';
    } else {
      title = t.profileSetup.publishedSuccess;
      description = t.profileSetup.publishedSuccess;
    }
    toast({
      title,
      description,
      className: 'bg-green-50 text-green-900 border-green-200'
    });
    setTimeout(() => {
      setLocation('/dashboard');
    }, 1500);
  };

  const handleScheduleChange = (day: Day, field: "active" | "from" | "to", value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  return (
    <Layout>
      <div className="bg-gray-50/50 py-8 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode
                  ? (dir === "rtl" ? "تعديل الملف الشخصي" : "Edit Profile")
                  : t.profileSetup.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditMode
                  ? (dir === "rtl" ? "حدث معلوماتك والجدول واحفظ التغييرات."
                    : "Update your information, schedule, and save changes.")
                  : t.register.successDesc}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isEditMode && (
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {dir === "rtl" ? "الرجوع إلى لوحة التحكم" : "Back to Dashboard"}
                  </Button>
                </Link>
              )}
              <Button onClick={handleSave} size="lg" className="w-full md:w-auto" data-testid="button-save-profile">
                {isEditMode
                  ? (dir === "rtl" ? "حفظ التغييرات" : "Save Changes")
                  : t.profileSetup.savePublish}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        data-testid="input-profile-fullname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.profileSetup.specialty}</Label>
                      <Select value={formData.specialty} onValueChange={v => setFormData({...formData, specialty: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map(s => (
                            <SelectItem key={s} value={s}>{t.specialties[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.profileSetup.subSpecialty}</Label>
                      <Input 
                        value={formData.subSpecialty} 
                        onChange={e => setFormData({...formData, subSpecialty: e.target.value})} 
                        placeholder="e.g. Consultant Cardiologist"
                        data-testid="input-profile-subspecialty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        {dir === "rtl" ? "سنوات الخبرة" : "Years of Experience"}
                      </Label>
                      <Input 
                        type="number"
                        value={formData.experience} 
                        onChange={e => setFormData({...formData, experience: e.target.value})} 
                        placeholder="e.g. 15"
                        data-testid="input-profile-experience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {dir === "rtl" ? "الدرجة العلمية" : "Qualification Degree"}
                      </Label>
                      <Input 
                        value={formData.qualificationDegree} 
                        onChange={e => setFormData({...formData, qualificationDegree: e.target.value})} 
                        placeholder="e.g. MD, PhD, FRCS"
                        data-testid="input-profile-degree"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profileSetup.clinicInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.profileSetup.clinicName}</Label>
                      <Input 
                        value={formData.clinicName} 
                        onChange={e => setFormData({...formData, clinicName: e.target.value})} 
                        data-testid="input-profile-clinicname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.profileSetup.cityArea}</Label>
                      <Select value={formData.location} onValueChange={v => setFormData({...formData, location: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(l => (
                            <SelectItem key={l} value={l}>{t.locations[l]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.profileSetup.clinicAddress}</Label>
                    <Input 
                      value={formData.clinicAddress} 
                      onChange={e => setFormData({...formData, clinicAddress: e.target.value})} 
                      data-testid="input-profile-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {dir === "rtl" ? "موقع العيادة على الخريطة" : "Clinic Location on Map"}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">{dir === "rtl" ? "خط الطول" : "Latitude"}</Label>
                        <Input 
                          value={formData.clinicMapLat} 
                          onChange={e => setFormData({...formData, clinicMapLat: e.target.value})} 
                          placeholder="30.0444"
                          data-testid="input-profile-lat"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">{dir === "rtl" ? "خط العرض" : "Longitude"}</Label>
                        <Input 
                          value={formData.clinicMapLng} 
                          onChange={e => setFormData({...formData, clinicMapLng: e.target.value})} 
                          placeholder="31.2357"
                          data-testid="input-profile-lng"
                        />
                      </div>
                    </div>
                    <div className="mt-2 rounded-xl border overflow-hidden h-48 bg-gray-100 relative group">
                      <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${formData.clinicMapLat},${formData.clinicMapLng}&zoom=15&size=640x320&markers=${formData.clinicMapLat},${formData.clinicMapLng},red-pushpin`}
                        alt="Clinic location map"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const lat = position.coords.latitude.toString();
                                const lng = position.coords.longitude.toString();
                                setFormData(prev => ({
                                  ...prev,
                                  clinicMapLat: lat,
                                  clinicMapLng: lng
                                }));
                                window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`, '_blank');
                              },
                              (error) => {
                                toast({
                                  title: dir === "rtl" ? "خطأ في تحديد الموقع" : "Location Error",
                                  description: dir === "rtl" ? "تعذر الحصول على موقعك. يرجى التحقق من إعدادات الموقع." : "Could not get your location. Please check location settings.",
                                  className: 'bg-red-50 text-red-900 border-red-200'
                                });
                              }
                            );
                          } else {
                            toast({
                              title: dir === "rtl" ? "غير مدعوم" : "Not Supported",
                              description: dir === "rtl" ? "المتصفح لا يدعم تحديد الموقع الجغرافي." : "Your browser does not support geolocation.",
                              className: 'bg-red-50 text-red-900 border-red-200'
                            });
                          }
                        }}
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs px-2 py-1 rounded-md shadow-sm font-medium text-gray-700 transition-colors flex items-center gap-1"
                      >
                        <LocateFixed className="h-3 w-3" />
                        {dir === "rtl" ? "تحديد موقعي" : "Get My Location"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {dir === "rtl" 
                        ? "الخريطة مرجع مجاني من OpenStreetMap. يمكنك تحديد الموقع من خلال ادخال الإحداثيات."
                        : "Map preview from OpenStreetMap. You can set the location by entering coordinates."
                      }
                    </p>
                  </div>

                  <div className="space-y-2 w-full md:w-1/2">
                    <Label>{t.profileSetup.consultationFee}</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={formData.fee} 
                        onChange={e => setFormData({...formData, fee: e.target.value})} 
                        className="pe-12"
                        data-testid="input-profile-fee"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        {t.dashboard.egp}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profileSetup.bio}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea 
                      value={formData.bio} 
                      onChange={e => {
                        if(e.target.value.length <= 500) setFormData({...formData, bio: e.target.value});
                      }} 
                      placeholder={t.profileSetup.aboutMe}
                      className="min-h-[120px] resize-y"
                      data-testid="textarea-profile-bio"
                    />
                    <div className="text-end text-xs text-gray-400 font-medium">
                      {t.profileSetup.charCount(formData.bio.length)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg m-0">{t.profileSetup.weeklySchedule}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DAYS.map(day => (
                      <div key={day} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${formData.schedule[day].active ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className="w-32 flex items-center gap-3">
                          <Checkbox 
                            id={`day-${day}`}
                            checked={formData.schedule[day].active}
                            onCheckedChange={c => handleScheduleChange(day, "active", c === true)}
                            data-testid={`checkbox-schedule-${day}`}
                          />
                          <Label htmlFor={`day-${day}`} className={`cursor-pointer ${formData.schedule[day].active ? 'text-gray-900 font-medium' : 'text-gray-500 font-normal'}`}>
                            {t.profileSetup.days[day as keyof typeof t.profileSetup.days]}
                          </Label>
                        </div>
                        
                        <div className={`flex items-center gap-2 flex-1 transition-opacity ${formData.schedule[day].active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <Select 
                            disabled={!formData.schedule[day].active} 
                            value={formData.schedule[day].from}
                            onValueChange={v => handleScheduleChange(day, "from", v)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={t.profileSetup.timeFrom} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 24}).map((_, i) => {
                                const time = `${i.toString().padStart(2, '0')}:00`;
                                return <SelectItem key={time} value={time}>{time}</SelectItem>
                              })}
                            </SelectContent>
                          </Select>
                          <span className="text-gray-400 text-sm">-</span>
                          <Select 
                            disabled={!formData.schedule[day].active} 
                            value={formData.schedule[day].to}
                            onValueChange={v => handleScheduleChange(day, "to", v)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={t.profileSetup.timeTo} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 24}).map((_, i) => {
                                const time = `${i.toString().padStart(2, '0')}:00`;
                                return <SelectItem key={time} value={time}>{time}</SelectItem>
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
