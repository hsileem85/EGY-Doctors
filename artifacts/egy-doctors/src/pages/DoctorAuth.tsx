import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2 } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {dir === "rtl" ? "تم التسجيل بنجاح!" : "Registration Successful!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {dir === "rtl"
                ? "تم إنشاء حسابك. يرجى إكمال ملفك الشخصي للبدء في استقبال المواعيد."
                : "Your account has been created. Please complete your profile to start accepting appointments."}
            </p>
            <Button
              className="w-full"
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-gray-900 tracking-tight font-brand">
          {dir === "rtl" ? "إجي دكتورز" : "EGY Doctors"}
        </span>
      </Link>

      <Card className="w-full max-w-lg shadow-lg">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="text-center pb-0 pt-6 px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                {dir === "rtl" ? "تسجيل الدخول" : "Login"}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {dir === "rtl" ? "إنشاء حساب" : "Sign Up"}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
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
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            {/* Sign Up Tab with 2-step wizard */}
            <TabsContent value="signup">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {dir === "rtl" ? "إنشاء حساب طبيب" : "Doctor Sign Up"}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {dir === "rtl"
                    ? `الخطوة ${signupStep} من 2: ${signupStep === 1 ? "بيانات الحساب" : "المعلومات المهنية"}`
                    : `Step ${signupStep} of 2: ${signupStep === 1 ? "Account Details" : "Professional Info"}`}
                </p>
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
                        className="pe-10"
                        data-testid="input-signup-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      type={showPassword ? "text" : "password"}
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({ ...signupData, confirmPassword: e.target.value })
                      }
                      data-testid="input-signup-confirm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2"
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
                        <SelectValue
                          placeholder={dir === "rtl" ? "اختر التخصص" : "Choose specialty"}
                        />
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
                        <SelectValue
                          placeholder={dir === "rtl" ? "اختر الموقع" : "Choose location"}
                        />
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
                      min="0"
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
                      className="text-sm font-normal text-gray-600 cursor-pointer"
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
                      className="w-1/3"
                      onClick={() => setSignupStep(1)}
                      data-testid="button-signup-back"
                    >
                      {dir === "rtl" ? "السابق" : "Back"}
                    </Button>
                    <Button
                      type="submit"
                      className="w-2/3"
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
  );
}
