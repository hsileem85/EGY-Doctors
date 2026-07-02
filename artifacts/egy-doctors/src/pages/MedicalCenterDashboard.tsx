import { useState, useEffect } from "react";
import {
  Building2, Users, CalendarDays, Stethoscope, TrendingUp, FileText,
  Settings, Plus, CreditCard, Newspaper, LogOut, BookOpen,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBillingInfo, startTrial, validateVoucher, initiatePaymobPayment,
  type BillingInfo, type VoucherValidation, type PlanType, type PaymobInitiateResponse,
} from "@/lib/api";

type CenterTab = "overview" | "billing" | "publications";

const center = {
  name: "Alfa Scan Radiology",
  type: "scan",
  location: "Cairo",
  doctors: 12,
  appointments: 48,
  patients: 320,
  services: ["MRI", "CT Scan", "X-Ray", "Ultrasound", "Mammography"],
};

const upcomingAppointments = [
  { id: 1, patient: "Amira Hassan",  service: "Chest X-Ray",       doctor: "Dr. Khaled Samir", date: "2026-05-28", time: "10:00", status: "confirmed" },
  { id: 2, patient: "Mohamed Ali",   service: "MRI Brain",          doctor: "Dr. Nadia Fathy",  date: "2026-05-28", time: "11:30", status: "pending"   },
  { id: 3, patient: "Samar Youssef", service: "Ultrasound Abdomen", doctor: "Dr. Khaled Samir", date: "2026-05-29", time: "09:00", status: "confirmed" },
];

const doctors = [
  { id: 1, name: "Dr. Khaled Samir", specialty: "Radiology", patients: 145 },
  { id: 2, name: "Dr. Nadia Fathy",  specialty: "Radiology", patients: 98  },
  { id: 3, name: "Dr. Omar Tarek",   specialty: "Radiology", patients: 112 },
];

const typeLabels = {
  en: { hospital: "Hospital", clinic: "Clinic", polyclinic: "Poly Clinic", lab: "Lab", scan: "Scan Center" },
  ar: { hospital: "مستشفى",  clinic: "عيادة",  polyclinic: "عيادة متعددة", lab: "معمل", scan: "مركز أشعة" },
};

/* ────────────────────────────────────────────────────────────────────
   Billing Tab — mirrors doctor BillingTab exactly
──────────────────────────────────────────────────────────────────── */
function BillingTab({ isRTL }: { isRTL: boolean }) {
  const qc = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherResult, setVoucherResult] = useState<VoucherValidation | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymobInitiateResponse | null>(null);
  const [paymentGatewayError, setPaymentGatewayError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"card" | "fawry" | "wallet">("card");

  const { data, isLoading } = useQuery<BillingInfo>({
    queryKey: ["billingInfo"],
    queryFn: getBillingInfo,
  });

  const trialMut = useMutation({
    mutationFn: startTrial,
    onSuccess: () => { setSuccess(true); void qc.invalidateQueries({ queryKey: ["billingInfo"] }); },
  });

  const initiateMut = useMutation({
    mutationFn: initiatePaymobPayment,
    onSuccess: (data) => { setPaymentGatewayError(""); setPaymentModal(data); },
    onError: (err: Error) => {
      setPaymentGatewayError(err.message || (isRTL ? "فشل بدء الدفع. حاول مرة أخرى." : "Failed to start payment. Please try again."));
    },
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const d = event.data as { type?: string; success?: boolean } | null;
      if (d?.type === "PAYMOB_RESULT") {
        setPaymentModal(null);
        if (d.success) {
          setSuccess(true);
          void qc.invalidateQueries({ queryKey: ["billingInfo"] });
        } else {
          setPaymentGatewayError(isRTL ? "لم يكتمل الدفع. يرجى المحاولة مرة أخرى." : "Payment was not completed. Please try again.");
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [qc, isRTL]);

  const status = data?.status ?? "INACTIVE";
  const currency = data?.currency ?? "EGP";

  const statusStyle: Record<string, string> = {
    ACTIVE:   "bg-green-50 text-green-700 border-green-200",
    TRIAL:    "bg-amber-50 text-amber-700 border-amber-200",
    INACTIVE: "bg-red-50 text-red-700 border-red-200",
  };
  const statusLabel: Record<string, string> = {
    ACTIVE:   isRTL ? "نشط"      : "Active",
    TRIAL:    isRTL ? "تجريبي"   : "Trial",
    INACTIVE: isRTL ? "غير نشط" : "Inactive",
  };

  const planCfg: Record<PlanType, { label: string; labelAr: string; price: number; months: number; badge?: string }> = {
    MONTHS_3: { label: "3 Months", labelAr: "3 أشهر",    price: data?.price3Months ?? 1200, months: 3  },
    MONTHS_6: { label: "6 Months", labelAr: "6 أشهر",    price: data?.price6Months ?? 2200, months: 6,  badge: isRTL ? "الأكثر شيوعاً" : "Most Popular" },
    YEARLY:   { label: "1 Year",   labelAr: "سنة كاملة", price: data?.price1Year   ?? 3800, months: 12, badge: isRTL ? "أفضل قيمة"     : "Best Value"   },
  };

  async function handleValidateVoucher() {
    if (!selectedPlan || !voucherInput.trim()) return;
    setIsValidating(true);
    setVoucherError("");
    setVoucherResult(null);
    try {
      const result = await validateVoucher(voucherInput.trim(), selectedPlan);
      setVoucherResult(result);
    } catch (err: unknown) {
      setVoucherError(err instanceof Error ? err.message : (isRTL ? "كود غير صالح أو منتهي" : "Invalid or expired promo code"));
    } finally {
      setIsValidating(false);
    }
  }

  function selectPlan(plan: PlanType) {
    setSelectedPlan(plan);
    setVoucherResult(null);
    setVoucherInput("");
    setVoucherError("");
    setSuccess(false);
  }

  const planLabel = (plan: string) => {
    if (plan === "MONTHS_3") return isRTL ? "3 أشهر"    : "3 Months";
    if (plan === "MONTHS_6") return isRTL ? "6 أشهر"    : "6 Months";
    if (plan === "YEARLY")   return isRTL ? "سنة كاملة" : "1 Year";
    if (plan === "TRIAL")    return isRTL ? "تجريبي"    : "Free Trial";
    return plan;
  };

  if (isLoading) return <div className="py-12 text-center text-gray-400 text-sm">{isRTL ? "جار التحميل..." : "Loading..."}</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "الاشتراك والفاتورة" : "Subscription & Billing"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isRTL ? "إدارة اشتراك مركزك في المنصة" : "Manage your center's platform subscription"}</p>
      </div>

      {/* Status bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? "الحالة" : "Status"}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle[status] ?? statusStyle.INACTIVE}`}>
                {statusLabel[status] ?? status}
              </span>
            </div>
            {data?.plan && data.plan !== "SEMI_ANNUAL" && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? "الخطة" : "Plan"}</p>
                <p className="text-sm font-semibold text-gray-800">{planLabel(data.plan)}</p>
              </div>
            )}
            {data?.endDate && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? "تاريخ الانتهاء" : "Expires"}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(data.endDate).toLocaleDateString(isRTL ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <span>✓</span>
          {isRTL ? "تم تفعيل اشتراكك بنجاح!" : "Subscription activated successfully!"}
        </div>
      )}

      {/* Free trial */}
      {!data?.isTrialUsed && status === "INACTIVE" && (
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-800">
                🎁 {isRTL
                  ? `جرّب المنصة مجاناً لمدة ${data?.trialDays ?? 14} يوم`
                  : `Start your ${data?.trialDays ?? 14}-Day Free Trial`}
              </p>
              <p className="text-sm text-amber-600 mt-0.5">
                {isRTL ? "بدون بطاقة ائتمان — وصول كامل لجميع الميزات." : "No credit card required — full access to all features."}
              </p>
            </div>
            <Button
              onClick={() => { setSuccess(false); trialMut.mutate(); }}
              disabled={trialMut.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shrink-0"
            >
              {trialMut.isPending ? (isRTL ? "جارٍ التفعيل..." : "Activating...") : (isRTL ? "ابدأ التجربة المجانية" : "Start Free Trial")}
            </Button>
          </div>
          {trialMut.isError && (
            <p className="text-red-600 text-sm mt-2">
              {trialMut.error instanceof Error ? trialMut.error.message : (isRTL ? "حدث خطأ" : "An error occurred")}
            </p>
          )}
        </div>
      )}

      {/* Pricing cards */}
      <h2 className="text-base font-bold text-gray-900 mb-3">{isRTL ? "اختر خطتك" : "Choose Your Plan"}</h2>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {(["MONTHS_3", "MONTHS_6", "YEARLY"] as PlanType[]).map((plan) => {
          const cfg = planCfg[plan];
          const isSelected = selectedPlan === plan;
          return (
            <button
              key={plan}
              type="button"
              onClick={() => selectPlan(plan)}
              className={`relative text-start rounded-xl border-2 p-5 transition-all ${
                isSelected ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {cfg.badge && (
                <span className="absolute -top-2.5 start-4 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {cfg.badge}
                </span>
              )}
              <p className="font-bold text-gray-900">{isRTL ? cfg.labelAr : cfg.label}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {cfg.price}
                <span className="text-sm font-normal text-gray-500 ms-1">{currency}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL
                  ? `≈ ${Math.round(cfg.price / cfg.months)} جنيه / شهر`
                  : `≈ ${Math.round(cfg.price / cfg.months)} ${currency}/mo`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Checkout panel */}
      {selectedPlan && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 rounded-t-xl pb-4">
            <CardTitle className="text-base">
              {isRTL ? "إتمام الاشتراك" : "Complete Subscription"}
              {" — "}
              {isRTL ? planCfg[selectedPlan].labelAr : planCfg[selectedPlan].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Voucher */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                {isRTL ? "كود الخصم (اختياري)" : "Promo Code (optional)"}
              </label>
              <div className="flex gap-2">
                <input
                  value={voucherInput}
                  onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherResult(null); setVoucherError(""); }}
                  placeholder={isRTL ? "أدخل كود الخصم" : "Enter promo code"}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button type="button" variant="outline" onClick={handleValidateVoucher}
                  disabled={isValidating || !voucherInput.trim()} className="shrink-0">
                  {isValidating ? "..." : (isRTL ? "تحقق" : "Apply")}
                </Button>
              </div>
              {voucherError && <p className="text-red-500 text-xs mt-1.5">{voucherError}</p>}
              {voucherResult && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                  ✓ {voucherResult.discountPercentage > 0 && `${voucherResult.discountPercentage}% ${isRTL ? "خصم" : "discount"}`}
                  {voucherResult.discountPercentage > 0 && voucherResult.additionalFreeDays > 0 && " + "}
                  {voucherResult.additionalFreeDays > 0 && `${voucherResult.additionalFreeDays} ${isRTL ? "يوم إضافي" : "bonus days"}`}
                  {isRTL ? " مُطبَّق" : " applied"}
                </div>
              )}
            </div>

            {/* Price summary */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">{isRTL ? "الإجمالي" : "Total"}</span>
              <div className="text-end">
                {voucherResult && voucherResult.discountPercentage > 0 && (
                  <span className="text-sm text-gray-400 line-through me-2">
                    {voucherResult.originalPrice} {currency}
                  </span>
                )}
                <span className="text-xl font-bold text-primary">
                  {voucherResult ? voucherResult.finalPrice : planCfg[selectedPlan].price}
                  <span className="text-sm font-normal text-gray-500 ms-1">{currency}</span>
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{isRTL ? "طريقة الدفع" : "Payment Method"}</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "card",   labelEn: "Card / Meeza",    labelAr: "بطاقة / ميزة",      icon: "💳" },
                  { id: "fawry",  labelEn: "Fawry",           labelAr: "فوري",               icon: "🏪" },
                  { id: "wallet", labelEn: "Mobile Wallet",   labelAr: "محفظة إلكترونية",   icon: "📱" },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      selectedMethod === m.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    {isRTL ? m.labelAr : m.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {paymentGatewayError && (
              <p className="text-red-500 text-sm">{paymentGatewayError}</p>
            )}

            <Button
              className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] font-semibold h-11"
              disabled={initiateMut.isPending}
              onClick={() => {
                setPaymentGatewayError("");
                initiateMut.mutate({
                  planType: selectedPlan,
                  voucherCode: voucherResult ? voucherInput : undefined,
                  paymentMethod: selectedMethod,
                });
              }}
            >
              {initiateMut.isPending
                ? (isRTL ? "جارٍ المعالجة..." : "Processing...")
                : (isRTL ? "الدفع الآن" : "Pay Now")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paymob iframe modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <p className="font-semibold text-gray-900">{isRTL ? "إتمام الدفع" : "Complete Payment"}</p>
              <button onClick={() => setPaymentModal(null)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
            </div>
            <iframe
              src={paymentModal.iframeUrl}
              className="w-full"
              style={{ height: 520, border: "none" }}
              title="Paymob Payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Publications Tab with paywall
──────────────────────────────────────────────────────────────────── */
function PublicationsPaywall({ isRTL, onGoToBilling }: { isRTL: boolean; onGoToBilling: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {isRTL ? "هذه الميزة للمشتركين فقط" : "Subscription Required"}
      </h2>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        {isRTL
          ? "اشترك في المنصة للوصول إلى المنشورات وبناء حضورك الرقمي."
          : "Subscribe to the platform to access publications and build your digital presence."}
      </p>
      <Button onClick={onGoToBilling} className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-2">
        <CreditCard className="h-4 w-4" />
        {isRTL ? "اشترك الآن" : "Subscribe Now"}
      </Button>
    </div>
  );
}

function CenterPublicationsTab({ isRTL }: { isRTL: boolean }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "المنشورات" : "Publications"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isRTL ? "مقالات وتحديثات مركزك الطبي" : "Articles and updates from your medical center"}</p>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
        <Newspaper className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-700 mb-1">{isRTL ? "لا توجد منشورات بعد" : "No publications yet"}</h3>
        <p className="text-sm text-gray-500 mb-4">{isRTL ? "أضف أول مقال لمركزك الطبي" : "Add your first article for your medical center"}</p>
        <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-2">
          <Plus className="h-4 w-4" />
          {isRTL ? "نشر مقال" : "New Article"}
        </Button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main Dashboard
──────────────────────────────────────────────────────────────────── */
export default function MedicalCenterDashboard() {
  const { dir, lang } = useLanguage();
  const { signOut } = useAuth();
  const isRTL = dir === "rtl";
  const [activeTab, setActiveTab] = useState<CenterTab>("overview");

  const { data: billingInfo } = useQuery<BillingInfo>({
    queryKey: ["billingInfo"],
    queryFn: getBillingInfo,
  });
  const isSubscribed = billingInfo?.status === "ACTIVE" || billingInfo?.status === "TRIAL";

  const t = {
    title:              isRTL ? "لوحة تحكم المركز الطبي" : "Medical Center Dashboard",
    welcome:            isRTL ? "مرحباً بك، هنا نظرة عامة على أداء مركزك." : "Welcome back. Here's an overview of your center.",
    doctors:            isRTL ? "الأطباء"          : "Doctors",
    appointments:       isRTL ? "المواعيد"          : "Appointments",
    patients:           isRTL ? "المريضين"          : "Patients",
    services:           isRTL ? "الخدمات"           : "Services",
    upcomingAppts:      isRTL ? "المواعيد القادمة"  : "Upcoming Appointments",
    ourDoctors:         isRTL ? "أطباءنا"           : "Our Doctors",
    addDoctor:          isRTL ? "إضافة طبيب"        : "Add Doctor",
    serviceList:        isRTL ? "الخدمات المتوفرة"  : "Available Services",
    noAppointments:     isRTL ? "لا توجد مواعيد قادمة." : "No upcoming appointments.",
    confirmed:          isRTL ? "مؤكد"   : "Confirmed",
    pending:            isRTL ? "معلق"   : "Pending",
  };

  const navItems: { id: CenterTab; icon: React.ReactNode; label: string }[] = [
    { id: "overview",     icon: <TrendingUp className="h-4 w-4" />,  label: isRTL ? "نظرة عامة" : "Overview"      },
    { id: "billing",      icon: <CreditCard className="h-4 w-4" />,  label: isRTL ? "الاشتراك"  : "Billing"       },
    { id: "publications", icon: <Newspaper className="h-4 w-4" />,   label: isRTL ? "المنشورات" : "Publications"  },
  ];

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 border-e bg-white hidden md:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{center.name}</h3>
                <p className="text-xs text-gray-500">{typeLabels[lang][center.type as keyof typeof typeLabels.en]}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors text-start ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <Link href="/medical-center/profile-setup">
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                  <FileText className="h-4 w-4" />
                  {isRTL ? "الملف الشخصي" : "Profile"}
                </span>
              </Link>

              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <Users className="h-4 w-4" />
                {t.doctors}
              </span>

              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <Settings className="h-4 w-4" />
                {isRTL ? "الإعدادات" : "Settings"}
              </span>

              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {isRTL ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile bottom tabs */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t shadow-lg flex md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                activeTab === item.id ? "text-primary" : "text-gray-500"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                  <p className="text-gray-500">{t.welcome}</p>
                </div>

                {/* Subscription status banner */}
                {billingInfo && !isSubscribed && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-amber-800">
                      {isRTL ? "لا يوجد اشتراك نشط — بعض الميزات غير متاحة." : "No active subscription — some features are unavailable."}
                    </p>
                    <Button size="sm" onClick={() => setActiveTab("billing")}
                      className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-1.5 shrink-0">
                      <CreditCard className="h-3.5 w-3.5" />
                      {isRTL ? "اشترك" : "Subscribe"}
                    </Button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: <Users className="h-5 w-5 text-blue-500" />,    bg: "bg-blue-50",           label: t.doctors,      value: center.doctors      },
                    { icon: <CalendarDays className="h-5 w-5 text-[#D4A853]" />, bg: "bg-[#D4A853]/10",label: t.appointments, value: center.appointments },
                    { icon: <Stethoscope className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50",      label: t.services,     value: center.services.length },
                    { icon: <Users className="h-5 w-5 text-purple-500" />,  bg: "bg-purple-50",         label: t.patients,     value: center.patients     },
                  ].map((s, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                        <div>
                          <p className="text-sm text-gray-500">{s.label}</p>
                          <p className="text-xl font-bold">{s.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Appointments */}
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {t.upcomingAppts}
                      </CardTitle>
                      <Badge variant="outline" className="text-primary border-primary/20">{upcomingAppointments.length}</Badge>
                    </CardHeader>
                    <CardContent>
                      {upcomingAppointments.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">{t.noAppointments}</p>
                      ) : (
                        <div className="space-y-3">
                          {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <div>
                                <p className="font-medium text-sm">{apt.patient}</p>
                                <p className="text-xs text-gray-500">{apt.service} · {apt.doctor} · {apt.date} {apt.time}</p>
                              </div>
                              <Badge variant="outline" className={
                                apt.status === "confirmed"
                                  ? "text-[#D4A853] border-[#D4A853]/20 bg-[#D4A853]/5"
                                  : "text-amber-700 border-amber-200 bg-amber-50"
                              }>
                                {apt.status === "confirmed" ? t.confirmed : t.pending}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Doctors */}
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {t.ourDoctors}
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-primary h-7 gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        {t.addDoctor}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {doctors.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {doc.name.charAt(4)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.specialty} · {doc.patients} {isRTL ? "مريض" : "patients"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Services */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      {t.serviceList}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {center.services.map((svc) => (
                        <Badge key={svc} variant="outline" className="text-gray-700 border-gray-200 bg-gray-50 px-3 py-1">
                          {svc}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Billing Tab ── */}
            {activeTab === "billing" && <BillingTab isRTL={isRTL} />}

            {/* ── Publications Tab ── */}
            {activeTab === "publications" && (
              isSubscribed
                ? <CenterPublicationsTab isRTL={isRTL} />
                : <PublicationsPaywall isRTL={isRTL} onGoToBilling={() => setActiveTab("billing")} />
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
