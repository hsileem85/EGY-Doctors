import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2, Shield, CalendarDays, Award, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { specialties, locations } from "@/lib/data";

export default function DoctorAuth() {
  const { t, dir } = useLanguage();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    location: "",
    experience: "",
    license: "",
    agreeTerms: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleNext = () => {
    if (
      signupData.fullName &&
      signupData.email &&
      signupData.phone &&
      signupData.password &&
      signupData.password === signupData.confirmPassword
    ) {
      setSignupStep(2);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      signupData.specialty &&
      signupData.location &&
      signupData.experience &&
      signupData.license &&
      signupData.agreeTerms
    ) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-[120px]" />

        <Card className="w-full max-w-md text-center py-10 border-[#10B981]/20 bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl relative z-10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-2 border border-[#10B981]/30">
              <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {dir === "rtl" ? "تم التسجيل بنجاح!" : "Registration Successful!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {dir === "rtl"
                ? "تم إنشاء حسابك. يرجى إكمال ملفك الشخصي للبدء في استقبال المواعيد."
                : "Your account has been created. Please complete your profile to start accepting appointments."}
            </p>
            <Button
              className="w-full bg-[#10B981] text-[#0F172A] hover:bg-[#10B981]/90 font-semibold"
              onClick={() => setLocation("/profile-setup")}
              data-testid="button-go-to-profile-setup"
            >
              {dir === "rtl" ? "الذهاب لإعداد الملف الشخصي" : "Go to Profile Setup"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-stretch justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#10B981]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#10B981]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E293B]/30 rounded-full blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-auto">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-center p-12">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-[#10B981]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight font-brand">EGY Doctors</span>
              <p className="text-xs text-[#10B981] tracking-wider">{dir === "rtl" ? "إجي دكتورز" : "EGY Doctors"}</p>
            </div>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {dir === "rtl"
              ? "نمو معـًا للرعاية الصحية"
              : "Grow Your Practice"}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {dir === "rtl"
              ? "انضم إلى شبكة EGY Doctors وابدأ في استقبال مريضين جدداً. نشرف لك إدارة مواعيدك وملفك الطبي الرقمي."
              : "Join the EGY Doctors network and start accepting new patients. We provide appointment management and a digital profile to showcase your expertise."}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                <CalendarDays className="h-4 w-4 text-[#10B981]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "إدارة مواعيدك بسهولة" : "Easy appointment management"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                <Award className="h-4 w-4 text-[#10B981]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "ملف طبي رقمي مشرف" : "Showcase your credentials"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                <Shield className="h-4 w-4 text-[#10B981]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "مريضين مؤهلون يثقون فيك" : "Verified patients trust you"}
              </span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
          <Card className="w-full max-w-lg border-[#334155] bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl shadow-black/40">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="text-center pb-0 pt-6 px-6">
                {/* Mobile logo + back */}
                <div className="lg:hidden flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <span className="text-xl font-bold text-white font-brand">EGY Doctors</span>
                  </div>
                  <Link href="/" className="text-gray-400 hover:text-[#10B981] transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </div>

                {/* Desktop back button */}
                <div className="hidden lg:flex items-center mb-4">
                  <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#10B981] transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span>{dir === "rtl" ? "العودة للرئيسية" : "Back to Home"}</span>
                  </Link>
                </div>

                <TabsList className="grid w-full grid-cols-2 bg-[#0F172A]/60 border border-[#334155] p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6 pt-2">
                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white text-start">
                        {dir === "rtl" ? "تسجيل دخول الطبيب" : "Doctor Login"}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1 text-start">
                        {dir === "rtl"
                          ? "سجل دخولك لإدارة عيادتك والمواعيد."
                          : "Sign in to manage your clinic and appointments."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginEmail" className="text-gray-300">
                        {dir === "rtl" ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        placeholder={dir === "rtl" ? "doctor@example.com" : "doctor@example.com"}
                        data-testid="input-login-email"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="text-gray-300">
                        {dir === "rtl" ? "كلمة المرور" : "Password"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="loginPassword"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                          }
                          data-testid="input-login-password"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#10B981] transition-colors"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#10B981] text-[#0F172A] hover:bg-[#10B981]/90 font-semibold shadow-lg shadow-[#10B981]/20" data-testid="button-login">
                      {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab with 2-step wizard */}
                <TabsContent value="signup">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white text-start">
                      {dir === "rtl" ? "إنشاء حساب طبيب" : "Doctor Sign Up"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium text-start">
                      {dir === "rtl"
                        ? `الخطوة ${signupStep} من 2: ${signupStep === 1 ? "بيانات الحساب" : "المعلومات المهنية"}`
                        : `Step ${signupStep} of 2: ${signupStep === 1 ? "Account Details" : "Professional Info"}`}
                    </p>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${signupStep === 1 ? "bg-[#10B981] text-[#0F172A]" : "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"}`}>
                      1
                    </div>
                    <div className={`w-12 h-0.5 ${signupStep === 2 ? "bg-[#10B981]" : "bg-[#334155]"}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${signupStep === 2 ? "bg-[#10B981] text-[#0F172A]" : "bg-[#334155] text-gray-500"}`}>
                      2
                    </div>
                  </div>

                  {signupStep === 1 && (
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNext();
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signupName" className="text-gray-300">
                          {dir === "rtl" ? "الاسم الكامل" : "Full Name"}
                        </Label>
                        <Input
                          id="signupName"
                          value={signupData.fullName}
                          onChange={(e) =>
                            setSignupData({ ...signupData, fullName: e.target.value })
                          }
                          data-testid="input-signup-fullname"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupEmail" className="text-gray-300">
                          {dir === "rtl" ? "البريد الإلكتروني" : "Email"}
                        </Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({ ...signupData, email: e.target.value })
                          }
                          data-testid="input-signup-email"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPhone" className="text-gray-300">
                          {dir === "rtl" ? "رقم الهاتف" : "Phone"}
                        </Label>
                        <Input
                          id="signupPhone"
                          type="tel"
                          value={signupData.phone}
                          onChange={(e) =>
                            setSignupData({ ...signupData, phone: e.target.value })
                          }
                          data-testid="input-signup-phone"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPassword" className="text-gray-300">
                          {dir === "rtl" ? "كلمة المرور" : "Password"}
                        </Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            value={signupData.password}
                            onChange={(e) =>
                              setSignupData({ ...signupData, password: e.target.value })
                            }
                            className="pe-10 bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                            data-testid="input-signup-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#10B981] transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupConfirmPassword" className="text-gray-300">
                          {dir === "rtl" ? "تأكيد كلمة المرور" : "Confirm Password"}
                        </Label>
                        <Input
                          id="signupConfirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({ ...signupData, confirmPassword: e.target.value })
                          }
                          data-testid="input-signup-confirm"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-2 bg-[#10B981] text-[#0F172A] hover:bg-[#10B981]/90 font-semibold shadow-lg shadow-[#10B981]/20"
                        disabled={
                          !signupData.fullName ||
                          !signupData.email ||
                          !signupData.phone ||
                          !signupData.password ||
                          signupData.password !== signupData.confirmPassword
                        }
                        data-testid="button-signup-next"
                      >
                        {dir === "rtl" ? "التالي" : "Next"}
                      </Button>
                    </form>
                  )}

                  {signupStep === 2 && (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signupSpecialty" className="text-gray-300">
                          {dir === "rtl" ? "التخصص" : "Specialty"}
                        </Label>
                        <Select
                          value={signupData.specialty}
                          onValueChange={(v) =>
                            setSignupData({ ...signupData, specialty: v })
                          }
                        >
                          <SelectTrigger id="signupSpecialty" data-testid="select-signup-specialty" className="bg-[#0F172A]/60 border-[#334155] text-white">
                            <SelectValue
                              placeholder={dir === "rtl" ? "اختر التخصص" : "Choose specialty"}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1E293B] border-[#334155]">
                            {specialties.map((s) => (
                              <SelectItem key={s} value={s} className="text-white focus:bg-[#10B981]/10 focus:text-[#10B981]">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupLocation" className="text-gray-300">
                          {dir === "rtl" ? "الموقع" : "Location"}
                        </Label>
                        <Select
                          value={signupData.location}
                          onValueChange={(v) =>
                            setSignupData({ ...signupData, location: v })
                          }
                        >
                          <SelectTrigger id="signupLocation" data-testid="select-signup-location" className="bg-[#0F172A]/60 border-[#334155] text-white">
                            <SelectValue
                              placeholder={dir === "rtl" ? "اختر الموقع" : "Choose location"}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1E293B] border-[#334155]">
                            {locations.map((l) => (
                              <SelectItem key={l} value={l} className="text-white focus:bg-[#10B981]/10 focus:text-[#10B981]">
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupExperience" className="text-gray-300">
                          {dir === "rtl" ? "سنوات الخبرة" : "Years of Experience"}
                        </Label>
                        <Input
                          id="signupExperience"
                          type="number"
                          min="0"
                          value={signupData.experience}
                          onChange={(e) =>
                            setSignupData({ ...signupData, experience: e.target.value })
                          }
                          data-testid="input-signup-experience"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupLicense" className="text-gray-300">
                          {dir === "rtl" ? "رقم الترخيص الطبي" : "Medical License Number"}
                        </Label>
                        <Input
                          id="signupLicense"
                          value={signupData.license}
                          onChange={(e) =>
                            setSignupData({ ...signupData, license: e.target.value })
                          }
                          data-testid="input-signup-license"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#10B981] focus:ring-[#10B981]/20"
                        />
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse mt-2 pt-2">
                        <Checkbox
                          id="signupTerms"
                          checked={signupData.agreeTerms}
                          onCheckedChange={(checked) =>
                            setSignupData({ ...signupData, agreeTerms: checked as boolean })
                          }
                          data-testid="checkbox-signup-terms"
                        />
                        <Label
                          htmlFor="signupTerms"
                          className="text-sm font-normal text-gray-400 cursor-pointer"
                        >
                          {dir === "rtl"
                            ? "أوافق على شروط الخدمة وسياسة الخصوصية"
                            : "I agree to the Terms of Service and Privacy Policy"}
                        </Label>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-1/3 border-[#334155] text-gray-400 hover:bg-[#334155] hover:text-white"
                          onClick={() => setSignupStep(1)}
                          data-testid="button-signup-back"
                        >
                          {dir === "rtl" ? "السابق" : "Back"}
                        </Button>
                        <Button
                          type="submit"
                          className="w-2/3 bg-[#10B981] text-[#0F172A] hover:bg-[#10B981]/90 font-semibold shadow-lg shadow-[#10B981]/20"
                          disabled={
                            !signupData.specialty ||
                            !signupData.location ||
                            !signupData.experience ||
                            !signupData.license ||
                            !signupData.agreeTerms
                          }
                          data-testid="button-signup-submit"
                        >
                          {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
                        </Button>
                      </div>
                    </form>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
