import { useState, useRef, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDoctors,
  useApproveDoctor,
  useRejectDoctor,
  useUpdateDoctorOnboarding,
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
} from "lucide-react";

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
  { id: "specialties", label: "Specialties", labelAr: "التخصصات", icon: Stethoscope },
  { id: "cities", label: "Cities", labelAr: "المحافظات", icon: MapPinHouse },
  { id: "areas", label: "Areas", labelAr: "المناطق", icon: MapPin },
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
        {activeTab === "specialties" && <SpecialtiesSection lang={lang} />}
        {activeTab === "cities" && <CitiesSection lang={lang} />}
        {activeTab === "areas" && <AreasSection lang={lang} />}
      </div>
    </div>
  );
}

/* ─── Doctors Section ─── */

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
        {row(isAr ? "التخصص" : "Specialty", (doctor as unknown as Record<string, string>).specialtyName)}
        {row(isAr ? "المدينة" : "City", (doctor as unknown as Record<string, string>).cityName)}
        {row(isAr ? "المنطقة" : "Area", (doctor as unknown as Record<string, string>).areaName)}
        {row(isAr ? "البريد الإلكتروني" : "Email", (doctor as unknown as Record<string, string>).email)}
        {row(isAr ? "رقم الموبايل" : "Mobile", (doctor as unknown as Record<string, string>).phone)}
        {row(isAr ? "رقم الترخيص" : "License Number", doctor.license)}
        {row(isAr ? "رقم نقابة الأطباء" : "Medical Syndicate No.", (doctor as unknown as Record<string, string>).syndicateNumber)}
        {row(isAr ? "سنوات الخبرة" : "Experience (years)", doctor.experience)}
        {row(isAr ? "رسوم الكشف" : "Consultation Fee (EGP)", doctor.fee)}
        {row(isAr ? "عنوان العيادة" : "Clinic Address", doctor.clinicAddress)}
        {row(isAr ? "النبذة التعريفية" : "Bio", doctor.bio)}
        {row(isAr ? "حالة الحساب" : "Account Status", doctor.accountStatus)}
        {row(isAr ? "حالة الإعداد" : "Onboarding Status", doctor.onboardingStatus)}
        {row(isAr ? "تاريخ التسجيل" : "Registered", new Date(doctor.createdAt).toLocaleDateString())}
      </div>
    </DialogContent>
  );
}

function DoctorsSection({ lang }: { lang: string }) {
  const { data: doctors = [], isLoading } = useListDoctors();
  const approve = useApproveDoctor();
  const reject = useRejectDoctor();
  const updateOnboarding = useUpdateDoctorOnboarding();
  const deleteDoc = useDeleteDoctor();
  const invalidate = useInvalidateAdmin();
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null as AdminDoctor | null);

  const pending = doctors.filter((d) => d.accountStatus === "pending");
  const approved = doctors.filter((d) => d.accountStatus === "approved");
  const rejected = doctors.filter((d) => d.accountStatus === "rejected");

  const handleApprove = (id: number) => {
    approve.mutate({ id }, { onSuccess: invalidate });
  };
  const handleReject = (id: number) => {
    reject.mutate({ id }, { onSuccess: invalidate });
  };
  const handleOnboarding = (id: number, status: "pending" | "approved" | "rejected") => {
    updateOnboarding.mutate({ id, data: { status } }, { onSuccess: invalidate });
  };
  const handleDelete = (id: number, name: string) => {
    if (confirm(lang === "ar" ? `هل أنت متأكد من حذف الطبيب "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.` : `Delete doctor "${name}"? This cannot be undone.`)) {
      deleteDoc.mutate({ id }, { onSuccess: invalidate });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", labelAr: "الإجمالي", value: doctors.length },
          { label: "Pending", labelAr: "معلق", value: pending.length, color: "text-yellow-600" },
          { label: "Approved", labelAr: "معتمد", value: approved.length, color: "text-green-600" },
          { label: "Rejected", labelAr: "مرفوض", value: rejected.length, color: "text-red-600" },
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
                    <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{lang === "ar" ? "الحساب" : "Account"}</TableHead>
                    <TableHead>{lang === "ar" ? "الإعداد" : "Onboarding"}</TableHead>
                    <TableHead>{lang === "ar" ? "التخصص" : "Specialty"}</TableHead>
                    <TableHead>{lang === "ar" ? "المدينة" : "City"}</TableHead>
                    <TableHead>{lang === "ar" ? "الترخيص" : "License"}</TableHead>
                    <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadge(doctor.accountStatus)}>
                          {doctor.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadge(doctor.onboardingStatus)}>
                          {doctor.onboardingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {(doctor as unknown as Record<string, string>).specialtyName ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {(doctor as unknown as Record<string, string>).cityName ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-mono">
                        {doctor.license ?? "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            onClick={() => setSelectedDoctor(doctor as AdminDoctor)}
                            title={lang === "ar" ? "عرض التفاصيل" : "View details"}
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
                                title={lang === "ar" ? "قبول" : "Approve"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(doctor.id)}
                                disabled={reject.isPending}
                                title={lang === "ar" ? "رفض" : "Reject"}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                              handleOnboarding(
                                doctor.id,
                                doctor.onboardingStatus === "pending" ? "approved" : "pending"
                              )
                            }
                            disabled={updateOnboarding.isPending}
                            title={lang === "ar" ? "تحديث الإعداد" : "Toggle onboarding"}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(doctor.id, doctor.name)}
                            disabled={deleteDoc.isPending}
                            title={lang === "ar" ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
