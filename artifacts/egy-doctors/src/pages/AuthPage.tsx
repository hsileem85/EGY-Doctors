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
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getSpecialties, getCities, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from "@/lib/api";
import { PhoneInput, buildPhone } from "@/components/ui/PhoneInput";

type UserType = "patient" | "doctor" | "medical";
type MedicalSubtype = "hospital" | "clinic" | "polyclinic" | "lab" | "scan";

export default function AuthPage() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [userType, setUserType] = useState<UserType>("doctor");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<"phone" | "reset" | "done">("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotCountryCode, setForgotCountryCode] = useState("+20");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [loginCountryCode, setLoginCountryCode] = useState("+20");
  const [signupCountryCode, setSignupCountryCode] = useState("+20");

  const [loginData, setLoginData] = useState({ phone: "", password: "" });

  const [signupData, setSignupData] = useState({
    fullName: "",
    fullNameAr: "",
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

  const { data: apiSpecialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  });

  const { data: apiCities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") setActiveTab("signup");
    const typeParam = params.get("type");
    if (typeParam === "doctor" || typeParam === "medical" || typeParam === "patient") {
      setUserType(typeParam as UserType);
    }
  }, []);

  const getRedirectFromRole = (role: string, isNewSignup: boolean) => {
    if (role === "patient") return "/";
    if (role === "doctor") return isNewSignup ? "/profile-setup" : "/dashboard";
    if (role === "medical_center") return isNewSignup ? "/medical-center/profile-setup" : "/medical-center/dashboard";
    return "/";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn(buildPhone(loginCountryCode, loginData.phone), loginData.password);
      const path = getRedirectFromRole(result.user.role, false);
      if (result.user.role === "patient") {
        setLocation(path);
      } else {
        setRedirectPath(path);
        setIsSuccess(true);
      }
    } catch {
      setError(isRTL ? "رقم الهاتف أو كلمة المرور غير صحيحة" : "Invalid phone or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signupData.password !== signupData.confirmPassword) {
      setError(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    setIsLoading(true);
    const selectedSpecialty = apiSpecialties.find(s => s.name === signupData.specialty);
    const selectedCity = apiCities.find(c => c.name === signupData.location);

    try {
      const result = await signUp({
        name: signupData.fullName,
        nameAr: signupData.fullNameAr || undefined,
        email: signupData.email,
        phone: buildPhone(signupCountryCode, signupData.phone),
        password: signupData.password,
        role: userType === "medical" ? "medical_center" : userType,
        nationalId: signupData.nationalId || undefined,
        syndicateNumber: signupData.syndicateMembership || undefined,
        specialtyId: userType === "doctor" ? selectedSpecialty?.id : undefined,
        cityId: selectedCity?.id,
      });
      const path = getRedirectFromRole(result.user.role, true);
      if (result.user.role === "patient") {
        setLocation(path);
      } else {
        setRedirectPath(path);
        setIsSuccess(true);
      }
    } catch {
      setError(isRTL ? "حدث خطأ. يرجى المحاولة مجدداً." : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await apiForgotPassword(buildPhone(forgotCountryCode, forgotPhone));
      setMaskedEmail(res.maskedEmail ?? "");
      setResetToken("");
      setForgotStep("reset");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("No email")) {
        setForgotError(isRTL ? "لا يوجد بريد إلكتروني مرتبط بهذا الحساب. تواصل مع الدعم." : "No email on file for this account. Please contact support.");
      } else {
        setForgotError(isRTL ? "رقم الهاتف غير موجود" : "Phone number not found");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      await apiResetPassword(resetToken, newPassword);
      setForgotStep("done");
    } catch {
      setForgotError(isRTL ? "الرمز غير صحيح أو انتهت صلاحيته" : "Invalid or expired token");
    } finally {
      setForgotLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A853]/10 rounded-full blur-[120px]" />
        <Card className="w-full max-w-md text-center py-10 border-[#D4A853]/20 bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl relative z-10">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-[#D4A853]/20 rounded-full flex items-center justify-center mb-2 border border-[#D4A853]/30">
              <CheckCircle2 className="w-10 h-10 text-[#D4A853]" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isRTL ? "تم بنجاح!" : "Success!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {isRTL
                ? "مرحباً بك في EGY Doctors. سيتم إعادة التوجيه إلى لوحة التحكم."
                : "Welcome to EGY Doctors. You will be redirected to your dashboard."}
            </p>
            <Button
              className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold"
              onClick={() => setLocation(redirectPath)}
            >
              {isRTL ? "الذهاب إلى لوحة التحكم" : "Go to Dashboard"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tl = {
    signIn: isRTL ? "تسجيل الدخول" : "Sign In",
    signUp: isRTL ? "إنشاء حساب" : "Sign Up",
    whoAreYou: isRTL ? "من أنت؟" : "Who are you?",
    patient: isRTL ? "مستخدم" : "User",
    doctor: isRTL ? "طبيب" : "Doctor",
    medical: isRTL ? "مركز طبي" : "Medical Center",
    email: isRTL ? "البريد الإلكتروني" : "Email",
    password: isRTL ? "كلمة المرور" : "Password",
    fullName: isRTL ? "الاسم بالإنجليزية" : "English Name",
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

  const TypeButton = ({ type, icon: Icon, label }: { type: UserType; icon: typeof User; label: string }) => (
    <button
      type="button"
      onClick={() => setUserType(type)}
      className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-lg border text-xs font-medium transition-all ${
        userType === type
          ? "border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-sm shadow-[#D4A853]/10"
          : "border-[#334155] text-gray-400 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="leading-tight text-center">{label}</span>
    </button>
  );

  const medicalSubtypeLabels = lang === "ar"
    ? { hospital: "مستشفى", clinic: "عيادة", polyclinic: "عيادة متعددة", lab: "معمل", scan: "مركز أشعة" }
    : { hospital: "Hospital", clinic: "Clinic", polyclinic: "Poly Clinic", lab: "Lab", scan: "Scan Center" };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A853]/10 rounded-full blur-[120px]" />
        <Card className="w-full max-w-md border-[#334155] bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl relative z-10">
          <CardContent className="p-8">
            <button
              onClick={() => { setShowForgot(false); setForgotStep("phone"); setForgotError(null); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#D4A853] mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {isRTL ? "العودة" : "Back"}
            </button>

            {forgotStep === "phone" && (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">{isRTL ? "نسيت كلمة المرور" : "Forgot Password"}</h2>
                <p className="text-sm text-gray-400 mb-4">{isRTL ? "أدخل رقم هاتفك وسنرسل رمز إعادة التعيين." : "Enter your phone number and we'll send you a reset code."}</p>
                <div className="space-y-2">
                  <Label className="text-gray-300">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
                  <PhoneInput
                    countryCode={forgotCountryCode}
                    onCountryCodeChange={setForgotCountryCode}
                    phone={forgotPhone}
                    onPhoneChange={setForgotPhone}
                    placeholder="1234567890"
                  />
                </div>
                {forgotError && <p className="text-red-400 text-sm">{forgotError}</p>}
                <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] font-semibold" disabled={forgotLoading}>
                  {forgotLoading ? (isRTL ? "جاري الإرسال..." : "Sending...") : (isRTL ? "إرسال الرمز" : "Send Code")}
                </Button>
              </form>
            )}

            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">{isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}</h2>

                {/* Email sent banner */}
                <div className="flex items-start gap-3 bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-xl px-4 py-3">
                  <div className="w-5 h-5 rounded-full bg-[#D4A853]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#D4A853]" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {isRTL
                      ? <>تم إرسال رمز التحقق إلى <span className="text-[#D4A853] font-semibold">{maskedEmail}</span>. يرجى التحقق من بريدك الإلكتروني.</>
                      : <>Reset code sent to <span className="text-[#D4A853] font-semibold">{maskedEmail}</span>. Check your inbox (and spam folder).</>
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">{isRTL ? "رمز التحقق" : "Reset Code"}</Label>
                  <Input
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value.toUpperCase().trim())}
                    className="bg-[#0F172A]/60 border-[#334155] text-white focus:border-[#D4A853] font-mono tracking-widest text-center text-lg uppercase"
                    placeholder="A1B2C3"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">{isRTL ? "كلمة المرور الجديدة" : "New Password"}</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-[#0F172A]/60 border-[#334155] text-white focus:border-[#D4A853]"
                    required
                    minLength={8}
                  />
                </div>
                {forgotError && <p className="text-red-400 text-sm">{forgotError}</p>}
                <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] font-semibold" disabled={forgotLoading}>
                  {forgotLoading ? (isRTL ? "جاري التغيير..." : "Resetting...") : (isRTL ? "تغيير كلمة المرور" : "Reset Password")}
                </Button>
              </form>
            )}

            {forgotStep === "done" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#D4A853]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#D4A853]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{isRTL ? "تم تغيير كلمة المرور!" : "Password Reset!"}</h2>
                <p className="text-gray-400 mb-6">{isRTL ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." : "You can now sign in with your new password."}</p>
                <Button className="w-full bg-[#D4A853] text-[#0F172A] font-semibold" onClick={() => { setShowForgot(false); setForgotStep("phone"); }}>
                  {isRTL ? "تسجيل الدخول" : "Sign In"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-stretch justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#D4A853]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#D4A853]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E293B]/30 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-auto">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-start pt-16 p-12">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-[#D4A853]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight font-brand">EGY Doctors</span>
              <p className="text-xs text-[#D4A853] tracking-wider">{isRTL ? "إي جي دكتورز" : "EGY Doctors"}</p>
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
              <span className="text-sm">{tl.secure}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <Heart className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">{tl.trust}</span>
            </div>
          </div>

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

              <div className="hidden lg:flex items-center mb-4">
                <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#D4A853] transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{isRTL ? "العودة للرئيسية" : "Back to Home"}</span>
                </Link>
              </div>

              <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setError(null); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0F172A]/60 border border-[#334155] p-1">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {tl.signIn}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {tl.signUp}
                  </TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-white text-start">{tl.signInTitle}</h2>
                      <p className="text-sm text-gray-400 mt-1 text-start">{tl.signInSubtitle}</p>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-300 mb-3">{tl.whoAreYou}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <TypeButton type="patient" icon={User} label={tl.patient} />
                        <TypeButton type="doctor" icon={Stethoscope} label={tl.doctor} />
                        <TypeButton type="medical" icon={Building2} label={tl.medical} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPhone" className="text-gray-300">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
                      <PhoneInput
                        id="loginPhone"
                        countryCode={loginCountryCode}
                        onCountryCodeChange={setLoginCountryCode}
                        phone={loginData.phone}
                        onPhoneChange={(v) => setLoginData({ ...loginData, phone: v })}
                        placeholder="1234567890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="text-gray-300">{tl.password}</Label>
                      <div className="relative">
                        <Input
                          id="loginPassword"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                          required
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
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-sm text-[#D4A853] hover:text-[#D4A853]/80 hover:underline transition-colors"
                      >
                        {tl.forgotPassword}
                      </button>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (isRTL ? "جاري الدخول..." : "Signing in...") : tl.loginBtn}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-white text-start">{tl.signUpTitle}</h2>
                      <p className="text-sm text-gray-400 mt-1 text-start">{tl.signUpSubtitle}</p>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-300 mb-3">{tl.whoAreYou}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <TypeButton type="patient" icon={User} label={tl.patient} />
                        <TypeButton type="doctor" icon={Stethoscope} label={tl.doctor} />
                        <TypeButton type="medical" icon={Building2} label={tl.medical} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupName" className="text-gray-300">
                        {userType === "medical" ? tl.centerName : tl.fullName}
                      </Label>
                      <Input
                        id="signupName"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupNameAr" className="text-gray-300">
                        {isRTL ? "الاسم باللغة العربية" : "Arabic Name"}
                      </Label>
                      <Input
                        id="signupNameAr"
                        dir="rtl"
                        placeholder="د. محمد أحمد"
                        value={signupData.fullNameAr}
                        onChange={(e) => setSignupData({ ...signupData, fullNameAr: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupEmail" className="text-gray-300">{tl.email}</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupPhone" className="text-gray-300">{tl.phone}</Label>
                      <PhoneInput
                        id="signupPhone"
                        countryCode={signupCountryCode}
                        onCountryCodeChange={setSignupCountryCode}
                        phone={signupData.phone}
                        onPhoneChange={(v) => setSignupData({ ...signupData, phone: v })}
                        placeholder="1234567890"
                      />
                    </div>

                    {userType === "patient" && (
                      <div className="space-y-2">
                        <Label htmlFor="signupNationalId" className="text-gray-300">{tl.nationalId}</Label>
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
                        <p className="text-xs text-gray-500">{tl.emrHint}</p>
                      </div>
                    )}

                    {userType === "doctor" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-gray-300">{tl.specialty}</Label>
                          <Select value={signupData.specialty} onValueChange={(v) => setSignupData({ ...signupData, specialty: v })}>
                            <SelectTrigger className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر التخصص" : "Choose specialty"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {apiSpecialties.map((s) => (
                                <SelectItem key={s.id} value={s.name} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">{tl.syndicateMembership}</Label>
                          <Input
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
                          <Label className="text-gray-300">{tl.centerType}</Label>
                          <Select
                            value={signupData.medicalSubtype}
                            onValueChange={(v) => setSignupData({ ...signupData, medicalSubtype: v as MedicalSubtype })}
                          >
                            <SelectTrigger className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر نوع المركز" : "Choose center type"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {(Object.keys(medicalSubtypeLabels) as MedicalSubtype[]).map((k) => (
                                <SelectItem key={k} value={k} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">
                                  {medicalSubtypeLabels[k]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">{tl.location}</Label>
                          <Select value={signupData.location} onValueChange={(v) => setSignupData({ ...signupData, location: v })}>
                            <SelectTrigger className="bg-[#0F172A]/60 border-[#334155] text-white">
                              <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choose location"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E293B] border-[#334155]">
                              {apiCities.map((c) => (
                                <SelectItem key={c.id} value={c.name} className="text-white focus:bg-[#D4A853]/10 focus:text-[#D4A853]">
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="text-gray-300">{tl.password}</Label>
                      <div className="relative">
                        <Input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                          required
                          minLength={8}
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
                      <Label htmlFor="signupConfirm" className="text-gray-300">{tl.confirmPassword}</Label>
                      <Input
                        id="signupConfirm"
                        type={showPassword ? "text" : "password"}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (isRTL ? "جاري الإنشاء..." : "Creating...") : tl.signupBtn}
                    </Button>

                    <p className="text-center text-xs text-gray-500 mt-2">
                      {isRTL
                        ? "بالتسجيل، أنت توافق على الشروط وسياسة الخصوصية."
                        : "By signing up, you agree to our Terms and Privacy Policy."}
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
