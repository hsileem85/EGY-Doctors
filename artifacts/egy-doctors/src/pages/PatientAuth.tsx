import { useState } from "react";
import { Link } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2 } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#D4A853]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#D4A853]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {dir === "rtl" ? "تم تسجيل الدخول بنجاح!" : "Login Successful!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {dir === "rtl"
                ? "مرحباً بك في EGY Doctors. تم إنشاء ملفك الطبي الإلكتروني. يمكنك الآن متابعة مواعيدك وتاريخك الصحي."
                : "Welcome to EGY Doctors. Your Electronic Medical Record has been created. You can now track appointments and your health history."}
            </p>
            <Link href="/patient/dashboard">
              <Button className="w-full">
                {dir === "rtl" ? "الذهاب إلى لوحة التحكم" : "Go to Dashboard"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-gray-900 tracking-tight font-brand">
          {dir === "rtl" ? "إجي دكتورز" : "EGY Doctors"}
        </span>
      </Link>

      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">
                {dir === "rtl" ? "تسجيل الدخول" : "Login"}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {dir === "rtl" ? "تسجيل دخول المريض" : "Patient Login"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {dir === "rtl"
                      ? "سجل دخولك لحجز المواعيد وإدارة تاريخك الصحي."
                      : "Sign in to book appointments and manage your health history."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginEmail">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
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

                <Button type="submit" className="w-full" data-testid="button-patient-login">
                  {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {dir === "rtl" ? "إنشاء حساب مريض" : "Patient Sign Up"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {dir === "rtl"
                      ? "أنشئ حسابك الآن وابدأ في الحجز مع أفضل الأطباء."
                      : "Create your account now and start booking with top doctors."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupName">
                    {dir === "rtl" ? "الاسم الكامل" : "Full Name"}
                  </Label>
                  <Input
                    id="signupName"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    data-testid="input-patient-signup-fullname"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPhone">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupNationalId">
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
                  />
                  <p className="text-xs text-gray-400">
                    {dir === "rtl"
                      ? "يُستخدم لإنشاء ملفك الطبي الإلكتروني (EMR) لاحقاً."
                      : "Used later to create your Electronic Medical Record (EMR)."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
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
                  <Label htmlFor="signupConfirmPassword">
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
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="button-patient-signup">
                  {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
