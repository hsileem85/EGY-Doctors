import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2, Building2, User, Shield, Heart, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserType = "patient" | "doctor" | "medical";
type MedicalSubtype = "hospital" | "clinic" | "polyclinic" | "lab" | "scan";

const userTypeLabels = {
  en: { patient: "Patient", doctor: "Doctor", medical: "Medical Center" },
  ar: { patient: "مريض", doctor: "طبيب", medical: "مركز طبي" },
};

const medicalSubtypeLabels = {
  en: { hospital: "Hospital", clinic: "Clinic", polyclinic: "Poly Clinic", lab: "Lab", scan: "Scan Center" },
  ar: { hospital: "مستشفى", clinic: "عيادة", polyclinic: "عيادة متعددة", lab: "معمل", scan: "مركز أشعة" },
};

export default function AuthPage() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const [userType, setUserType] = useState<UserType>("patient");

  const [loginData, setLoginData] = useState({ phone: "", password: "" });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    specialty: "",
    location: "",
    medicalSubtype: "" as MedicalSubtype | "",
    syndicateMembership: "",
    password: "",
    confirmPassword: "",
  });

  // Read tab and type from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") {
      setActiveTab("signup");
    }
    const typeParam = params.get("type");
    if (typeParam === "doctor" || typeParam === "medical" || typeParam === "patient") {
      setUserType(typeParam);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const getRedirect = () => {
    if (activeTab === "signin") {
      if (userType === "patient") return "/patient/dashboard";
      if (userType === "doctor") return "/dashboard";
      if (userType === "medical") return "/medical-center/dashboard";
    } else {
      if (userType === "patient") return "/patient/dashboard";
      if (userType === "doctor") return "/profile-setup";
      if (userType === "medical") return "/medical-center/profile-setup";
    }
    return "/";
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A853]/10 rounded-full blur-[120px]" />

        <Card className="w-full max-w-md text-center py-10 border-[#D4A853]/20 bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl relative z-10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-[#D4A853]/20 rounded-full flex items-center justify-center mb-2 border border-[#D4A853]/30">
              <CheckCircle2 className="w-10 h-10 text-[#D4A853]" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isRTL ? "تم تسجيل الدخول بنجاح!" : "Login Successful!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {isRTL
                ? "مرحباً بك في EGY Doctors. ستم إعادة التوجيه إلى لوحة التحكم."
                : "Welcome to EGY Doctors. You will be redirected to your dashboard."}
            </p>
            <Link href={getRedirect()}>
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold">
                {isRTL ? "الذهاب إلى لوحة التحكم" : "Go to Dashboard"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = {
    signIn: isRTL ? "تسجيل الدخول" : "Sign In",
    signUp: isRTL ? "إنشاء حساب" : "Sign Up",
    whoAreYou: isRTL ? "من أنت؟" : "Who are you?",
    patient: isRTL ? "مريض" : "Patient",
    doctor: isRTL ? "طبيب" : "Doctor",
    medical: isRTL ? "مركز طبي" : "Medical Center",
    email: isRTL ? "البريد الإلكتروني" : "Email",
    password: isRTL ? "كلمة المرور" : "Password",
    fullName: isRTL ? "الاسم الكامل" : "Full Name",
    centerName: isRTL ? "اسم المركز" : "Center Name",
    phone: isRTL ? "رقم الهاتف" : "Phone",
    nationalId: isRTL ? "الرقم القومي (اختياري)" : "National ID (Optional)",
    specialty: isRTL ? "التخصص" : "Specialty",
    location: isRTL ? "الموقع" : "Location",
    syndicateMembership: isRTL ? "رقم عضوية النقابة الطبية" : "Medical Syndicate Membership Number",
    centerType: isRTL ? "نوع المركز" : "Center Type",
    confirmPassword: isRTL ? "تأكيد كلمة المرور" : "Confirm Password",
    loginBtn: isRTL ? "تسجيل الدخول" : "Sign In",
    signupBtn: isRTL ? "إنشاء حساب" : "Sign Up",
    forgotPassword: isRTL ? "هل نسيت كلمة المرور؟" : "Forgot password?",
    signInTitle: isRTL ? "تسجيل دخول" : "Sign In",
    signInSubtitle: isRTL ? "سجّل دخولك لحجز المواعيد وإدارة حسابك." : "Sign in to book appointments and manage your account.",
    signUpTitle: isRTL ? "إنشاء حساب" : "Sign Up",
    signUpSubtitle: isRTL ? "أنشئ حسابك الآن وابدأ في الحجز مع أفضل الأطباء." : "Create your account now and start booking with the best doctors.",
    emrHint: isRTL ? "يُستخدم لإنشاء ملفك الطبي الإلكتروني (EMR) لاحقاً." : "Used later to create your Electronic Medical Record (EMR).",
    trust: isRTL ? "موثوق من آلاف المرضى والأطباء" : "Trusted by thousands of patients and doctors",
    secure: isRTL ? "بياناتك آمنة ومشفرة" : "Your data is secure and encrypted",
  };

  const TypeButton = ({
    type,
    icon: Icon,
    label,
  }: {
    type: UserType;
    icon: typeof User;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setUserType(type)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
        userType === type
          ? "border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-sm shadow-[#D4A853]/10"
          : "border-[#334155] text-gray-400 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-stretch justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#D4A853]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#D4A853]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E293B]/30 rounded-full blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-auto">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-center p-12">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-[#D4A853]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight font-brand">EGY Doctors</span>
              <p className="text-xs text-[#D4A853] tracking-wider">{isRTL ? "إجي دكتورز" : "EGY Doctors"}</p>
            </div>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {isRTL
              ? "ابحث عن طبيبك واحجز موعدك بسهولة"
              : "Find Your Doctor and Book Instantly"}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {isRTL
              ? "منصة EGY Doctors تربطك بأفضل الأطباء في مصر. احجز موعدك الآن مع أخصائيين موثوقين."
              : "EGY Doctors connects you with top-rated doctors across Egypt. Book appointments with verified specialists in minutes."}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <Shield className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">{t.secure}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <Heart className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">{t.trust}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-[#334155]">
            <div>
              <div className="text-2xl font-bold text-[#D4A853]">2,500+</div>
              <div className="text-xs text-gray-500">{isRTL ? "طبيب موثق" : "Verified Doctors"}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#D4A853]">150K+</div>
              <div className="text-xs text-gray-500">{isRTL ? "حجز شهرياً" : "Monthly Bookings"}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#D4A853]">4.9</div>
              <div className="text-xs text-gray-500">{isRTL ? "متوسط التقييم" : "Avg. Rating"}</div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
          <Card className="w-full max-w-lg border-[#334155] bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl shadow-black/40">
            <CardContent className="p-6 lg:p-8">
              {/* Mobile logo + back */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <span className="text-xl font-bold text-white font-brand">EGY Doctors</span>
                </div>
                <Link href="/" className="text-gray-400 hover:text-[#D4A853] transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>

              {/* Desktop back button */}
              <div className="hidden lg:flex items-center mb-4">
                <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#D4A853] transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{isRTL ? "العودة للرئيسية" : "Back to Home"}</span>
                </Link>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0F172A]/60 border border-[#334155] p-1">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {t.signIn}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {t.signUp}
                  </TabsTrigger>
                </TabsList>

                {/* User Type Selector */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-300 mb-3">{t.whoAreYou}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <TypeButton type="patient" icon={User} label={t.patient} />
                    <TypeButton type="doctor" icon={Stethoscope} label={t.doctor} />
                    <TypeButton type="medical" icon={Building2} label={t.medical} />
                  </div>
                </div>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white text-start">{t.signInTitle}</h2>
                      <p className="text-sm text-gray-400 mt-1 text-start">{t.signInSubtitle}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPhone" className="text-gray-300">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
                      <Input
                        id="loginPhone"
                        type="tel"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="text-gray-300">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="loginPassword"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-[#D4A853] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link href="/" className="text-sm text-[#D4A853] hover:text-[#D4A853]/80 hover:underline transition-colors">
                        {t.forgotPassword}
                      </Link>
                    </div>

                    <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20">
                      {t.loginBtn}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white text-start">{t.signUpTitle}</h2>
                      <p className="text-sm text-gray-400 mt-1 text-start">{t.signUpSubtitle}</p>
                    </div>

                    {/* Common fields */}
                    <div className="space-y-2">
                      <Label htmlFor="signupName" className="text-gray-300">
                        {userType === "medical" ? t.centerName : t.fullName}
                      </Label>
                      <Input
                        id="signupName"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupEmail" className="text-gray-300">{t.email}</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupPhone" className="text-gray-300">{t.phone}</Label>
                      <Input
                        id="signupPhone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    {/* Type-specific fields */}
                    {userType === "patient" && (
                      <div className="space-y-2">
                        <Label htmlFor="signupNationalId" className="text-gray-300">{t.nationalId}</Label>
                        <Input
                          id="signupNationalId"
                          type="text"
                          inputMode="numeric"
                          maxLength={14}
                          value={signupData.nationalId}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 14);
                            setSignupData({ ...signupData, nationalId: val });
                          }}
                          placeholder="14 digits"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        />
                        <p className="text-xs text-gray-500">{t.emrHint}</p>
                      </div>
                    )}

                    {userType === "doctor" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="signupSpecialty" className="text-gray-300">{t.specialty}</Label>
                          <Select
                            value={signupData.specialty}
                            onValueChange={(v) => setSignupData({ ...signupData, specialty: v })}
                          >
                            <SelectTrigger id="signupSpecialty" className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر التخصص" : "Choose specialty"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology", "Ophthalmology", "ENT", "Internal Medicine", "General Surgery"].map((s) => (
                                <SelectItem key={s} value={s} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signupLocation" className="text-gray-300">{t.location}</Label>
                          <Select
                            value={signupData.location}
                            onValueChange={(v) => setSignupData({ ...signupData, location: v })}
                          >
                            <SelectTrigger id="signupLocation" className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choose location"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Suez", "Port Said", "Luxor", "Aswan", "Sharm El Sheikh"].map((l) => (
                                <SelectItem key={l} value={l} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signupSyndicate" className="text-gray-300">{t.syndicateMembership}</Label>
                          <Input
                            id="signupSyndicate"
                            value={signupData.syndicateMembership}
                            onChange={(e) => setSignupData({ ...signupData, syndicateMembership: e.target.value })}
                            placeholder={isRTL ? "أدخل رقم عضوية النقابة" : "Enter syndicate membership number"}
                            className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                          />
                        </div>
                      </>
                    )}

                    {userType === "medical" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="signupMedicalType" className="text-gray-300">{t.centerType}</Label>
                          <Select
                            value={signupData.medicalSubtype}
                            onValueChange={(v) => setSignupData({ ...signupData, medicalSubtype: v as MedicalSubtype })}
                          >
                            <SelectTrigger id="signupMedicalType" className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر النوع" : "Choose type"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {(["hospital", "clinic", "polyclinic", "lab", "scan"] as MedicalSubtype[]).map((s) => (
                                <SelectItem key={s} value={s} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">
                                  {medicalSubtypeLabels[lang][s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signupMedicalLocation" className="text-gray-300">{t.location}</Label>
                          <Select
                            value={signupData.location}
                            onValueChange={(v) => setSignupData({ ...signupData, location: v })}
                          >
                            <SelectTrigger id="signupMedicalLocation" className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choose location"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Suez", "Port Said", "Luxor", "Aswan", "Sharm El Sheikh"].map((l) => (
                                <SelectItem key={l} value={l} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="text-gray-300">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-[#D4A853] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupConfirmPassword" className="text-gray-300">{t.confirmPassword}</Label>
                      <Input
                        id="signupConfirmPassword"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20">
                      {t.signupBtn}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Footer text */}
              <div className="mt-6 text-start text-xs text-gray-500">
                {isRTL
                  ? "بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية"
                  : "By signing up, you agree to our Terms of Service and Privacy Policy"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
