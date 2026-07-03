import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpecialtyCombobox } from "@/components/ui/SpecialtyCombobox";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getSpecialties, getCities, signUp as apiSignUp } from "@/lib/api";

/** Strip leading English doctor title prefixes (case-insensitive): "Dr.", "Dr ", "Dr/" */
function stripEnTitle(value: string): string {
  return value.replace(/^dr[.\s/]+/i, "").trimStart();
}

/** Strip leading Arabic doctor title prefixes: "د.", "د ", "د/" */
function stripArTitle(value: string): string {
  return value.replace(/^د[.\s/]+/, "").trimStart();
}

export default function DoctorRegister() {
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    fullNameAr: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    location: "",
    experience: "",
    license: "",
    syndicateMembership: "",
    agreeTerms: false
  });

  const { data: apiSpecialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });
  const { data: apiCities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  const handleNext = () => {
    if (formData.fullName && formData.email && formData.phone && formData.password && formData.password === formData.confirmPassword) {
      setStep(2);
    }
  };

  const selectedSpecialty = apiSpecialties.find(s => s.name === formData.specialty);
  const selectedCity = apiCities.find(c => c.name === formData.location);

  const handleRegister = async () => {
    if (!formData.specialty || !formData.location || !formData.experience || !formData.license || !formData.agreeTerms) return;
    try {
      await apiSignUp({
        name: formData.fullName,
        nameAr: formData.fullNameAr || undefined,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "doctor",
        specialtyId: selectedSpecialty?.id,
        cityId: selectedCity?.id,
        experience: formData.experience ? Number(formData.experience) : undefined,
        license: formData.license || undefined,
        syndicateNumber: formData.syndicateMembership || undefined,
      });
      setIsSuccess(true);
    } catch {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#D4A853]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t.register.successTitle}</h2>
            <p className="text-gray-500 mb-6">{t.register.successDesc}</p>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/profile-setup")}
              data-testid="button-go-to-profile-setup"
            >
              {t.register.goToProfileSetup}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-gray-900 tracking-tight font-brand">EGY Doctors</span>
      </Link>

      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.register.title}</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {t.register.stepIndicator(step, 2)}: {step === 1 ? t.register.step1 : t.register.step2}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.register.fullName}</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: stripEnTitle(e.target.value)})} 
                  data-testid="input-register-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullNameAr">
                  {lang === "ar" ? "الاسم باللغة العربية" : "Arabic Name"}
                </Label>
                <Input 
                  id="fullNameAr"
                  dir="rtl"
                  value={formData.fullNameAr} 
                  onChange={e => setFormData({...formData, fullNameAr: stripArTitle(e.target.value)})} 
                  data-testid="input-register-fullname-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.register.email}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.register.phone}</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  data-testid="input-register-phone"
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">{t.register.password}</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="pe-10"
                    data-testid="input-register-password"
                  />
                  <button 
                    type="button"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                  data-testid="input-register-confirm-password"
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full mt-6" 
                disabled={!formData.fullName || !formData.email || !formData.phone || !formData.password || formData.password !== formData.confirmPassword}
                data-testid="button-register-next"
              >
                {t.register.next}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleRegister(); }}>
              <div className="space-y-2">
                <Label>{t.register.specialty}</Label>
                <SpecialtyCombobox
                  data-testid="select-register-specialty"
                  value={formData.specialty}
                  onValueChange={v => setFormData({...formData, specialty: v})}
                  options={apiSpecialties.map(s => ({ value: s.name, label: t.specialties[s.name] ?? s.name }))}
                  placeholder={t.home.chooseSpecialty}
                  searchPlaceholder={lang === "ar" ? "ابحث عن التخصص…" : "Search specialties…"}
                  emptyMessage={lang === "ar" ? "لا يوجد تخصص مطابق." : "No specialty found."}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.register.location}</Label>
                <SearchableCombobox
                  value={formData.location}
                  onValueChange={v => setFormData({...formData, location: v})}
                  options={apiCities.map(c => ({ value: c.name, label: t.locations[c.name] ?? t.governorates?.[c.name] ?? c.name }))}
                  placeholder={t.home.chooseCityOrArea}
                  searchPlaceholder={lang === "ar" ? "ابحث في المحافظات..." : "Search governorates..."}
                  emptyMessage={lang === "ar" ? "لا توجد نتائج" : "No results found"}
                  data-testid="select-register-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">{t.register.yearsOfExperience}</Label>
                <Input 
                  id="experience" 
                  type="number" 
                  min="0"
                  value={formData.experience} 
                  onChange={e => setFormData({...formData, experience: e.target.value})} 
                  data-testid="input-register-experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">{t.register.licenseNumber}</Label>
                <Input 
                  id="license" 
                  value={formData.license} 
                  onChange={e => setFormData({...formData, license: e.target.value})} 
                  data-testid="input-register-license"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="syndicateMembership">
                  {lang === "ar" ? "رقم عضوية النقابة الطبية" : "Medical Syndicate Membership Number"}
                </Label>
                <Input 
                  id="syndicateMembership" 
                  value={formData.syndicateMembership} 
                  onChange={e => setFormData({...formData, syndicateMembership: e.target.value})} 
                  data-testid="input-register-syndicate"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse mt-4 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreeTerms}
                  onCheckedChange={(c) => setFormData({...formData, agreeTerms: c === true})}
                  data-testid="checkbox-register-terms"
                />
                <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                  {t.register.agreeToTerms}
                </Label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)} data-testid="button-register-back">
                  {t.register.back}
                </Button>
                <Button 
                  type="submit"
                  className="w-2/3" 
                  disabled={!formData.specialty || !formData.location || !formData.experience || !formData.license || !formData.syndicateMembership || !formData.agreeTerms}
                  data-testid="button-register-submit"
                >
                  {t.register.register}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            {t.register.alreadyHaveAccount}{" "}
            <Link href="/dashboard" className="text-primary hover:underline font-medium" data-testid="link-login">
              {t.register.login}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
