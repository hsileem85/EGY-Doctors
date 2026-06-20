import { useState, useRef, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
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
  useListAdminNotifications,
  useMarkAdminNotificationRead,
  useClearAdminNotifications,
  getListDoctorsQueryKey,
  getListSpecialtiesQueryKey,
  getListCitiesQueryKey,
  getListAreasQueryKey,
  type Doctor,
  type AdminNotification,
} from "@workspace/api-client-react";

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
} from "lucide-react";
import { adminSearchUser, adminResetUserPassword, getContactSettings, updateContactSettings, type ContactSettings, toggleDoctorActive, getAdminDoctorClinics, type AdminClinic } from "@/lib/api";

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
    markRead.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: ["listAdminNotifications"] }) });
  };

  const handleClear = () => {
    clearAll.mutate(undefined, { onSuccess: () => qc.invalidateQueries({ queryKey: ["listAdminNotifications"] }) });
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
  };
}

/* ─── Admin Login Gate ─── */

const ADMIN_SESSION_KEY = "egy_admin_auth";

function AdminLoginGate() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "koko@123") {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError(lang === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password");
    }
  };

  if (authed) return <AdminDashboard onSignOut={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); setAuthed(false); }} />;

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
              {lang === "ar" ? "اسم المستخدم" : "Username"}
            </label>
            <Input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              className="bg-[#1E293B] border-[#334155] text-white placeholder:text-gray-600 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
              placeholder={lang === "ar" ? "اسم المستخدم" : "Username"}
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {lang === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="bg-[#1E293B] border-[#334155] text-white placeholder:text-gray-600 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] font-semibold"
          >
            {lang === "ar" ? "دخول" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

const tabs = [
  { id: "doctors", label: "Doctors", labelAr: "الأطباء", icon: Users },
  { id: "users", label: "Users", labelAr: "المستخدمون", icon: KeyRound },
  { id: "specialties", label: "Specialties", labelAr: "التخصصات", icon: Stethoscope },
  { id: "cities", label: "Cities", labelAr: "المحافظات", icon: MapPinHouse },
  { id: "areas", label: "Areas", labelAr: "المناطق", icon: MapPin },
  { id: "contact", label: "Contact Info", labelAr: "معلومات التواصل", icon: Globe },
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
    <div className={`min-h-screen bg-[#F8FAFC] ${isRTL ? "font-arabic" : ""}`}>
      {/* Header */}
      <div className="bg-[#0F172A] border-b border-[#D4A853]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#D4A853]/10 text-[#D4A853]"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {lang === "ar" ? tab.labelAr : tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "doctors" && <DoctorsSection lang={lang} />}
        {activeTab === "users" && <UsersSection lang={lang} />}
        {activeTab === "specialties" && <SpecialtiesSection lang={lang} />}
        {activeTab === "cities" && <CitiesSection lang={lang} />}
        {activeTab === "areas" && <AreasSection lang={lang} />}
        {activeTab === "contact" && <ContactInfoSection lang={lang} />}
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

  const incomplete = doctors.filter((d) => d.accountStatus === "incomplete");
  const pending = doctors.filter((d) => d.accountStatus === "pending");
  const approved = doctors.filter((d) => d.accountStatus === "approved");
  const rejected = doctors.filter((d) => d.accountStatus === "rejected");
  const inactive = doctors.filter((d) => (d as unknown as Record<string, unknown>).isActive === false);

  const toggleActive = useMutation({
    mutationFn: (id: number) => toggleDoctorActive(id),
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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Total", labelAr: "الإجمالي", value: doctors.length },
          { label: "Incomplete", labelAr: "غير مكتمل", value: incomplete.length, color: "text-gray-500" },
          { label: "Pending", labelAr: "معلق", value: pending.length, color: "text-yellow-600" },
          { label: "Approved", labelAr: "معتمد", value: approved.length, color: "text-green-600" },
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
