import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Stethoscope, Eye, EyeOff, CheckCircle2, Building2, User, Shield } from "lucide-react";
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

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    specialty: "",
    location: "",
    medicalSubtype: "" as MedicalSubtype | "",
    password: "",
    confirmPassword: "",
  });

  // Read tab from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") {
      setActiveTab("signup");
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRTL ? "تم تسجيل الدخول بنجاح!" : "Login Successful!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {isRTL
                ? "مرحباً بك في EGY Doctors. ستم إعادة التوجيه إلى لوحة التحكم."
                : "Welcome to EGY Doctors. You will be redirected to your dashboard."}
            </p>
            <Link href={getRedirect()}>
              <Button className="w-full">
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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
        userType === type
          ? "border-primary bg-primary/5 text-primary"
          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-gray-900 tracking-tight font-brand">
          {isRTL ? "إجي دكتورز" : "EGY Doctors"}
        </span>
      </Link>

      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
            </TabsList>

            {/* User Type Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">{t.whoAreYou}</p>
              <div className="grid grid-cols-3 gap-2">
                <TypeButton type="patient" icon={User} label={t.patient} />
                <TypeButton type="doctor" icon={Stethoscope} label={t.doctor} />
                <TypeButton type="medical" icon={Building2} label={t.medical} />
              </div>
            </div>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{t.signInTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.signInSubtitle}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginEmail">{t.email}</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/" className="text-sm text-primary hover:underline">
                    {t.forgotPassword}
                  </Link>
                </div>

                <Button type="submit" className="w-full">
                  {t.loginBtn}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{t.signUpTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.signUpSubtitle}</p>
                </div>

                {/* Common fields */}
                <div className="space-y-2">
                  <Label htmlFor="signupName">
                    {userType === "medical" ? t.centerName : t.fullName}
                  </Label>
                  <Input
                    id="signupName"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">{t.email}</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPhone">{t.phone}</Label>
                  <Input
                    id="signupPhone"
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  />
                </div>

                {/* Type-specific fields */}
                {userType === "patient" && (
                  <div className="space-y-2">
                    <Label htmlFor="signupNationalId">{t.nationalId}</Label>
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
                    />
                    <p className="text-xs text-gray-400">{t.emrHint}</p>
                  </div>
                )}

                {userType === "doctor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signupSpecialty">{t.specialty}</Label>
                      <Select
                        value={signupData.specialty}
                        onValueChange={(v) => setSignupData({ ...signupData, specialty: v })}
                      >
                        <SelectTrigger id="signupSpecialty">
                          <SelectValue placeholder={isRTL ? "اختر التخصص" : "Choose specialty"} />
                        </SelectTrigger>
                        <SelectContent>
                          {["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology", "Ophthalmology", "ENT", "Internal Medicine", "General Surgery"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupLocation">{t.location}</Label>
                      <Select
                        value={signupData.location}
                        onValueChange={(v) => setSignupData({ ...signupData, location: v })}
                      >
                        <SelectTrigger id="signupLocation">
                          <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choose location"} />
                        </SelectTrigger>
                        <SelectContent>
                          {["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Suez", "Port Said", "Luxor", "Aswan", "Sharm El Sheikh"].map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === "medical" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signupMedicalType">{t.centerType}</Label>
                      <Select
                        value={signupData.medicalSubtype}
                        onValueChange={(v) => setSignupData({ ...signupData, medicalSubtype: v as MedicalSubtype })}
                      >
                        <SelectTrigger id="signupMedicalType">
                          <SelectValue placeholder={isRTL ? "اختر النوع" : "Choose type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {(["hospital", "clinic", "polyclinic", "lab", "scan"] as MedicalSubtype[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {medicalSubtypeLabels[lang][s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupMedicalLocation">{t.location}</Label>
                      <Select
                        value={signupData.location}
                        onValueChange={(v) => setSignupData({ ...signupData, location: v })}
                      >
                        <SelectTrigger id="signupMedicalLocation">
                          <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choose location"} />
                        </SelectTrigger>
                        <SelectContent>
                          {["Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Suez", "Port Said", "Luxor", "Aswan", "Sharm El Sheikh"].map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupConfirmPassword">{t.confirmPassword}</Label>
                  <Input
                    id="signupConfirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {t.signupBtn}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
