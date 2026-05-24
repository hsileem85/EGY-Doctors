import { useState } from "react";
import { Link } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { specialties, locations } from "@/lib/data";

export default function DoctorAuth() {
  const { t, dir } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      signupData.fullName &&
      signupData.email &&
      signupData.phone &&
      signupData.password &&
      signupData.password === signupData.confirmPassword &&
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {dir === "rtl" ? "تم تسجيل الدخول بنجاح!" : "Login Successful!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {dir === "rtl"
                ? "مرحباً بعودتك. ستتم إعادة توجيهك إلى لوحة التحكم."
                : "Welcome back. You will be redirected to your dashboard."}
            </p>
            <Link href="/dashboard">
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
                    {dir === "rtl" ? "تسجيل دخول الطبيب" : "Doctor Login"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {dir === "rtl"
                      ? "سجل دخولك لإدارة عيادتك والمواعيد."
                      : "Sign in to manage your clinic and appointments."}
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
                    placeholder={dir === "rtl" ? "doctor@example.com" : "doctor@example.com"}
                    data-testid="input-login-email"
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
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
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

                <Button type="submit" className="w-full" data-testid="button-login">
                  {dir === "rtl" ? "تسجيل الدخول" : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {dir === "rtl" ? "إنشاء حساب طبيب" : "Doctor Sign Up"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {dir === "rtl"
                      ? "أنشئ حسابك وابدأ في استقبال المواعيد."
                      : "Create your account and start receiving appointments."}
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
                    data-testid="input-signup-fullname"
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
                    data-testid="input-signup-email"
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
                    data-testid="input-signup-phone"
                  />
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
                      data-testid="input-signup-password"
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
                    data-testid="input-signup-confirm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupSpecialty">
                    {dir === "rtl" ? "التخصص" : "Specialty"}
                  </Label>
                  <Select
                    value={signupData.specialty}
                    onValueChange={(v) =>
                      setSignupData({ ...signupData, specialty: v })
                    }
                  >
                    <SelectTrigger id="signupSpecialty" data-testid="select-signup-specialty">
                      <SelectValue placeholder={dir === "rtl" ? "اختر التخصص" : "Choose specialty"} />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupLocation">
                    {dir === "rtl" ? "الموقع" : "Location"}
                  </Label>
                  <Select
                    value={signupData.location}
                    onValueChange={(v) =>
                      setSignupData({ ...signupData, location: v })
                    }
                  >
                    <SelectTrigger id="signupLocation" data-testid="select-signup-location">
                      <SelectValue placeholder={dir === "rtl" ? "اختر الموقع" : "Choose location"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupExperience">
                    {dir === "rtl" ? "سنوات الخبرة" : "Years of Experience"}
                  </Label>
                  <Input
                    id="signupExperience"
                    type="number"
                    value={signupData.experience}
                    onChange={(e) =>
                      setSignupData({ ...signupData, experience: e.target.value })
                    }
                    data-testid="input-signup-experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupLicense">
                    {dir === "rtl" ? "رقم الترخيص الطبي" : "Medical License Number"}
                  </Label>
                  <Input
                    id="signupLicense"
                    value={signupData.license}
                    onChange={(e) =>
                      setSignupData({ ...signupData, license: e.target.value })
                    }
                    data-testid="input-signup-license"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="signupTerms"
                    checked={signupData.agreeTerms}
                    onCheckedChange={(checked) =>
                      setSignupData({ ...signupData, agreeTerms: checked as boolean })
                    }
                    data-testid="checkbox-signup-terms"
                  />
                  <Label htmlFor="signupTerms" className="text-sm text-gray-600 leading-tight cursor-pointer">
                    {dir === "rtl"
                      ? "أوافق على شروط الخدمة وسياسة الخصوصية"
                      : "I agree to the Terms of Service and Privacy Policy"}
                  </Label>
                </div>

                <Button type="submit" className="w-full" data-testid="button-signup">
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
