import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  useListDoctors,
  useApproveDoctor,
  useRejectDoctor,
  useDeleteDoctor,
  useListSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  useListCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  useListAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  useListServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useListAdminNotifications,
  useMarkAdminNotificationRead,
  useClearAdminNotifications,
  useGetReports,
  getListAdminNotificationsQueryKey,
  getListDoctorsQueryKey,
  getListSpecialtiesQueryKey,
  getListCitiesQueryKey,
  getListAreasQueryKey,
  getListServicesQueryKey,
  getGetReportsQueryKey,
  type Doctor,
  type AdminNotification,
} from "@workspace/api-client-react";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft,
  Users,
  Stethoscope,
  MapPin,
  MapPinHouse,
  Check,
  X,
  Clock,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Eye,
  EyeOff,
  Bell,
  UserPlus,
  Stethoscope as DoctorIcon,
  Building2,
  KeyRound,
  Search,
  Phone,
  Mail,
  Globe,
  Save,
  DollarSign,
  ClipboardList,
  BarChart3,
  WalletCards,
} from "lucide-react";
import { adminSearchUser, adminResetUserPassword, getContactSettings, updateContactSettings, type ContactSettings, toggleDoctorActive, toggleDoctorVezeeta, getAdminDoctorClinics, type AdminClinic, getAdminPlatformSettings, updateAdminPlatformSettings, type PlatformSettings, getAdminVouchers, createAdminVoucher, updateAdminVoucher, deleteAdminVoucher, type AdminVoucher, getAdminMedicalCenters, approveCenter, toggleCenterVezeeta, type AdminMedicalCenter, getAdminFinancialSettings, updateAdminFinancialSettings, getAdminPlatformBankAccount, updateAdminPlatformBankAccount, getAdminWithdrawals, decideAdminWithdrawal, giftAdminWalletFunds, type AdminFinancialSettings, type AdminPlatformBankAccount, type AdminWithdrawal } from "@/lib/api";

/* ─── Notification Bell ─── */

const notifIcons: Record<string, React.ReactNode> = {
  new_patient: <UserPlus className="w-4 h-4 text-blue-500" />,
  new_doctor: <DoctorIcon className="w-4 h-4 text-[#D4A853]" />,
  new_medical_center: <Building2 className="w-4 h-4 text-purple-500" />,
};

function NotificationBell({ lang }: { lang: string }) {
  const qc = useQueryClient();
  const { data: notifications = [] } = useListAdminNotifications<AdminNotification[]>();
  const markRead = useMarkAdminNotificationRead();
  const clearAll = useClearAdminNotifications();

  const unread = notifications.filter((n) => !n.isRead).length;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminNotificationsQueryKey() }) });
  };

  const handleClear = () => {
    clearAll.mutate(undefined, { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminNotificationsQueryKey() }) });
    setOpen(false);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === "ar" ? "الآن" : "just now";
    if (mins < 60) return lang === "ar" ? `منذ ${mins} د` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === "ar" ? `منذ ${hrs} س` : `${hrs}h ago`;
    return lang === "ar" ? `منذ ${Math.floor(hrs / 24)} ي` : `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title={lang === "ar" ? "الإشعارات" : "Notifications"}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">
              {lang === "ar" ? "الإشعارات" : "Notifications"}
              {unread > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{unread}</span>
              )}
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                {lang === "ar" ? "مسح الكل" : "Clear all"}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                {lang === "ar" ? "لا توجد إشعارات" : "No notifications"}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                    n.isRead ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{notifIcons[n.type] ?? <Bell className="w-4 h-4 text-gray-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 mt-0.5 text-[10px] text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap"
                      title={lang === "ar" ? "تحديد كمقروء" : "Mark read"}
                    >
                      {lang === "ar" ? "قراءة" : "Read"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function useInvalidateAdmin() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: getListDoctorsQueryKey() });
    qc.invalidateQueries({ queryKey: getListSpecialtiesQueryKey() });
    qc.invalidateQueries({ queryKey: getListCitiesQueryKey() });
    qc.invalidateQueries({ queryKey: getListAreasQueryKey() });
    qc.invalidateQueries({ queryKey: getListServicesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetReportsQueryKey() });
  };
}

/* ─── Admin Login Gate ─── */

function AdminLoginGate() {
  const { lang } = useLanguage();
  const { user, signIn, signOut, isLoading } = useAuth();
  const isRTL = lang === "ar";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role === "admin") {
    return <AdminDashboard onSignOut={signOut} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn(phone.trim(), password);
      if (result.user.role !== "admin") {
        signOut();
        setError(lang === "ar" ? "هذا الحساب ليس حساب مشرف" : "This account does not have admin access");
      }
    } catch {
      setError(lang === "ar" ? "رقم الهاتف أو كلمة المرور غير صحيحة" : "Invalid phone number or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] flex items-center justify-center px-4 ${isRTL ? "font-arabic" : ""}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D4A853]/15 mb-4">
            <ShieldCheck className="w-7 h-7 text-[#D4A853]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {lang === "ar" ? "لوحة التحكم" : "Admin Access"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {lang === "ar" ? "أدخل بيانات الدخول للمتابعة" : "Enter your credentials to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
            </label>
            <Input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
              className="bg-[#1E293B] border-[#334155] text-white placeholder:text-gray-600 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
              placeholder={lang === "ar" ? "رقم الهاتف" : "Phone number"}
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {lang === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="bg-[#1E293B] border-[#334155] text-white placeholder:text-gray-600 focus:border-[#D4A853] focus:ring-[#D4A853]/20 pr-10"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] font-semibold disabled:opacity-60"
          >
            {submitting ? (lang === "ar" ? "جارٍ الدخول..." : "Signing in...") : (lang === "ar" ? "دخول" : "Sign In")}
          </Button>
        </form>
      </div>
    </div>
  );
}

const tabs = [
  { id: "doctors", label: "Doctors", labelAr: "الأطباء", icon: Users },
  { id: "centers", label: "Centers", labelAr: "المراكز الطبية", icon: Building2 },
  { id: "users", label: "Users", labelAr: "المستخدمون", icon: KeyRound },
  { id: "specialties", label: "Specialties", labelAr: "التخصصات", icon: Stethoscope },
  { id: "cities", label: "Cities", labelAr: "المحافظات", icon: MapPinHouse },
  { id: "areas", label: "Areas", labelAr: "المناطق", icon: MapPin },
  { id: "services", label: "Services", labelAr: "الخدمات", icon: ClipboardList },
  { id: "reports", label: "Reports", labelAr: "التقارير", icon: BarChart3 },
  { id: "contact", label: "Contact Info", labelAr: "معلومات التواصل", icon: Globe },
  { id: "billing", label: "Billing", labelAr: "الاشتراكات", icon: DollarSign },
  { id: "financial", label: "Financial", labelAr: "المالية", icon: WalletCards },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Admin() {
  return <AdminLoginGate />;
}

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { lang, t, dir } = useLanguage();
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const tabParam = params.get("tab") as TabId | null;
  const activeTab: TabId = tabParam && tabs.some((t) => t.id === tabParam) ? tabParam : "doctors";
  const setActiveTab = (id: TabId) => navigate(`/admin?tab=${id}`);
  const isRTL = dir === "rtl";

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col ${isRTL ? "font-arabic" : ""}`}>
      {/* Header */}
      <div className="bg-[#0F172A] border-b border-[#D4A853]/20 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4A853]" />
                <span className="text-white font-semibold text-lg">
                  {lang === "ar" ? "لوحة التحكم" : "Admin Dashboard"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell lang={lang} />
              <button
                onClick={onSignOut}
                title={lang === "ar" ? "تسجيل الخروج" : "Sign out"}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-start ${
                    active
                      ? "bg-[#D4A853]/10 text-[#D4A853]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? "text-[#D4A853]" : "text-gray-400"}`} />
                  <span>{lang === "ar" ? tab.labelAr : tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "doctors" && <DoctorsSection lang={lang} />}
          {activeTab === "centers" && <CentersSection lang={lang} />}
          {activeTab === "users" && <UsersSection lang={lang} />}
          {activeTab === "specialties" && <SpecialtiesSection lang={lang} />}
          {activeTab === "cities" && <CitiesSection lang={lang} />}
          {activeTab === "areas" && <AreasSection lang={lang} />}
          {activeTab === "services" && <ServicesSection lang={lang} />}
          {activeTab === "reports" && <ReportsSection lang={lang} />}
          {activeTab === "contact" && <ContactInfoSection lang={lang} />}
          {activeTab === "billing" && <BillingManagementSection lang={lang} />}
          {activeTab === "financial" && <FinancialManagementSection lang={lang} />}
        </div>
      </div>
    </div>
  );
}

/* ─── ContactInfoSection ─── */
const CONTACT_DEFAULTS: ContactSettings = {
  phone: "+20 2 1234 5678",
  phoneSubEn: "Available Sun–Thu",
  phoneSubAr: "متاح من الأحد إلى الخميس",
  email: "support@egydoctors.com",
  address: "15 Teseen St, New Cairo, Cairo",
  addressAr: "١٥ شارع التسعين، التجمع الخامس، القاهرة",
  hoursEn: "9:00 AM – 6:00 PM",
  hoursAr: "٩:٠٠ ص – ٦:٠٠ م",
  daysEn: "Sunday – Thursday",
  daysAr: "الأحد – الخميس",
  whatsapp: "201234567890",
};

/* ─── Pricing settings panel ─── */
function PricingSettingsPanel({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  const qc = useQueryClient();
  const DEFAULTS: PlatformSettings = {
    doctorPrice3Months: 800, doctorPrice6Months: 1500, doctorPrice1Year: 2500,
    centerPrice3Months: 1200, centerPrice6Months: 2200, centerPrice1Year: 3800,
    defaultFreeTrialDays: 14, currency: "EGP",
  };
  const [form, setForm] = useState<PlatformSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ["adminPlatformSettings"],
    queryFn: getAdminPlatformSettings,
  });

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const mut = useMutation({
    mutationFn: updateAdminPlatformSettings,
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["adminPlatformSettings"] });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function numField(key: keyof PlatformSettings, label: string, labelAr: string) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? labelAr : label}</label>
        <Input type="number" min={0} value={form[key] as number}
          onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Doctor Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-gray-900">{isAr ? "أسعار اشتراك الأطباء" : "Doctor Subscription Pricing"}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">{isAr ? "الأسعار الظاهرة للأطباء في صفحة الاشتراك" : "Prices shown to doctors on the subscription page"}</p>
        {isLoading ? (
          <div className="text-gray-400 text-sm py-2">{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {numField("doctorPrice3Months", "3-Month Price (EGP)", "سعر 3 أشهر (جنيه)")}
            {numField("doctorPrice6Months", "6-Month Price (EGP)", "سعر 6 أشهر (جنيه)")}
            {numField("doctorPrice1Year",   "1-Year Price (EGP)",  "سعر السنة (جنيه)")}
          </div>
        )}
      </div>

      {/* Medical Center Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-gray-900">{isAr ? "أسعار اشتراك المراكز الطبية" : "Medical Center Subscription Pricing"}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">{isAr ? "الأسعار الظاهرة للمراكز الطبية في صفحة الاشتراك" : "Prices shown to medical centers on the subscription page"}</p>
        {isLoading ? (
          <div className="text-gray-400 text-sm py-2">{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {numField("centerPrice3Months", "3-Month Price (EGP)", "سعر 3 أشهر (جنيه)")}
            {numField("centerPrice6Months", "6-Month Price (EGP)", "سعر 6 أشهر (جنيه)")}
            {numField("centerPrice1Year",   "1-Year Price (EGP)",  "سعر السنة (جنيه)")}
          </div>
        )}
      </div>

      {/* Shared settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{isAr ? "إعدادات مشتركة" : "Shared Settings"}</h3>
        {isLoading ? (
          <div className="text-gray-400 text-sm py-2">{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numField("defaultFreeTrialDays", "Free Trial Days", "أيام التجربة المجانية")}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "العملة" : "Currency"}</label>
              <Input value={form.currency} placeholder="EGP"
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => { setSaved(false); mut.mutate(form); }} disabled={mut.isPending}
          className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-2">
          <Save className="h-4 w-4" />
          {mut.isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ الإعدادات" : "Save All Settings")}
        </Button>
        {saved && <span className="text-sm text-green-400 font-medium">{isAr ? "✓ تم الحفظ" : "✓ Saved"}</span>}
        {mut.isError && <span className="text-sm text-red-400">{isAr ? "خطأ في الحفظ" : "Failed to save"}</span>}
      </div>
    </div>
  );
}

/* ─── Vouchers panel ─── */
function VouchersPanel({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: "", discountPercentage: 0, additionalFreeDays: 0, expirationDate: "", maxUses: "" });
  const [formError, setFormError] = useState("");

  const { data: vouchers = [], isLoading } = useQuery<AdminVoucher[]>({
    queryKey: ["adminVouchers"],
    queryFn: getAdminVouchers,
  });

  const createMut = useMutation({
    mutationFn: (d: Parameters<typeof createAdminVoucher>[0]) => createAdminVoucher(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminVouchers"] });
      setShowForm(false);
      setFormData({ code: "", discountPercentage: 0, additionalFreeDays: 0, expirationDate: "", maxUses: "" });
      setFormError("");
    },
    onError: (e: Error) => setFormError(e.message ?? (isAr ? "حدث خطأ" : "Error creating voucher")),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => updateAdminVoucher(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminVouchers"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteAdminVoucher(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminVouchers"] }),
  });

  function handleCreate() {
    setFormError("");
    if (!formData.code.trim()) { setFormError(isAr ? "الكود مطلوب" : "Code is required"); return; }
    createMut.mutate({
      code: formData.code.trim().toUpperCase(),
      discountPercentage: Number(formData.discountPercentage),
      additionalFreeDays: Number(formData.additionalFreeDays),
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
      isActive: true,
      maxUses: formData.maxUses ? Number(formData.maxUses) : null,
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{isAr ? "إنشاء كود خصم جديد" : "Create New Voucher"}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{isAr ? "أضف كوداً جديداً للأطباء" : "Add a promo code for doctors"}</p>
          </div>
          <Button variant={showForm ? "outline" : "default"}
            onClick={() => { setShowForm(!showForm); setFormError(""); }}
            className={showForm ? "" : "bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]"}>
            <Plus className="h-4 w-4 me-1" />
            {showForm ? (isAr ? "إلغاء" : "Cancel") : (isAr ? "كود جديد" : "New Code")}
          </Button>
        </div>
        {showForm && (
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "الكود *" : "Code *"}</label>
              <Input value={formData.code} placeholder="WELCOME2026" className="font-mono uppercase"
                onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "نسبة الخصم %" : "Discount %"}</label>
              <Input type="number" min={0} max={100} value={formData.discountPercentage}
                onChange={(e) => setFormData(f => ({ ...f, discountPercentage: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "أيام إضافية مجانية" : "Bonus Days"}</label>
              <Input type="number" min={0} value={formData.additionalFreeDays}
                onChange={(e) => setFormData(f => ({ ...f, additionalFreeDays: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "تاريخ الانتهاء" : "Expiration Date"}</label>
              <Input type="date" value={formData.expirationDate}
                onChange={(e) => setFormData(f => ({ ...f, expirationDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{isAr ? "الحد الأقصى للاستخدام" : "Max Uses (optional)"}</label>
              <Input type="number" min={1} value={formData.maxUses} placeholder={isAr ? "غير محدود" : "Unlimited"}
                onChange={(e) => setFormData(f => ({ ...f, maxUses: e.target.value }))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleCreate} disabled={createMut.isPending}
                className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-2">
                <Plus className="h-4 w-4" />
                {createMut.isPending ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : (isAr ? "إنشاء" : "Create")}
              </Button>
            </div>
            {formError && <p className="text-red-500 text-sm col-span-full">{formError}</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{isAr ? "كودات الخصم" : "Vouchers"}</h3>
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">{isAr ? "جاري التحميل..." : "Loading..."}</div>
        ) : vouchers.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">{isAr ? "لا توجد كودات بعد" : "No vouchers yet"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? "الكود" : "Code"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "خصم" : "Discount"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "أيام إضافية" : "Bonus Days"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الانتهاء" : "Expires"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الاستخدام" : "Uses"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{v.code}</td>
                    <td className="px-4 py-3 text-gray-700">{v.discountPercentage > 0 ? `${v.discountPercentage}%` : "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{v.additionalFreeDays > 0 ? `+${v.additionalFreeDays}d` : "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {v.expirationDate
                        ? new Date(v.expirationDate).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : (isAr ? "لا يوجد" : "Never")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.currentUses}{v.maxUses ? `/${v.maxUses}` : ""}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        v.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {v.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطّل" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleMut.mutate({ id: v.id, isActive: !v.isActive })}
                          disabled={toggleMut.isPending}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                          {v.isActive ? (isAr ? "تعطيل" : "Disable") : (isAr ? "تفعيل" : "Enable")}
                        </button>
                        <button
                          onClick={() => { if (confirm(isAr ? "حذف هذا الكود؟" : "Delete this voucher?")) deleteMut.mutate(v.id); }}
                          disabled={deleteMut.isPending}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50">
                          {isAr ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Billing management wrapper ─── */
function BillingManagementSection({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [subTab, setSubTab] = useState<"settings" | "vouchers">("settings");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{isAr ? "إدارة الاشتراكات" : "Billing Management"}</h2>
      </div>
      <div className="flex gap-2 mb-6">
        {([
          { id: "settings" as const, label: "Pricing Settings", labelAr: "الأسعار والإعدادات" },
          { id: "vouchers" as const, label: "Vouchers",          labelAr: "كودات الخصم" },
        ]).map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              subTab === t.id
                ? "bg-[#D4A853] text-[#0F172A] border-[#D4A853]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A853] hover:text-[#D4A853]"
            }`}>
            {isAr ? t.labelAr : t.label}
          </button>
        ))}
      </div>
      {subTab === "settings" && <PricingSettingsPanel lang={lang} />}
      {subTab === "vouchers" && <VouchersPanel lang={lang} />}
    </div>
  );
}

function FinancialManagementSection({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<"settings" | "withdrawals">("settings");
  const [form, setForm] = useState<AdminFinancialSettings>({ deductionType: "PERCENTAGE", deductionValue: 0, platformSharePercentage: 100, cashbackSharePercentage: 0, minDoctorWalletBalance: 0, subscriptionModelEnabled: false });
  const [bank, setBank] = useState<AdminPlatformBankAccount>({ accountHolderName: "", bankName: "", accountNumber: "", iban: "", branchName: "", swiftCode: "" });
  const settings = useQuery({ queryKey: ["adminFinancialSettings"], queryFn: getAdminFinancialSettings });
  const bankQuery = useQuery({ queryKey: ["adminPlatformBankAccount"], queryFn: getAdminPlatformBankAccount });
  useEffect(() => { if (settings.data) setForm((f) => ({ ...f, ...settings.data })); }, [settings.data]);
  useEffect(() => { if (bankQuery.data) setBank((b) => ({ ...b, ...bankQuery.data })); }, [bankQuery.data]);
  const save = useMutation({ mutationFn: updateAdminFinancialSettings, onSuccess: () => qc.invalidateQueries({ queryKey: ["adminFinancialSettings"] }) });
  const saveBank = useMutation({ mutationFn: updateAdminPlatformBankAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPlatformBankAccount"] }) });
  const valid = form.deductionValue >= 0 && (form.deductionType === "FIXED" || form.deductionValue <= 100) && form.minDoctorWalletBalance >= 0 && form.platformSharePercentage >= 0 && form.cashbackSharePercentage >= 0 && form.platformSharePercentage <= 100 && form.cashbackSharePercentage <= 100 && form.platformSharePercentage + form.cashbackSharePercentage === 100;
  const numberField = (label: string, key: keyof AdminFinancialSettings) => <label className="text-sm text-gray-700">{label}<Input className="mt-1" type="number" min={0} value={form[key] as number} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} /></label>;
  const bankField = (label: string, key: keyof AdminPlatformBankAccount) => <label className="text-sm text-gray-700">{label}<Input className="mt-1" value={bank[key] ?? ""} onChange={(e) => setBank({ ...bank, [key]: e.target.value })} /></label>;
  return <div className="space-y-6 max-w-4xl">
    <h2 className="text-xl font-bold text-gray-900">{isAr ? "الإدارة المالية" : "Financial Management"}</h2>
    <div className="flex gap-2"><Button variant={subTab === "settings" ? "default" : "outline"} onClick={() => setSubTab("settings")}>{isAr ? "الإعدادات" : "Settings"}</Button><Button variant={subTab === "withdrawals" ? "default" : "outline"} onClick={() => setSubTab("withdrawals")}>{isAr ? "طلبات السحب" : "Withdrawal Requests"}</Button></div>
    {subTab === "settings" ? <div className="space-y-5">
      <div className="bg-white border rounded-xl p-6"><h3 className="font-semibold mb-4">{isAr ? "الخصم وحصص الإيرادات" : "Deduction & revenue shares"}</h3>{settings.isLoading ? <p className="text-gray-500">Loading...</p> : settings.isError ? <p className="text-red-600">{isAr ? "تعذر تحميل الإعدادات" : "Unable to load settings"}</p> : <div className="grid sm:grid-cols-2 gap-4">
        {numberField(isAr ? "قيمة الخصم" : "Deduction value", "deductionValue")}{numberField(isAr ? "حصة المنصة %" : "Platform share %", "platformSharePercentage")}{numberField(isAr ? "حصة الكاش باك %" : "Cashback share %", "cashbackSharePercentage")}{numberField(isAr ? "الحد الأدنى لمحفظة الطبيب" : "Minimum doctor wallet balance", "minDoctorWalletBalance")}
      </div>}<p className={`text-xs mt-3 ${valid ? "text-gray-500" : "text-red-600"}`}>{isAr ? "يجب أن يكون مجموع حصة المنصة والكاش باك 100%." : "Platform and cashback shares must total 100%."}</p><label className="flex items-center gap-2 mt-5 text-sm"><input type="checkbox" checked={form.subscriptionModelEnabled} onChange={(e) => setForm({ ...form, subscriptionModelEnabled: e.target.checked })} />{isAr ? "تفعيل نموذج الاشتراكات" : "Enable subscription model"}</label><div className="mt-5"><Button disabled={!valid || save.isPending} onClick={() => save.mutate(form)} className="bg-[#D4A853] text-[#0F172A]"><Save className="w-4 h-4 mr-2" />{isAr ? "حفظ" : "Save settings"}</Button>{save.isSuccess && <span className="text-sm text-green-600 ml-3">{isAr ? "تم الحفظ" : "Saved"}</span>}{save.isError && <span className="text-sm text-red-600 ml-3">{isAr ? "فشل الحفظ" : "Save failed"}</span>}</div></div>
      <div className="bg-white border rounded-xl p-6"><h3 className="font-semibold mb-4">{isAr ? "حساب المنصة البنكي" : "Platform bank account"}</h3>{bankQuery.isLoading ? <p className="text-gray-500">Loading...</p> : bankQuery.isError ? <p className="text-red-600">{isAr ? "تعذر تحميل الحساب البنكي" : "Unable to load bank account"}</p> : <div className="grid sm:grid-cols-2 gap-4">{bankField("Account holder name", "accountHolderName")}{bankField("Bank name", "bankName")}{bankField("Account number", "accountNumber")}{bankField("IBAN", "iban")}{bankField("Branch", "branchName")}</div>}<p className="text-xs text-gray-500 mt-3">Provide an account number or IBAN.</p><Button className="mt-5 bg-[#D4A853] text-[#0F172A]" disabled={saveBank.isPending || bankQuery.isError || !bank.accountHolderName.trim() || !bank.bankName.trim() || (!bank.accountNumber?.trim() && !bank.iban?.trim())} onClick={() => saveBank.mutate(bank)}><Save className="w-4 h-4 mr-2" />Save bank account</Button>{saveBank.isSuccess && <span className="text-sm text-green-600 ml-3">{isAr ? "تم الحفظ" : "Saved"}</span>}{saveBank.isError && <span className="text-sm text-red-600 ml-3">{isAr ? "فشل الحفظ" : "Save failed"}</span>}</div>
    </div> : <WithdrawalsPanel lang={lang} />}
  </div>;
}

function WithdrawalsPanel({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar"; const qc = useQueryClient(); const query = useQuery({ queryKey: ["adminWithdrawals"], queryFn: getAdminWithdrawals });
  const decide = useMutation({ mutationFn: ({ id, decision, adminNote }: { id: string; decision: "COMPLETED" | "REJECTED"; adminNote?: string }) => decideAdminWithdrawal(id, decision, adminNote), onSuccess: () => qc.invalidateQueries({ queryKey: ["adminWithdrawals"] }) });
  const [rejecting, setRejecting] = useState<AdminWithdrawal | null>(null); const [note, setNote] = useState("");
  const reject = useMutation({ mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) => decideAdminWithdrawal(id, "REJECTED", adminNote), onSuccess: () => { setRejecting(null); setNote(""); qc.invalidateQueries({ queryKey: ["adminWithdrawals"] }); } });
  const raw = query.data as unknown; const items: AdminWithdrawal[] = Array.isArray(raw) ? raw : ((raw as { withdrawals?: AdminWithdrawal[] } | undefined)?.withdrawals ?? []);
  return <div className="bg-white border rounded-xl overflow-hidden">{query.isLoading ? <p className="p-8 text-center text-gray-500">Loading...</p> : <Table><TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((w) => <TableRow key={w.id}><TableCell>#{w.doctorUserId}</TableCell><TableCell>{w.amount} EGP</TableCell><TableCell><Badge variant="outline">{w.status}</Badge></TableCell><TableCell>{w.status === "PENDING" && <div className="flex gap-2"><Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: w.id, decision: "COMPLETED" })}>{isAr ? "إتمام" : "Complete"}</Button><Button size="sm" variant="outline" onClick={() => setRejecting(w)}>{isAr ? "رفض" : "Reject"}</Button></div>}</TableCell></TableRow>)}</TableBody></Table>}{!query.isLoading && !items.length && <p className="p-8 text-center text-gray-500">{isAr ? "لا توجد طلبات" : "No requests"}</p>}<Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}><DialogContent><DialogHeader><DialogTitle>{isAr ? "رفض الطلب" : "Reject withdrawal"}</DialogTitle></DialogHeader><textarea className="w-full border rounded-md p-3" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Admin note (required)" /><Button disabled={!note.trim() || reject.isPending} onClick={() => rejecting && reject.mutate({ id: rejecting.id, adminNote: note.trim() })}>{isAr ? "تأكيد" : "Confirm"}</Button></DialogContent></Dialog></div>;
}

function ContactInfoSection({ lang }: { lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ContactSettings>(CONTACT_DEFAULTS);

  useEffect(() => {
    getContactSettings()
      .then((data) => setForm(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: keyof ContactSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateContactSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError(isAr ? "فشل الحفظ، حاول مجددًا." : "Save failed, please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2" />
        {isAr ? "جارٍ التحميل..." : "Loading..."}
      </div>
    );
  }

  const field = (label: string, key: keyof ContactSettings, placeholder?: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-600" />
          {isAr ? "معلومات التواصل" : "Contact Page Info"}
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {isAr ? "تم الحفظ بنجاح ✓" : "Changes saved successfully ✓"}
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {saveError}
        </div>
      )}

      {/* Phone */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
          <Phone className="w-4 h-4 text-teal-600" />
          {isAr ? "الهاتف" : "Phone"}
        </div>
        {field(isAr ? "رقم الهاتف" : "Phone Number", "phone", "+20 2 1234 5678")}
        {field(isAr ? "نص فرعي (EN)" : "Sub-text (EN)", "phoneSubEn", "Available Sun–Thu")}
        {field(isAr ? "نص فرعي (AR)" : "Sub-text (AR)", "phoneSubAr", "متاح من الأحد إلى الخميس")}
      </div>

      {/* Email */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
          <Mail className="w-4 h-4 text-teal-600" />
          {isAr ? "البريد الإلكتروني" : "Email"}
        </div>
        {field(isAr ? "البريد الإلكتروني" : "Email Address", "email", "support@egydoctors.com")}
      </div>

      {/* Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
          <MapPin className="w-4 h-4 text-teal-600" />
          {isAr ? "العنوان" : "Address"}
        </div>
        {field(isAr ? "العنوان (EN)" : "Address (EN)", "address", "15 Teseen St, New Cairo, Cairo")}
        {field(isAr ? "العنوان (AR)" : "Address (AR)", "addressAr", "١٥ شارع التسعين، التجمع الخامس، القاهرة")}
      </div>

      {/* Working Hours */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
          <Clock className="w-4 h-4 text-teal-600" />
          {isAr ? "ساعات العمل" : "Working Hours"}
        </div>
        {field(isAr ? "ساعات العمل (EN)" : "Hours (EN)", "hoursEn", "9:00 AM – 6:00 PM")}
        {field(isAr ? "ساعات العمل (AR)" : "Hours (AR)", "hoursAr", "٩:٠٠ ص – ٦:٠٠ م")}
        {field(isAr ? "أيام العمل (EN)" : "Days (EN)", "daysEn", "Sunday – Thursday")}
        {field(isAr ? "أيام العمل (AR)" : "Days (AR)", "daysAr", "الأحد – الخميس")}
      </div>

      {/* WhatsApp */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
          <Phone className="w-4 h-4 text-green-600" />
          WhatsApp
        </div>
        {field(isAr ? "رقم واتساب (بدون + أو 00)" : "WhatsApp Number (digits only, e.g. 201234567890)", "whatsapp", "201234567890")}
        <p className="text-xs text-gray-400">{isAr ? "مثال: 201234567890 — بدون + أو مسافات" : "Example: 201234567890 — no + or spaces"}</p>
      </div>
    </div>
  );
}

/* ─── Doctors Section ─── */

/* ─── Users Section (admin password reset) ─── */
function UsersSection({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const [phone, setPhone] = useState("");
  const [foundUser, setFoundUser] = useState<{ id: number; name: string; phone: string; email: string | null; role: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFoundUser(null);
    setSearchError(null);
    setResetSuccess(null);
    setResetError(null);
    setNewPassword("");
    setSearching(true);
    try {
      const user = await adminSearchUser(phone.trim());
      setFoundUser(user);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "User not found");
    } finally {
      setSearching(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser) return;
    setResetError(null);
    setResetSuccess(null);
    setResetting(true);
    try {
      await adminResetUserPassword(foundUser.phone, newPassword);
      setResetSuccess(isAr ? `تم تغيير كلمة مرور ${foundUser.name} بنجاح` : `Password for ${foundUser.name} has been reset successfully.`);
      setNewPassword("");
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#D4A853]/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-[#D4A853]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{isAr ? "إعادة تعيين كلمة المرور" : "Reset User Password"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{isAr ? "ابحث عن المستخدم برقم الهاتف ثم عيّن كلمة مرور جديدة" : "Find user by phone number, then set a new password directly."}</p>
          </div>
        </div>

        {/* Step 1: Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSearchError(null); setFoundUser(null); setResetSuccess(null); }}
            placeholder={isAr ? "رقم الهاتف (مثال: 01070200998)" : "Phone number (e.g. 01070200998)"}
            className="flex-1 font-mono text-sm"
            dir="ltr"
          />
          <Button type="submit" disabled={searching || !phone.trim()} className="bg-[#0F172A] text-white hover:bg-[#1E293B] shrink-0">
            {searching ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {searchError && (
          <p className="text-sm text-red-500 mb-4 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 shrink-0" /> {searchError}
          </p>
        )}

        {/* Step 2: Found user + reset form */}
        {foundUser && (
          <div className="mt-2">
            <div className="rounded-lg bg-[#F8FAFC] border border-gray-200 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4A853]/15 flex items-center justify-center text-[#D4A853] font-bold text-sm shrink-0">
                  {foundUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{foundUser.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{foundUser.phone}</p>
                  {foundUser.email && <p className="text-xs text-gray-500 mt-0.5">{foundUser.email}</p>}
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#D4A853]/10 text-[#92400E] capitalize">{foundUser.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{isAr ? "كلمة المرور الجديدة" : "New Password"}</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setResetError(null); }}
                  placeholder={isAr ? "6 أحرف على الأقل" : "At least 6 characters"}
                  className="font-mono"
                  dir="ltr"
                  minLength={6}
                />
              </div>
              {resetError && <p className="text-sm text-red-500 flex items-center gap-1.5"><X className="w-3.5 h-3.5 shrink-0" />{resetError}</p>}
              {resetSuccess && <p className="text-sm text-green-600 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 shrink-0" />{resetSuccess}</p>}
              <Button
                type="submit"
                disabled={resetting || newPassword.length < 6}
                className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] font-semibold"
              >
                {resetting
                  ? (isAr ? "جارٍ التغيير..." : "Resetting...")
                  : (isAr ? "تعيين كلمة المرور" : "Reset Password")}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

type AdminDoctor = Doctor & {
  specialtyName?: string | null;
  cityName?: string | null;
  areaName?: string | null;
  email?: string | null;
  phone?: string | null;
  syndicateNumber?: string | null;
};

function DoctorDetailModal({ doctor, lang, onClose }: {
  doctor: AdminDoctor;
  lang: string;
  onClose: () => void;
}) {
  const isAr = lang === "ar";
  const d = doctor as unknown as Record<string, unknown>;

  const { data: clinics = [], isLoading: clinicsLoading } = useQuery<AdminClinic[]>({
    queryKey: ["adminDoctorClinics", doctor.id],
    queryFn: () => getAdminDoctorClinics(doctor.id),
  });

  const row = (label: string, value: string | number | null | undefined) => (
    value != null && value !== "" ? (
      <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs font-medium text-gray-500 w-36 shrink-0">{label}</span>
        <span className="text-sm text-gray-900 break-words">{String(value)}</span>
      </div>
    ) : null
  );

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {doctor.name.charAt(0)}
          </div>
          {doctor.name}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-1 pt-2">
        {row(isAr ? "التخصص" : "Specialty", d.specialtyName as string)}
        {row(isAr ? "المدينة" : "City", d.cityName as string)}
        {row(isAr ? "المنطقة" : "Area", d.areaName as string)}
        {row(isAr ? "البريد الإلكتروني" : "Email", d.email as string)}
        {row(isAr ? "رقم الموبايل" : "Mobile", d.phone as string)}
        {row(isAr ? "رقم عضوية الأطباء" : "Doctor Membership No.", d.syndicateNumber as string)}
        {row(isAr ? "سنوات الخبرة" : "Experience (years)", doctor.experience)}
        {row(isAr ? "رسوم الكشف" : "Consultation Fee (EGP)", doctor.fee)}
        {row(isAr ? "النبذة التعريفية" : "Bio", doctor.bio)}
        {row(isAr ? "حالة الحساب" : "Account Status", doctor.accountStatus)}
        {row(isAr ? "الحالة النشطة" : "Active Status", d.isActive === false ? (isAr ? "معطل" : "Deactivated") : (isAr ? "نشط" : "Active"))}
        {row(isAr ? "تاريخ التسجيل" : "Registered", new Date(doctor.createdAt).toLocaleDateString())}
      </div>

      {/* Clinics Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {isAr ? "العيادات" : "Clinics"}
        </h4>
        {clinicsLoading ? (
          <p className="text-xs text-gray-400">{isAr ? "جاري التحميل..." : "Loading..."}</p>
        ) : clinics.length === 0 ? (
          <p className="text-xs text-gray-400">{isAr ? "لا توجد عيادات مسجلة" : "No clinics registered"}</p>
        ) : (
          <div className="space-y-3">
            {clinics.map((clinic, i) => (
              <div key={clinic.id} className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <p className="font-medium text-gray-900 text-sm">
                  {clinic.name ?? `${isAr ? "عيادة" : "Clinic"} ${i + 1}`}
                </p>
                {clinic.address && (
                  <p className="text-gray-600">📍 {clinic.address}</p>
                )}
                {(clinic.cityName || clinic.areaName) && (
                  <p className="text-gray-500">{[clinic.cityName, clinic.areaName].filter(Boolean).join(" › ")}</p>
                )}
                {clinic.phone && (
                  <p className="text-gray-600">📞 {clinic.phone}</p>
                )}
                {clinic.fee != null && (
                  <p className="text-gray-600">{isAr ? "الرسوم:" : "Fee:"} {clinic.fee} EGP</p>
                )}
                {clinic.lat && clinic.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${clinic.lat},${clinic.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {isAr ? "عرض على الخريطة" : "View on map"}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function DoctorsSection({ lang }: { lang: string }) {
  const { data: doctors = [], isLoading } = useListDoctors();
  const approve = useApproveDoctor();
  const reject = useRejectDoctor();
  const deleteDoc = useDeleteDoctor();
  const invalidate = useInvalidateAdmin();
  const qc = useQueryClient();
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null as AdminDoctor | null);
  const [giftDoctor, setGiftDoctor] = useState<AdminDoctor | null>(null);
  const [giftAmount, setGiftAmount] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const gift = useMutation({
    mutationFn: () => giftAdminWalletFunds(Number((giftDoctor as unknown as Record<string, unknown>).userId ?? giftDoctor!.id), Number(giftAmount), giftDescription.trim() || undefined),
    onSuccess: () => { setGiftDoctor(null); setGiftAmount(""); setGiftDescription(""); qc.invalidateQueries({ queryKey: getListDoctorsQueryKey() }); },
  });

  const incomplete = doctors.filter((d) => d.accountStatus === "incomplete");
  const pending = doctors.filter((d) => d.accountStatus === "pending");
  const approved = doctors.filter((d) => d.accountStatus === "approved");
  const rejected = doctors.filter((d) => d.accountStatus === "rejected");
  const inactive = doctors.filter((d) => (d as unknown as Record<string, unknown>).isActive === false);
  const active = doctors.filter((d) => d.accountStatus === "approved" && (d as unknown as Record<string, unknown>).isActive !== false);

  const toggleActive = useMutation({
    mutationFn: (id: number) => toggleDoctorActive(id),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ["doctors"] }); },
  });

  const toggleVezeeta = useMutation({
    mutationFn: (id: number) => toggleDoctorVezeeta(id),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ["doctors"] }); },
  });

  const handleApprove = (id: number) => {
    approve.mutate({ id }, { onSuccess: invalidate });
  };
  const handleReject = (id: number) => {
    reject.mutate({ id }, { onSuccess: invalidate });
  };
  const handleDelete = (id: number, name: string) => {
    if (confirm(lang === "ar" ? `هل أنت متأكد من حذف الطبيب "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.` : `Delete doctor "${name}"? This cannot be undone.`)) {
      deleteDoc.mutate({ id }, { onSuccess: invalidate });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      incomplete: "bg-gray-100 text-gray-600",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const statusLabel = (status: string, isAr: boolean) => {
    const map: Record<string, [string, string]> = {
      incomplete: ["Incomplete", "غير مكتمل"],
      pending: ["Pending", "معلق"],
      approved: ["Approved", "معتمد"],
      rejected: ["Rejected", "مرفوض"],
    };
    const [en, ar] = map[status] ?? [status, status];
    return isAr ? ar : en;
  };

  const isAr = lang === "ar";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
        {[
          { label: "Total", labelAr: "الإجمالي", value: doctors.length },
          { label: "Incomplete", labelAr: "غير مكتمل", value: incomplete.length, color: "text-gray-500" },
          { label: "Pending", labelAr: "معلق", value: pending.length, color: "text-yellow-600" },
          { label: "Approved", labelAr: "معتمد", value: approved.length, color: "text-green-600" },
          { label: "Active", labelAr: "نشط", value: active.length, color: "text-emerald-600" },
          { label: "Rejected", labelAr: "مرفوض", value: rejected.length, color: "text-red-600" },
          { label: "Inactive", labelAr: "معطل", value: inactive.length, color: "text-orange-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{lang === "ar" ? stat.labelAr : stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color || "text-gray-900"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Doctors Table */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => { if (!open) setSelectedDoctor(null); }}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {lang === "ar" ? "قائمة الأطباء" : "Doctor List"}
            </h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isAr ? "التخصص" : "Specialty"}</TableHead>
                    <TableHead>{isAr ? "المدينة" : "City"}</TableHead>
                    <TableHead>{isAr ? "رقم العضوية" : "Membership No."}</TableHead>
                    <TableHead>{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => {
                    const doctorIsActive = (doctor as unknown as Record<string, unknown>).isActive !== false;
                    return (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={statusBadge(doctor.accountStatus)}>
                            {statusLabel(doctor.accountStatus, isAr)}
                          </Badge>
                          {doctor.accountStatus === "approved" && !doctorIsActive && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 text-xs">
                              {isAr ? "معطل" : "Inactive"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {(doctor as unknown as Record<string, string>).specialtyName ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {(doctor as unknown as Record<string, string>).cityName ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-mono">
                        {(doctor as unknown as Record<string, string>).syndicateNumber ?? "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            onClick={() => setSelectedDoctor(doctor as AdminDoctor)}
                            title={isAr ? "عرض التفاصيل" : "View details"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {doctor.accountStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(doctor.id)}
                                disabled={approve.isPending}
                                title={isAr ? "قبول" : "Approve"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(doctor.id)}
                                disabled={reject.isPending}
                                title={isAr ? "رفض" : "Reject"}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {doctor.accountStatus === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className={doctorIsActive
                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                              onClick={() => toggleActive.mutate(doctor.id)}
                              disabled={toggleActive.isPending}
                              title={doctorIsActive
                                ? (isAr ? "تعطيل الطبيب" : "Deactivate doctor")
                                : (isAr ? "تفعيل الطبيب" : "Activate doctor")}
                            >
                              {doctorIsActive
                                ? <ShieldCheck className="w-3.5 h-3.5" />
                                : <Check className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                          {/* Vezeeta profile toggle */}
                          <Button
                            size="sm"
                            variant={(doctor as unknown as Record<string, unknown>).hasVezeetaProfile ? "default" : "outline"}
                            className={`h-7 text-xs gap-1 ${(doctor as unknown as Record<string, unknown>).hasVezeetaProfile ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-500 hover:text-blue-600 hover:border-blue-300"}`}
                            onClick={() => toggleVezeeta.mutate(doctor.id)}
                            disabled={toggleVezeeta.isPending}
                            title={isAr ? "تبديل حالة Vezeeta" : "Toggle Vezeeta profile"}
                          >
                            V
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(doctor.id, doctor.name)}
                            disabled={deleteDoc.isPending}
                            title={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => setGiftDoctor(doctor as AdminDoctor)} title={isAr ? "إهداء أموال" : "Gift funds"}><DollarSign className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        {selectedDoctor && (
          <DoctorDetailModal
            doctor={selectedDoctor}
            lang={lang}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </Dialog>
      <Dialog open={!!giftDoctor} onOpenChange={(open) => !open && setGiftDoctor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isAr ? `إهداء أموال لـ ${giftDoctor?.name ?? ""}` : `Gift funds to ${giftDoctor?.name ?? ""}`}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-gray-700 block">{isAr ? "المبلغ (مطلوب)" : "Amount (required)"}<Input type="number" min="0.01" step="0.01" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} /></label>
            <label className="text-sm text-gray-700 block">{isAr ? "الوصف (اختياري)" : "Description (optional)"}<Input value={giftDescription} onChange={(e) => setGiftDescription(e.target.value)} /></label>
            {gift.isError && <p className="text-sm text-red-600">{isAr ? "فشل إرسال الأموال" : "Failed to gift funds"}</p>}
            <Button className="w-full bg-[#D4A853] text-[#0F172A]" disabled={gift.isPending || !Number.isFinite(Number(giftAmount)) || Number(giftAmount) <= 0} onClick={() => gift.mutate()}>{gift.isPending ? (isAr ? "جارٍ الإرسال..." : "Sending...") : (isAr ? "إرسال الأموال" : "Gift funds")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Specialties Section ─── */

function SpecialtiesSection({ lang }: { lang: string }) {
  const { data: items = [], isLoading } = useListSpecialties();
  const create = useCreateSpecialty();
  const update = useUpdateSpecialty();
  const remove = useDeleteSpecialty();
  const invalidate = useInvalidateAdmin();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", shortName: "", description: "", displayOrder: 1 });

  const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1;

  const reset = () => {
    setForm({ name: "", nameAr: "", shortName: "", description: "", displayOrder: nextOrder });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      nameAr: form.nameAr,
      shortName: form.shortName || undefined,
      description: form.description || undefined,
      displayOrder: Number(form.displayOrder),
    };
    if (editId) {
      update.mutate(
        { id: editId, data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    } else {
      create.mutate(
        { data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    }
  };

  const handleEdit = (item: typeof items[0]) => {
    setForm({
      name: item.name,
      nameAr: item.nameAr,
      shortName: item.shortName ?? "",
      description: item.description ?? "",
      displayOrder: item.displayOrder,
    });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
      remove.mutate({ id }, { onSuccess: invalidate });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">
          {lang === "ar" ? "التخصصات" : "Specialties"}
        </h3>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !editId) reset(); }}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]"
              onClick={() => { reset(); setOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-1" />
              {lang === "ar" ? "إضافة" : "Add"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? (lang === "ar" ? "تعديل تخصص" : "Edit Specialty") : (lang === "ar" ? "إضافة تخصص" : "Add Specialty")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder={lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              />
              <Input
                placeholder={lang === "ar" ? "الاسم المختصر (اختياري)" : "Short Name (optional)"}
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              />
              <Input
                placeholder={lang === "ar" ? "الوصف (اختياري)" : "Description (optional)"}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">
                  {lang === "ar" ? "ترتيب العرض" : "Display Order"}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </div>
              <Button
                className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]"
                onClick={handleSubmit}
                disabled={create.isPending || update.isPending || !form.name || !form.nameAr}
              >
                {editId ? (lang === "ar" ? "حفظ" : "Save") : (lang === "ar" ? "إضافة" : "Add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم المختصر" : "Short Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm text-gray-500 w-8">{item.displayOrder}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{item.shortName ?? "—"}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive === "true" ? "default" : "secondary"}>
                        {item.isActive === "true" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cities Section ─── */

function CitiesSection({ lang }: { lang: string }) {
  const { data: items = [], isLoading } = useListCities();
  const create = useCreateCity();
  const update = useUpdateCity();
  const remove = useDeleteCity();
  const invalidate = useInvalidateAdmin();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", displayOrder: 1 });

  const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1;

  const reset = () => {
    setForm({ name: "", nameAr: "", displayOrder: nextOrder });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { name: form.name, nameAr: form.nameAr, displayOrder: Number(form.displayOrder) };
    if (editId) {
      update.mutate(
        { id: editId, data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    } else {
      create.mutate(
        { data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    }
  };

  const handleEdit = (item: typeof items[0]) => {
    setForm({ name: item.name, nameAr: item.nameAr, displayOrder: item.displayOrder });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
      remove.mutate({ id }, { onSuccess: invalidate });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{lang === "ar" ? "المحافظات" : "Cities"}</h3>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !editId) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={() => { reset(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              {lang === "ar" ? "إضافة" : "Add"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? (lang === "ar" ? "تعديل محافظة" : "Edit City") : (lang === "ar" ? "إضافة محافظة" : "Add City")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder={lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">
                  {lang === "ar" ? "ترتيب العرض" : "Display Order"}
                </label>
                <Input type="number" min={1} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              </div>
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={handleSubmit} disabled={create.isPending || update.isPending || !form.name || !form.nameAr}>
                {editId ? (lang === "ar" ? "حفظ" : "Save") : (lang === "ar" ? "إضافة" : "Add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm text-gray-500 w-8">{item.displayOrder}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive === "true" ? "default" : "secondary"}>
                        {item.isActive === "true" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Services Section ─── */

function ServicesSection({ lang }: { lang: string }) {
  const { data: items = [], isLoading } = useListServices();
  const create = useCreateService();
  const update = useUpdateService();
  const remove = useDeleteService();
  const invalidate = useInvalidateAdmin();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", displayOrder: 1 });

  const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1;

  const reset = () => {
    setForm({ name: "", nameAr: "", displayOrder: nextOrder });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { name: form.name, nameAr: form.nameAr, displayOrder: Number(form.displayOrder) };
    if (editId) {
      update.mutate(
        { id: editId, data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    } else {
      create.mutate(
        { data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    }
  };

  const handleEdit = (item: typeof items[0]) => {
    setForm({ name: item.name, nameAr: item.nameAr, displayOrder: item.displayOrder });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
      remove.mutate({ id }, { onSuccess: invalidate });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{lang === "ar" ? "الخدمات" : "Services"}</h3>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !editId) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={() => { reset(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              {lang === "ar" ? "إضافة" : "Add"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? (lang === "ar" ? "تعديل خدمة" : "Edit Service") : (lang === "ar" ? "إضافة خدمة" : "Add Service")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder={lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">
                  {lang === "ar" ? "ترتيب العرض" : "Display Order"}
                </label>
                <Input type="number" min={1} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              </div>
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={handleSubmit} disabled={create.isPending || update.isPending || !form.name || !form.nameAr}>
                {editId ? (lang === "ar" ? "حفظ" : "Save") : (lang === "ar" ? "إضافة" : "Add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm text-gray-500 w-8">{item.displayOrder}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive === "true" ? "default" : "secondary"}>
                        {item.isActive === "true" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Areas Section ─── */

function AreasSection({ lang }: { lang: string }) {
  const { data: cities = [] } = useListCities();
  const { data: items = [], isLoading } = useListAreas();
  const create = useCreateArea();
  const update = useUpdateArea();
  const remove = useDeleteArea();
  const invalidate = useInvalidateAdmin();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ cityId: 0, name: "", nameAr: "", displayOrder: 1 });

  const nextOrderForCity = (cityId: number) => {
    const siblings = items.filter((i) => i.cityId === cityId);
    return siblings.length > 0 ? Math.max(...siblings.map((i) => i.displayOrder)) + 1 : 1;
  };

  const reset = () => {
    const firstCityId = cities[0]?.id ?? 0;
    setForm({ cityId: firstCityId, name: "", nameAr: "", displayOrder: nextOrderForCity(firstCityId) });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { cityId: Number(form.cityId), name: form.name, nameAr: form.nameAr, displayOrder: Number(form.displayOrder) };
    if (editId) {
      update.mutate(
        { id: editId, data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    } else {
      create.mutate(
        { data: payload },
        { onSuccess: () => { invalidate(); setOpen(false); reset(); } }
      );
    }
  };

  const handleEdit = (item: typeof items[0]) => {
    setForm({ cityId: item.cityId, name: item.name, nameAr: item.nameAr, displayOrder: item.displayOrder });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
      remove.mutate({ id }, { onSuccess: invalidate });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{lang === "ar" ? "المناطق" : "Areas"}</h3>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && !editId) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={() => { reset(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              {lang === "ar" ? "إضافة" : "Add"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? (lang === "ar" ? "تعديل منطقة" : "Edit Area") : (lang === "ar" ? "إضافة منطقة" : "Add Area")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <select
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                value={form.cityId}
                onChange={(e) => {
                  const newCityId = Number(e.target.value);
                  setForm((f) => ({ ...f, cityId: newCityId, displayOrder: editId ? f.displayOrder : nextOrderForCity(newCityId) }));
                }}
              >
                <option value="">{lang === "ar" ? "اختر المحافظة" : "Select City"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Input placeholder={lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">
                  {lang === "ar" ? "ترتيب العرض" : "Display Order"}
                </label>
                <Input type="number" min={1} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              </div>
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={handleSubmit} disabled={create.isPending || update.isPending || !form.name || !form.nameAr || !form.cityId}>
                {editId ? (lang === "ar" ? "حفظ" : "Save") : (lang === "ar" ? "إضافة" : "Add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "المحافظة" : "City"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm text-gray-500 w-8">{item.displayOrder}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>{cities.find((c) => c.id === item.cityId)?.name ?? item.cityId}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive === "true" ? "default" : "secondary"}>
                        {item.isActive === "true" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CentersSection ─── */
const SUB_TYPE_LABELS: Record<string, string> = {
  POLY_CLINIC: "Poly Clinic",
  HOSPITAL: "Hospital",
  LAB: "Lab",
  SCAN_CENTER: "Scan Center",
};

function CentersSection({ lang }: { lang: string }) {
  const isRTL = lang === "ar";
  const qc = useQueryClient();

  const { data: centers = [], isLoading } = useQuery<AdminMedicalCenter[]>({
    queryKey: ["adminMedicalCenters"],
    queryFn: getAdminMedicalCenters,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveCenter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminMedicalCenters"] }),
  });

  const vezeetaMutation = useMutation({
    mutationFn: (id: number) => toggleCenterVezeeta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminMedicalCenters"] }),
  });

  const pending = centers.filter((c) => !c.isApproved);
  const approved = centers.filter((c) => c.isApproved);

  const renderRow = (c: AdminMedicalCenter) => (
    <TableRow key={c.id}>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{c.name}{c.nameAr ? ` / ${c.nameAr}` : ""}</p>
          <p className="text-xs text-gray-400">{c.email ?? c.userPhone ?? "—"}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs">{c.type}</span>
          {c.subType && <span className="text-xs text-gray-400">{SUB_TYPE_LABELS[c.subType] ?? c.subType}</span>}
        </div>
      </TableCell>
      <TableCell>
        {c.isApproved
          ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{isRTL ? "معتمد" : "Approved"}</Badge>
          : <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{isRTL ? "قيد المراجعة" : "Pending"}</Badge>
        }
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{c.subscriptionStatus}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {!c.isApproved && (
            <Button
              size="sm"
              className="h-7 text-xs bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] gap-1"
              onClick={() => approveMutation.mutate(c.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="h-3 w-3" />
              {isRTL ? "اعتماد" : "Approve"}
            </Button>
          )}
          <Button
            size="sm"
            variant={c.hasVezeetaProfile ? "default" : "outline"}
            className={`h-7 text-xs gap-1 ${c.hasVezeetaProfile ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-600"}`}
            onClick={() => vezeetaMutation.mutate(c.id)}
            disabled={vezeetaMutation.isPending}
            title={isRTL ? "تبديل حالة Vezeeta" : "Toggle Vezeeta profile"}
          >
            <Globe className="h-3 w-3" />
            Vezeeta
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{isRTL ? "المراكز الطبية" : "Medical Centers"}</h2>
        <Badge variant="outline" className="text-xs">{isRTL ? `${centers.length} مركز` : `${centers.length} total`}</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : centers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">{isRTL ? "لا توجد مراكز طبية مسجلة بعد." : "No medical centers registered yet."}</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {isRTL ? `قيد المراجعة (${pending.length})` : `Pending Approval (${pending.length})`}
              </h3>
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isRTL ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRTL ? "الاشتراك" : "Subscription"}</TableHead>
                      <TableHead>{isRTL ? "إجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{pending.map(renderRow)}</TableBody>
                </Table>
              </div>
            </div>
          )}

          {approved.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Check className="h-4 w-4" />
                {isRTL ? `معتمدة (${approved.length})` : `Approved (${approved.length})`}
              </h3>
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isRTL ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRTL ? "الاشتراك" : "Subscription"}</TableHead>
                      <TableHead>{isRTL ? "إجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{approved.map(renderRow)}</TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── ReportsSection ─── */

const CHART_COLORS = ["#D4A853", "#0F172A", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function ReportsSection({ lang }: { lang: string }) {
  const isRTL = lang === "ar";

  const [doctorId, setDoctorId] = useState("");
  const [medicalCenterId, setMedicalCenterId] = useState("");
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = useMemo(() => {
    const p: {
      doctorId?: number;
      medicalCenterId?: number;
      cityId?: number;
      areaId?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {};
    if (doctorId) p.doctorId = Number(doctorId);
    if (medicalCenterId) p.medicalCenterId = Number(medicalCenterId);
    if (cityId) p.cityId = Number(cityId);
    if (areaId) p.areaId = Number(areaId);
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    return Object.keys(p).length > 0 ? p : undefined;
  }, [doctorId, medicalCenterId, cityId, areaId, dateFrom, dateTo]);

  const { data, isLoading } = useGetReports(params);
  const { data: doctors = [] } = useListDoctors();
  const { data: cities = [] } = useListCities();
  const { data: areas = [] } = useListAreas();
  const { data: centers = [] } = useQuery<AdminMedicalCenter[]>({ queryKey: ["adminMedicalCenters"], queryFn: getAdminMedicalCenters });

  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ value: String(d.id), label: d.name ?? String(d.id) })),
    [doctors],
  );
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.nameAr ?? c.name ?? String(c.id) })),
    [cities],
  );
  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: String(a.id), label: a.nameAr ?? a.name ?? String(a.id) })),
    [areas],
  );
  const centerOptions = useMemo(
    () => centers.map((c) => ({ value: String(c.id), label: c.nameAr ?? c.name ?? String(c.id) })),
    [centers],
  );

  const hasFilters = !!(doctorId || medicalCenterId || cityId || areaId || dateFrom || dateTo);
  const clearFilters = () => {
    setDoctorId("");
    setMedicalCenterId("");
    setCityId("");
    setAreaId("");
    setDateFrom("");
    setDateTo("");
  };

  const r = data;

  const overviewCards = useMemo(() => {
    if (!r) return [];
    return [
      { label: isRTL ? "إجمالي المستخدمين" : "Total Users", value: r.overview.totalUsers, color: "text-blue-600" },
      { label: isRTL ? "الأطباء" : "Doctors", value: r.overview.totalDoctors, color: "text-emerald-600" },
      { label: isRTL ? "المرضى" : "Patients", value: r.overview.totalPatients, color: "text-indigo-600" },
      { label: isRTL ? "المراكز الطبية" : "Medical Centers", value: r.overview.totalMedicalCenters, color: "text-amber-600" },
      { label: isRTL ? "الحجوزات" : "Appointments", value: r.overview.totalAppointments, color: "text-teal-600" },
      { label: isRTL ? "التقييمات" : "Reviews", value: r.overview.totalReviews, color: "text-rose-600" },
      { label: isRTL ? "العيادات" : "Clinics", value: r.overview.totalClinics, color: "text-cyan-600" },
      { label: isRTL ? "الدفعات" : "Payments", value: r.overview.totalPayments, color: "text-violet-600" },
      { label: isRTL ? "إجمالي الإيرادات" : "Total Revenue", value: r.overview.totalRevenue.toLocaleString(), color: "text-green-600", suffix: " EGP" },
      { label: isRTL ? "الحجوزات المؤكدة" : "Confirmed", value: r.overview.confirmedAppointments, color: "text-emerald-600" },
      { label: isRTL ? "المعلقة" : "Cancelled", value: r.overview.rejectedAppointments, color: "text-red-600" },
      { label: isRTL ? "قيد التنفيذ" : "Pending", value: r.overview.pendingAppointments, color: "text-yellow-600" },
      { label: isRTL ? "المنتهية" : "Completed", value: r.overview.completedAppointments, color: "text-blue-600" },
    ];
  }, [r, isRTL]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">{isRTL ? "جاري التحميل..." : "Loading reports..."}</div>;
  }

  if (!r) {
    return <div className="p-8 text-center text-gray-500">{isRTL ? "لا توجد بيانات" : "No data available"}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{isRTL ? "عوامل التصفية" : "Filter Reports"}</h3>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
              {isRTL ? "إزالة التصفية" : "Clear filters"}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchableCombobox
            value={doctorId}
            onValueChange={setDoctorId}
            options={doctorOptions}
            placeholder={isRTL ? "اختر الطبيب..." : "Select doctor..."}
            searchPlaceholder={isRTL ? "بحث عن الطبيب..." : "Search doctor..."}
            emptyMessage={isRTL ? "لا يوجد طبب" : "No doctors found"}
          />
          <SearchableCombobox
            value={medicalCenterId}
            onValueChange={setMedicalCenterId}
            options={centerOptions}
            placeholder={isRTL ? "اختر مركز طبي..." : "Select medical center..."}
            searchPlaceholder={isRTL ? "بحث عن مركز..." : "Search center..."}
            emptyMessage={isRTL ? "لا يوجد مركز" : "No centers found"}
          />
          <SearchableCombobox
            value={cityId}
            onValueChange={setCityId}
            options={cityOptions}
            placeholder={isRTL ? "اختر المدينة..." : "Select city..."}
            searchPlaceholder={isRTL ? "بحث عن المدينة..." : "Search city..."}
            emptyMessage={isRTL ? "لا توجد مدينة" : "No cities found"}
          />
          <SearchableCombobox
            value={areaId}
            onValueChange={setAreaId}
            options={areaOptions}
            placeholder={isRTL ? "اختر المنطقة..." : "Select area..."}
            searchPlaceholder={isRTL ? "بحث عن المنطقة..." : "Search area..."}
            emptyMessage={isRTL ? "لا توجد منطقة" : "No areas found"}
          />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? "من تاريخ" : "From date"}</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? "إلى تاريخ" : "To date"}</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {overviewCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              {card.suffix || ""}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors by Specialty */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "الأطباء حسب التخصص" : "Doctors by Specialty"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.doctorsBySpecialty.slice(0, 10)} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#D4A853" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctors by City */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "الأطباء حسب المدينة" : "Doctors by City"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.doctorsByCity.slice(0, 10)} margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctors by Status — Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "الأطباء حسب الحالة" : "Doctors by Status"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={r.doctorsByStatus} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                  {r.doctorsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Status — Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "الحجوزات حسب الحالة" : "Appointments by Status"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={r.appointmentsByStatus} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                  {r.appointmentsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments & Payments Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "الحجوزات والدفعات شهرياً" : "Appointments & Payments (Monthly)"}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={r.appointmentsByMonth.map((a) => {
                  const p = r.paymentsByMonth.find((pm) => pm.label === a.label);
                  return { label: a.label, appointments: a.count, payments: p?.count ?? 0, revenue: p?.revenue ?? 0 };
                })}
                margin={{ left: 16, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} dot={false} name={isRTL ? "الحجوزات" : "Appointments"} />
                <Line yAxisId="right" type="monotone" dataKey="payments" stroke="#D4A853" strokeWidth={2} dot={false} name={isRTL ? "الدفعات" : "Payments"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reviews by Rating */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "التقييمات حسب التقييم" : "Reviews by Rating"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.reviewsByRating} margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Centers by City */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "المراكز الطبية حسب المدينة" : "Medical Centers by City"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.centersByCity.slice(0, 10)} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {isRTL ? "التسجيلات الجديدة (آخر 30 يوماً)" : "Recent Signups (Last 30 Days)"}
          </h3>
          {r.recentSignups.length === 0 ? (
            <p className="text-gray-500 text-sm">{isRTL ? "لا توجد تسجيلات جديدة" : "No recent signups"}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {r.recentSignups.map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
