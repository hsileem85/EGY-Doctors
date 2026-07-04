import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
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

/** Static development OTP for the mock WhatsApp verification gate. */
const DEV_OTP = "1234";

export default function DoctorRegister() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Step 2 submit: does NOT create the account. Sends a (mock) WhatsApp OTP
  // and advances to the verification gate. The account is only created after
  // the doctor enters the correct OTP on step 3.
  const handleRequestOtp = () => {
    if (!formData.specialty || !formData.location || !formData.experience || !formData.license || !formData.agreeTerms) return;
    setOtp("");
    setOtpError(false);
    // Mock WhatsApp OTP delivery (development-only static code `1234`).
    console.info(`[WhatsApp OTP sent] code ${DEV_OTP} to ${formData.phone}`);
    toast({
      title: t.register.otpSent,
      description: t.register.otpDesc(formData.phone),
      className: "bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/20",
    });
    setStep(3);
  };

  // Step 3 submit: only after the correct OTP does account creation run.
  const handleVerifyOtp = async () => {
    if (otp.trim() !== DEV_OTP) {
      setOtpError(true);
      toast({
        title: t.register.otpInvalid,
        variant: "destructive",
      });
      return;
    }
    setOtpError(false);
    setIsVerifying(true);
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast({
        title: lang === "ar" ? "تعذر إنشاء الحساب" : "Could not create account",
        description: msg || (lang === "ar"
          ? "قد يكون رقم الهاتف أو البريد الإلكتروني مستخدماً بالفعل. يرجى المحاولة مجدداً."
          : "This phone number or email may already be registered. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpError(false);
    console.info(`[WhatsApp OTP sent] code ${DEV_OTP} to ${formData.phone}`);
    toast({
      title: t.register.otpResent,
      description: t.register.otpDesc(formData.phone),
      className: "bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/20",
    });
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
            {t.register.stepIndicator(step, 3)}: {step === 1 ? t.register.step1 : step === 2 ? t.register.step2 : t.register.step3}
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
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
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

          {step === 3 && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleVerifyOtp(); }}>
              <div className="flex flex-col items-center text-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-[#128C7E]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{t.register.otpTitle}</h2>
                <p className="text-sm text-gray-500">{t.register.otpDesc(formData.phone)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">{t.register.otpLabel}</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(false); }}
                  placeholder={t.register.otpPlaceholder}
                  className={otpError ? "border-red-500 focus-visible:ring-red-500 text-center tracking-[0.5em] text-lg" : "text-center tracking-[0.5em] text-lg"}
                  data-testid="input-register-otp"
                />
                {otpError && <p className="text-sm text-red-500">{t.register.otpInvalid}</p>}
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(2)} data-testid="button-otp-back">
                  {t.register.back}
                </Button>
                <Button
                  type="submit"
                  className="w-2/3"
                  disabled={!otp.trim() || isVerifying}
                  data-testid="button-verify-otp"
                >
                  {isVerifying ? (lang === "ar" ? "جاري التحقق..." : "Verifying...") : t.register.otpVerify}
                </Button>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full text-center text-sm text-primary hover:underline mt-2"
                data-testid="button-resend-otp"
              >
                {t.register.otpResend}
              </button>
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
