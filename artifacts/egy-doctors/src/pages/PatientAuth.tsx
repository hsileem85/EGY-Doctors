import { useState } from "react";
import { Link } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2, Heart, Shield, CalendarDays } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientAuth() {
  const { t, dir } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      signupData.fullName &&
      signupData.email &&
      signupData.phone &&
      signupData.password &&
      signupData.password === signupData.confirmPassword
    ) {
      setIsSuccess(true);
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
              {dir === "rtl" ? "تم تسجيل الدخول بنجاح!" : "Login Successful!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {dir === "rtl"
                ? "مرحباً بك في EGY Doctors. تم إنشاء ملفك الطبي الإلكتروني. يمكنك الآن متابعة مواعيدك وتاريخك الصحي."
                : "Welcome to EGY Doctors. Your Electronic Medical Record has been created. You can now track appointments and your health history."}
            </p>
            <Link href="/patient/dashboard">
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold">
                {dir === "rtl" ? "الذهاب إلى لوحة التحكم" : "Go to Dashboard"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-xs text-[#D4A853] tracking-wider">{dir === "rtl" ? "إجي دكتورز" : "EGY Doctors"}</p>
            </div>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {dir === "rtl"
              ? "إدارة صحتك بسهولة"
              : "Manage Your Health Easily"}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {dir === "rtl"
              ? "أنشئ ملفك الطبي الإلكتروني وتتبع أحدث تاريخك الصحي، الأدوية، والمواعيد في مكان واحد."
              : "Create your Electronic Medical Record and track your health history, medications, and appointments in one place."}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <Shield className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "بياناتك آمنة ومشفرة" : "Your data is secure and encrypted"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <CalendarDays className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "احجز مواعيدك في ثواني" : "Book appointments in seconds"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 flex items-center justify-center border border-[#D4A853]/20">
                <Heart className="h-4 w-4 text-[#D4A853]" />
              </div>
              <span className="text-sm">
                {dir === "rtl" ? "تتبع الأدوية والتحاليل" : "Track medications and lab results"}
              </span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
          <Card className="w-full max-w-lg border-[#334155] bg-[#1E293B]/80 backdrop-blur-sm shadow-2xl shadow-black/40">
            <CardContent className="p-6 lg:p-8">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-[#D4A853]" />
                </div>
                <span className="text-xl font-bold text-white font-brand">EGY Doctors</span>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0F172A]/60 border border-[#334155] p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold text-gray-400">
                    {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white">
                        {dir === "rtl" ? "تسجيل دخول المريض" : "Patient Login"}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {dir === "rtl"
                          ? "سجل دخولك لحجز المواعيد وإدارة تاريخك الصحي."
                          : "Sign in to book appointments and manage your health history."}
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
                        placeholder={dir === "rtl" ? "patient@example.com" : "patient@example.com"}
                        data-testid="input-patient-login-email"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
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
                          data-testid="input-patient-login-password"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-[#D4A853] transition-colors"
                          data-testid="button-patient-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20" data-testid="button-patient-login">
                      {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white">
                        {dir === "rtl" ? "إنشاء حساب مريض" : "Patient Sign Up"}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {dir === "rtl"
                          ? "أنشئ حسابك الآن وابدأ في الحجز مع أفضل الأطباء."
                          : "Create your account now and start booking with top doctors."}
                      </p>
                    </div>

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
                        data-testid="input-patient-signup-fullname"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
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
                        data-testid="input-patient-signup-email"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
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
                        data-testid="input-patient-signup-phone"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupNationalId" className="text-gray-300">
                        {dir === "rtl" ? "الرقم القومي (اختياري)" : "National ID (Optional)"}
                      </Label>
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
                        placeholder={dir === "rtl" ? "14 رقم" : "14 digits"}
                        data-testid="input-patient-signup-nationalid"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                      <p className="text-xs text-gray-500">
                        {dir === "rtl"
                          ? "يُستخدم لإنشاء ملفك الطبي الإلكتروني (EMR) لاحقاً."
                          : "Used later to create your Electronic Medical Record (EMR)."}
                      </p>
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
                          data-testid="input-patient-signup-password"
                          className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-[#D4A853] transition-colors"
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
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({ ...signupData, confirmPassword: e.target.value })
                        }
                        data-testid="input-patient-signup-confirm"
                        className="bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90 font-semibold shadow-lg shadow-[#D4A853]/20" data-testid="button-patient-signup">
                      {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-xs text-gray-500">
                {dir === "rtl"
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
