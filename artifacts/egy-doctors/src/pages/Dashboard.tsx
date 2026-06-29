import { useState, useEffect } from "react";
import { CalendarDays, Users, TrendingUp, Search, PenSquare, FileText, Video, MessageSquare, Plus, Clock, LogOut, XCircle, UserCheck, UserCog, Phone, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, Settings, Globe, Bell, Mail, MessageSquare as Sms, Newspaper, CreditCard, Lock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments, type ApiAppointment, submitDoctorForReview,
  getAssistants, createAssistant, toggleAssistant, deleteAssistant,
  getDoctorPatients, getMyDoctorProfile, updateAppointmentStatus,
  getPreferences, updatePreferences, type UserPreferences,
  getMyMagazinePosts, createMagazinePost, deleteMagazinePost, type ApiMagazinePost,
  type ApiAssistant, type ApiPatientRecord,
  getBillingInfo, checkout, startTrial, validateVoucher,
  initiatePaymobPayment, type PaymobInitiateResponse,
  type BillingInfo, type VoucherValidation, type PlanType,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Tab = "appointments" | "patients" | "assistants" | "publications" | "preferences" | "billing";

function statusBadge(status: ApiAppointment["status"], t: { dashboard: { confirmed: string } }) {
  const map: Record<ApiAppointment["status"], string> = {
    confirmed: "bg-[#D4A853]/5 text-[#D4A853] border-[#D4A853]/20",
    pending: "bg-blue-50 text-blue-600 border-blue-200",
    pending_confirmation: "bg-orange-50 text-orange-600 border-orange-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    completed: "bg-green-50 text-green-600 border-green-200",
  };
  const labels: Record<ApiAppointment["status"], string> = {
    confirmed: t.dashboard.confirmed,
    pending: "Pending",
    pending_confirmation: "Awaiting Confirmation",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  return <Badge variant="outline" className={map[status]}>{labels[status]}</Badge>;
}

function IncompleteScreen({ doctorName, signOut, isRTL, refreshUser }: {
  doctorName: string;
  signOut: () => void;
  isRTL: boolean;
  refreshUser: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitDoctorForReview();
      await refreshUser();
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(isRTL ? "حدث خطأ، يرجى المحاولة مجدداً." : msg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{isRTL ? "تم إرسال طلبك!" : "Application Submitted!"}</h1>
          <p className="text-gray-500 mb-8">{isRTL ? "سيتم مراجعة طلبك وإخطارك بالبريد الإلكتروني." : "Your application is under review. You'll be notified by email."}</p>
          <Button variant="outline" className="gap-2 text-gray-600" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            {isRTL ? "تسجيل الخروج" : "Sign Out"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 rounded-full bg-[#D4A853]/10 flex items-center justify-center mx-auto mb-6">
          <UserCheck className="w-10 h-10 text-[#D4A853]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{isRTL ? `مرحباً ${doctorName}!` : `Welcome, ${doctorName}!`}</h1>
        <p className="text-gray-500 mb-2">{isRTL ? "أكمل ملفك الشخصي ثم أرسل طلبك للمراجعة." : "Complete your profile then submit for review to start accepting appointments."}</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/edit-profile">
            <Button variant="outline" className="gap-2" data-testid="button-go-to-profile-setup">
              {isRTL ? "إكمال الملف الشخصي" : "Complete Profile"}
            </Button>
          </Link>
          <Button className="gap-2 bg-[#D4A853] text-[#0F172A]" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (isRTL ? "جاري الإرسال..." : "Submitting...") : (isRTL ? "إرسال للمراجعة" : "Submit for Review")}
          </Button>
          <Button variant="ghost" className="gap-2 text-gray-500" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            {isRTL ? "خروج" : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PendingScreen({ status, doctorName, signOut, isRTL }: {
  status: string;
  doctorName: string;
  signOut: () => void;
  isRTL: boolean;
}) {
  const isRejected = status === "rejected";
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isRejected ? "bg-red-100" : "bg-[#D4A853]/10"}`}>
          {isRejected
            ? <XCircle className="w-10 h-10 text-red-500" />
            : <Clock className="w-10 h-10 text-[#D4A853]" />
          }
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isRejected ? (isRTL ? "تم رفض طلبك" : "Application Not Approved") : (isRTL ? "حسابك قيد المراجعة" : "Your Account is Under Review")}
        </h1>
        <p className="text-gray-500 mb-2">{isRTL ? `مرحباً، ${doctorName}` : `Hello, ${doctorName}`}</p>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {isRejected
            ? (isRTL ? "نأسف، لم يتم قبول طلب تسجيلك. يرجى التواصل مع الدعم." : "We're sorry, your registration was not approved. Please contact support.")
            : (isRTL ? "شكراً لتسجيلك. يراجع فريقنا طلبك وسيتم إخطارك بالبريد الإلكتروني عند القبول." : "Thank you for registering. Our team is reviewing your application and you'll be notified by email once approved.")}
        </p>
        <Button variant="outline" className="gap-2 text-gray-600" onClick={signOut} data-testid="button-pending-signout">
          <LogOut className="w-4 h-4" />
          {isRTL ? "تسجيل الخروج" : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

/* ── Assistants Tab ── */
function AssistantsTab({ isRTL, doctorId }: { isRTL: boolean; doctorId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", clinicId: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ["assistants", doctorId],
    queryFn: getAssistants,
  });

  const { data: profile } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyDoctorProfile,
  });

  const clinics = profile?.clinics ?? [];

  const createMut = useMutation({
    mutationFn: createAssistant,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assistants"] }); setShowForm(false); setForm({ name: "", phone: "", email: "", password: "", clinicId: "" }); setFormError(null); },
    onError: (e: Error) => setFormError(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: toggleAssistant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assistants"] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAssistant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assistants"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isRTL ? "إدارة المساعدين" : "Manage Assistants"}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{isRTL ? "أنشئ حسابات مساعدين مرتبطة بعيادات محددة" : "Create assistant accounts linked to specific clinics"}</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} className="gap-2 bg-[#D4A853] text-[#0F172A] hover:bg-[#D4A853]/90">
          <Plus className="h-4 w-4" />
          {isRTL ? "إضافة مساعد" : "Add Assistant"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-[#D4A853]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{isRTL ? "حساب مساعد جديد" : "New Assistant Account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isRTL ? "الاسم" : "Name"}</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isRTL ? "اسم المساعد" : "Assistant name"} />
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "رقم الجوال" : "Mobile"}</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+201001234567" />
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{isRTL ? "العيادة المخصصة" : "Assigned Clinic"}</Label>
                <select
                  value={form.clinicId}
                  onChange={e => setForm(f => ({ ...f, clinicId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30"
                >
                  <option value="">{isRTL ? "اختر عيادة..." : "Select a clinic..."}</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name || `Clinic #${c.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => createMut.mutate({ name: form.name, phone: form.phone, email: form.email || undefined, password: form.password, clinicId: Number(form.clinicId) })}
                disabled={createMut.isPending || !form.name || !form.phone || !form.password || !form.clinicId}
                className="bg-[#D4A853] text-[#0F172A]"
              >
                {createMut.isPending ? (isRTL ? "جاري الإنشاء..." : "Creating...") : (isRTL ? "إنشاء الحساب" : "Create Account")}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setFormError(null); }}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isRTL ? "الجوال" : "Mobile"}</TableHead>
                <TableHead>{isRTL ? "العيادة" : "Clinic"}</TableHead>
                <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                <TableHead className="text-right">{isRTL ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">{isRTL ? "جار التحميل..." : "Loading..."}</TableCell></TableRow>
              ) : assistants.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">{isRTL ? "لا يوجد مساعدون حتى الآن" : "No assistants yet"}</TableCell></TableRow>
              ) : (
                assistants.map((a: ApiAssistant) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-gray-600">{a.phone}</TableCell>
                    <TableCell className="text-gray-600">{a.clinicNameEn || a.clinicName || `#${a.assistantClinicId}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={a.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}>
                        {a.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleMut.mutate(a.id)}
                          className="p-1.5 rounded text-gray-500 hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors"
                          title={a.isActive ? (isRTL ? "تعطيل" : "Deactivate") : (isRTL ? "تفعيل" : "Activate")}
                        >
                          {a.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { if (confirm(isRTL ? "هل تريد حذف هذا المساعد؟" : "Delete this assistant?")) deleteMut.mutate(a.id); }}
                          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={isRTL ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Patients Tab ── */
function PatientsTab({ isRTL }: { isRTL: boolean }) {
  const [search, setSearch] = useState("");
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["doctor-patients"],
    queryFn: getDoctorPatients,
  });

  const filtered = patients.filter((p: ApiPatientRecord) =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientPhone.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isRTL ? "سجل المرضى" : "Patient Directory"}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{isRTL ? "جميع المرضى الذين زاروا عيادتك" : "All patients who have visited your clinics"}</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <div className="relative max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isRTL ? "بحث باسم أو رقم..." : "Search by name or phone..."}
              className="ps-9 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? "اسم المريض" : "Patient Name"}</TableHead>
                <TableHead>{isRTL ? "الجوال" : "Mobile"}</TableHead>
                <TableHead>{isRTL ? "آخر زيارة" : "Last Visit"}</TableHead>
                <TableHead>{isRTL ? "عدد الزيارات" : "Total Visits"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">{isRTL ? "جار التحميل..." : "Loading..."}</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">{isRTL ? "لا يوجد مرضى حتى الآن" : "No patients yet"}</TableCell></TableRow>
              ) : (
                filtered.map((p: ApiPatientRecord, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.patientName}</TableCell>
                    <TableCell>
                      <a href={`tel:${p.patientPhone}`} className="flex items-center gap-1 text-gray-600 hover:text-[#D4A853] transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        {p.patientPhone}
                      </a>
                    </TableCell>
                    <TableCell className="text-gray-600">{p.lastVisit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{p.totalVisits}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Preferences Tab ── */
function PreferencesTab({ isRTL }: { isRTL: boolean }) {
  const { setLang } = useLanguage();
  const qc = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
  });

  const [form, setForm] = useState<Partial<UserPreferences>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (prefs) setForm(prefs);
  }, [prefs]);

  const mut = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updated) => {
      qc.setQueryData(["preferences"], updated);
      if (updated.siteLanguage) setLang(updated.siteLanguage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const current = { ...prefs, ...form };

  function LangRadio({ field, label, labelAr }: { field: "siteLanguage" | "notificationLanguage"; label: string; labelAr: string }) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">{isRTL ? labelAr : label}</Label>
        <div className="flex gap-3">
          {(["en", "ar"] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setForm(f => ({ ...f, [field]: v }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                current[field] === v
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="text-base">{v === "en" ? "🇬🇧" : "🇪🇬"}</span>
              {v === "en" ? (isRTL ? "الإنجليزية" : "English") : (isRTL ? "العربية" : "Arabic")}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="py-12 text-center text-gray-400">{isRTL ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "إعدادات الحساب" : "Account Preferences"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isRTL ? "خصّص تجربتك وخيارات الإشعارات." : "Customize your experience and notification options."}</p>
      </div>

      <div className="space-y-6">
        {/* Site Language */}
        <Card className="border-0 shadow-sm shadow-gray-200/60">
          <CardHeader className="pb-3 border-b bg-gray-50/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Globe className="h-4 w-4 text-primary" />
              {isRTL ? "لغة الموقع" : "Site Language"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <LangRadio field="siteLanguage" label="Display language" labelAr="لغة العرض" />
          </CardContent>
        </Card>

        {/* Notification Language */}
        <Card className="border-0 shadow-sm shadow-gray-200/60">
          <CardHeader className="pb-3 border-b bg-gray-50/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Bell className="h-4 w-4 text-primary" />
              {isRTL ? "إعدادات الإشعارات" : "Notification Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <LangRadio field="notificationLanguage" label="Email notification language" labelAr="لغة إشعارات البريد الإلكتروني" />

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">{isRTL ? "طرق الإشعار" : "Notification Methods"}</Label>
              <div className="space-y-2.5">
                {([
                  { key: "notifyViaEmail" as const, icon: <Mail className="h-4 w-4" />, label: "Email", labelAr: "بريد إلكتروني", note: "", noteAr: "" },
                  { key: "notifyViaSms" as const, icon: <Sms className="h-4 w-4" />, label: "SMS", labelAr: "رسالة قصيرة", note: "coming soon", noteAr: "قريباً" },
                  { key: "notifyViaWhatsApp" as const, icon: <Bell className="h-4 w-4" />, label: "WhatsApp", labelAr: "واتساب", note: "coming soon", noteAr: "قريباً" },
                ] as const).map(m => (
                  <label
                    key={m.key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!(current[m.key])}
                      onChange={e => setForm(f => ({ ...f, [m.key]: e.target.checked }))}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-gray-500">{m.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{isRTL ? m.labelAr : m.label}</span>
                    {m.note && <span className="text-xs text-gray-400 italic ms-auto">{isRTL ? m.noteAr : m.note}</span>}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => mut.mutate(form)}
            disabled={mut.isPending}
            className="min-w-[120px]"
          >
            {mut.isPending ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">{isRTL ? "✓ تم الحفظ" : "✓ Saved"}</span>}
          {mut.isError && <span className="text-sm text-red-500">{isRTL ? "حدث خطأ" : "Failed to save"}</span>}
        </div>
      </div>
    </div>
  );
}

function PublicationsTab({ isRTL }: { isRTL: boolean }) {
  const qc = useQueryClient();
  const [type, setType] = useState<"article" | "tip" | "video">("article");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: posts = [], isLoading } = useQuery<ApiMagazinePost[]>({
    queryKey: ["myPosts"],
    queryFn: getMyMagazinePosts,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if ((type === "article" || type === "tip") && !content.trim()) {
      setFormError(isRTL ? "محتوى المنشور مطلوب" : "Content is required");
      return;
    }
    if (type === "video" && !mediaUrl.trim()) {
      setFormError(isRTL ? "رابط الفيديو مطلوب" : "Video URL is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createMagazinePost({
        type,
        title: title.trim() || null,
        content: type !== "video" ? (content.trim() || null) : null,
        mediaUrl: type === "video" ? (mediaUrl.trim() || null) : null,
      });
      setTitle(""); setContent(""); setMediaUrl("");
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["magazinePosts"] });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteMagazinePost(id);
    qc.invalidateQueries({ queryKey: ["myPosts"] });
    qc.invalidateQueries({ queryKey: ["magazinePosts"] });
  }

  const typeLabels = {
    article: isRTL ? "مقال" : "Article",
    tip: isRTL ? "نصيحة" : "Quick Tip",
    video: isRTL ? "فيديو" : "Video",
  };

  const typeColors: Record<string, string> = {
    article: "bg-blue-50 text-blue-600 border-blue-200",
    tip: "bg-amber-50 text-amber-600 border-amber-200",
    video: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "المنشورات" : "My Publications"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isRTL ? "انشر مقالات ونصائح وفيديوهات للمرضى" : "Share articles, tips, and videos with your patients"}</p>
      </div>

      {/* Create form */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 rounded-t-xl pb-4">
          <CardTitle className="text-base">{isRTL ? "منشور جديد" : "New Post"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(["article", "tip", "video"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    type === t ? typeColors[t] : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {t === "article" ? <FileText className="h-3.5 w-3.5" /> : t === "video" ? <Video className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  {typeLabels[t]}
                </button>
              ))}
            </div>

            {(type === "article" || type === "video") && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {isRTL ? "العنوان" : "Title"}
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={type === "article" ? (isRTL ? "عنوان المقال" : "Article title") : (isRTL ? "عنوان الفيديو" : "Video title")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {type !== "video" ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {type === "tip" ? (isRTL ? "نص النصيحة" : "Tip Content") : (isRTL ? "محتوى المقال" : "Article Content")}
                  <span className="text-red-400"> *</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  placeholder={type === "tip" ? (isRTL ? "اكتب نصيحتك هنا..." : "Write your medical tip here...") : (isRTL ? "اكتب محتوى مقالك هنا..." : "Write your article content here...")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {isRTL ? "رابط الفيديو" : "Video URL"}<span className="text-red-400"> *</span>
                </label>
                <input
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder={isRTL ? "الصق رابطاً من يوتيوب أو تيك توك أو إنستغرام أو فيسبوك" : "Paste link from YouTube, TikTok, Instagram, or Facebook"}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {formError && <p className="text-red-500 text-xs">{formError}</p>}

            <Button type="submit" disabled={isSubmitting} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {isSubmitting ? (isRTL ? "جارٍ النشر..." : "Publishing...") : (isRTL ? "نشر" : "Publish")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts list */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 rounded-t-xl pb-4">
          <CardTitle className="text-base">
            {isRTL ? "منشوراتي" : "My Posts"}
            <span className="text-gray-400 font-normal text-sm ms-2">({posts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-gray-400 text-sm">{isRTL ? "جار التحميل..." : "Loading..."}</div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <PenSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{isRTL ? "لا توجد منشورات بعد. ابدأ بنشر أول مقال!" : "No posts yet. Publish your first post above!"}</p>
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => (
                <div key={post.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    post.type === "article" ? "bg-blue-50 text-blue-600" :
                    post.type === "video" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {post.type === "article" ? <FileText className="h-4 w-4" /> :
                     post.type === "video" ? <Video className="h-4 w-4" /> :
                     <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {post.title && <h4 className="font-medium text-gray-900 text-sm truncate">{post.title}</h4>}
                    {post.content && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{post.content}</p>}
                    {post.mediaUrl && <p className="text-blue-500 text-xs mt-0.5 truncate">{post.mediaUrl}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] h-4 ${typeColors[post.type]}`}>
                        {typeLabels[post.type]}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                    title={isRTL ? "حذف" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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

  const { data, isLoading } = useQuery<BillingInfo>({
    queryKey: ["billingInfo"],
    queryFn: getBillingInfo,
  });

  const trialMut = useMutation({
    mutationFn: startTrial,
    onSuccess: () => { setSuccess(true); qc.invalidateQueries({ queryKey: ["billingInfo"] }); },
  });

  const checkoutMut = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      setSuccess(true);
      setVoucherResult(null);
      setVoucherInput("");
      qc.invalidateQueries({ queryKey: ["billingInfo"] });
    },
  });

  const initiateMut = useMutation({
    mutationFn: initiatePaymobPayment,
    onSuccess: (data) => {
      setPaymentGatewayError("");
      setPaymentModal(data);
    },
    onError: (err: Error) => {
      setPaymentGatewayError(err.message || (isRTL ? "فشل بدء الدفع. حاول مرة أخرى." : "Failed to start payment. Please try again."));
    },
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as { type?: string; success?: boolean } | null;
      if (data?.type === "PAYMOB_RESULT") {
        setPaymentModal(null);
        if (data.success) {
          setSuccess(true);
          qc.invalidateQueries({ queryKey: ["billingInfo"] });
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
    MONTHS_3: { label: "3 Months",  labelAr: "3 أشهر",      price: data?.price3Months ?? 800,  months: 3 },
    MONTHS_6: { label: "6 Months",  labelAr: "6 أشهر",      price: data?.price6Months ?? 1500, months: 6,  badge: isRTL ? "الأكثر شيوعاً" : "Most Popular" },
    YEARLY:   { label: "1 Year",    labelAr: "سنة كاملة",   price: data?.price1Year   ?? 2500, months: 12, badge: isRTL ? "أفضل قيمة"     : "Best Value" },
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

  if (isLoading) return <div className="py-12 text-center text-gray-400 text-sm">{isRTL ? "جار التحميل..." : "Loading..."}</div>;

  const planLabel = (plan: string) => {
    if (plan === "MONTHS_3") return isRTL ? "3 أشهر" : "3 Months";
    if (plan === "MONTHS_6") return isRTL ? "6 أشهر" : "6 Months";
    if (plan === "YEARLY")   return isRTL ? "سنة كاملة" : "1 Year";
    if (plan === "TRIAL")    return isRTL ? "تجريبي" : "Free Trial";
    return plan;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "الاشتراك والفاتورة" : "Subscription & Billing"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isRTL ? "إدارة اشتراكك في المنصة" : "Manage your platform subscription"}</p>
      </div>

      {/* Current status bar */}
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
          <span className="text-base">✓</span>
          {isRTL ? "تم تفعيل اشتراكك بنجاح!" : "Subscription activated successfully!"}
        </div>
      )}

      {/* Free trial banner */}
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
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
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
            {/* Promo code */}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidateVoucher}
                  disabled={isValidating || !voucherInput.trim()}
                  className="shrink-0"
                >
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

            {(initiateMut.isError || paymentGatewayError) && (
              <p className="text-red-500 text-sm">
                {paymentGatewayError || (initiateMut.error instanceof Error ? initiateMut.error.message : (isRTL ? "حدث خطأ." : "An error occurred."))}
              </p>
            )}

            <Button
              onClick={() => {
                setSuccess(false);
                setPaymentGatewayError("");
                initiateMut.mutate({ planType: selectedPlan, voucherCode: voucherResult ? voucherInput.trim() : undefined });
              }}
              disabled={initiateMut.isPending}
              className="w-full gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {initiateMut.isPending
                ? (isRTL ? "جارٍ التحضير..." : "Preparing...")
                : (isRTL ? "ادفع الآن" : "Pay Now")}
            </Button>
            <p className="text-xs text-gray-400">
              {isRTL ? "* ستُحوَّل إلى صفحة الدفع الآمنة." : "* You will be redirected to the secure payment page."}
            </p>
          </CardContent>
        </Card>
      )}

      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <span className="font-semibold text-gray-900">
                {isRTL ? "إتمام الدفع" : "Complete Payment"}
              </span>
              <button
                onClick={() => setPaymentModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none w-7 h-7 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <iframe
              src={paymentModal.iframeUrl}
              title={isRTL ? "نافذة الدفع" : "Payment Window"}
              className="w-full flex-1 border-0"
              style={{ height: 500 }}
              allow="payment"
            />
            <div className="px-5 py-3 border-t bg-gray-50 text-center flex-shrink-0">
              <button
                onClick={() => {
                  setPaymentModal(null);
                  void qc.invalidateQueries({ queryKey: ["billingInfo"] });
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                {isRTL ? "أتممت الدفع؟ اضغط هنا للتحديث" : "Payment completed? Click here to refresh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { t, dir, setLang } = useLanguage();
  const { user, signOut, refreshUser } = useAuth();
  const isRTL = dir === "rtl";

  useEffect(() => {
    if (user?.siteLanguage) setLang(user.siteLanguage);
  }, [user?.siteLanguage]);
  const [activeTab, setActiveTab] = useState<Tab>("appointments");
  const qc = useQueryClient();

  const accountStatus = user?.accountStatus ?? "approved";

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.doctorId],
    queryFn: () => getAppointments({ doctorId: user?.doctorId ?? undefined }),
    enabled: !!user?.doctorId && accountStatus === "approved",
  });

  const { data: billingInfo } = useQuery<BillingInfo>({
    queryKey: ["billingInfo"],
    queryFn: getBillingInfo,
    enabled: !!user?.doctorId && accountStatus === "approved",
  });
  const isSubscribed = billingInfo?.status === "ACTIVE" || billingInfo?.status === "TRIAL";

  const doctorName = user?.name ?? "Doctor";

  if (user?.role === "doctor" && accountStatus === "incomplete") {
    return <IncompleteScreen doctorName={doctorName} signOut={signOut} isRTL={isRTL} refreshUser={refreshUser} />;
  }

  if (user?.role === "doctor" && (accountStatus === "pending" || accountStatus === "rejected")) {
    return <PendingScreen status={accountStatus} doctorName={doctorName} signOut={signOut} isRTL={isRTL} />;
  }

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: "appointments", icon: <CalendarDays className="h-4 w-4" />, label: isRTL ? "المواعيد" : t.dashboard.appointments },
    { tab: "patients", icon: <Users className="h-4 w-4" />, label: isRTL ? "سجل المرضى" : "My Patients" },
    { tab: "assistants", icon: <UserCog className="h-4 w-4" />, label: isRTL ? "المساعدون" : "Assistants" },
    { tab: "publications", icon: <Newspaper className="h-4 w-4" />, label: isRTL ? "المنشورات" : "Publications" },
    { tab: "preferences", icon: <Settings className="h-4 w-4" />, label: isRTL ? "الإعدادات" : "Preferences" },
    { tab: "billing",     icon: <CreditCard className="h-4 w-4" />, label: isRTL ? "الاشتراك" : "Billing" },
  ];

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 border-e bg-white hidden md:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {doctorName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm">{doctorName}</h3>
                <p className="text-xs text-gray-500">{user?.nameAr ?? ""}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors text-left ${
                    activeTab === item.tab
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <Link href="/edit-profile">
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                  <TrendingUp className="h-4 w-4" />
                  {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors"
                data-testid="button-dashboard-signout"
              >
                <LogOut className="h-4 w-4" />
                {isRTL ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">

            {/* ── Appointments Tab ── */}
            {activeTab === "appointments" && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
                    <p className="text-gray-500">{isRTL ? `مرحباً بك، ${doctorName}.` : `Welcome back, ${doctorName}.`}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-gray-500 md:hidden" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    {isRTL ? "خروج" : "Sign Out"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">{t.dashboard.upcomingAppointments}</CardTitle>
                      <CalendarDays className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{appointments.length}</div>
                      <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.sinceYesterday}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">{t.dashboard.profileViews}</CardTitle>
                      <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">—</div>
                      <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.vsLastMonthViews}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">{t.dashboard.totalEarnings}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">— <span className="text-lg font-normal text-gray-500">{t.dashboard.egp}</span></div>
                      <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.vsLastMonthEarnings}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* ── Pending Confirmation Banner ── */}
                {(() => {
                  const pending = appointments.filter(a => a.status === "pending_confirmation");
                  if (pending.length === 0) return null;
                  return (
                    <Card className="border border-orange-200 bg-orange-50/50 shadow-sm mb-6">
                      <CardHeader className="pb-3 pt-4 px-5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <CardTitle className="text-base text-orange-700">
                            {isRTL
                              ? `${pending.length} طلب حجز بانتظار موافقتك`
                              : `${pending.length} booking request${pending.length > 1 ? "s" : ""} awaiting your confirmation`}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-orange-100">
                          {pending.map(apt => (
                            <div key={apt.id} className="flex items-center justify-between px-5 py-3 gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 truncate">{apt.patientName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {apt.appointmentDate} · {apt.appointmentTime}
                                  {apt.isFollowUp && (
                                    <span className="ml-2 inline-flex items-center text-emerald-600">
                                      · {isRTL ? "متابعة" : "Follow-up"}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    updateAppointmentStatus(apt.id, "cancelled").then(() =>
                                      qc.invalidateQueries({ queryKey: ["appointments"] })
                                    );
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  {isRTL ? "رفض" : "Reject"}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    updateAppointmentStatus(apt.id, "confirmed").then(() =>
                                      qc.invalidateQueries({ queryKey: ["appointments"] })
                                    );
                                  }}
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  {isRTL ? "تأكيد" : "Confirm"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                <Card className="border-0 shadow-sm shadow-gray-200/50 mb-8">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-gray-50/50 rounded-t-xl pb-4">
                    <div>
                      <CardTitle className="text-lg">{t.dashboard.appointments}</CardTitle>
                      <p className="text-sm text-gray-500 font-normal">{t.dashboard.manageSchedule}</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder={t.dashboard.searchPatients} className="ps-9 bg-white" data-testid="input-search-patients" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white hover:bg-white">
                          <TableHead className="font-semibold text-gray-600">{t.dashboard.patientName}</TableHead>
                          <TableHead className="font-semibold text-gray-600">{t.dashboard.phone}</TableHead>
                          <TableHead className="font-semibold text-gray-600">{t.dashboard.date}</TableHead>
                          <TableHead className="font-semibold text-gray-600">{t.dashboard.time}</TableHead>
                          <TableHead className="font-semibold text-gray-600">{t.dashboard.status}</TableHead>
                          <TableHead className="font-semibold text-gray-600">{isRTL ? "متابعة" : "Follow-up"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">{isRTL ? "جار التحميل..." : "Loading..."}</TableCell></TableRow>
                        ) : appointments.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">{t.dashboard.noAppointments}</TableCell></TableRow>
                        ) : (
                          appointments.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell className="font-medium text-gray-900">{apt.patientName}</TableCell>
                              <TableCell className="text-gray-600">{apt.patientPhone}</TableCell>
                              <TableCell className="text-gray-600">{apt.appointmentDate}</TableCell>
                              <TableCell className="text-gray-600">{apt.appointmentTime}</TableCell>
                              <TableCell>{statusBadge(apt.status, t)}</TableCell>
                              <TableCell>
                                {apt.isFollowUp && (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                    {isRTL ? "استشارة" : "Follow-up"}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm shadow-gray-200/50">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 rounded-t-xl pb-4">
                    <CardTitle className="text-lg">{t.dashboard.recentPublications}</CardTitle>
                    <Link href="/dashboard/publish">
                      <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />{t.dashboard.newPublication}</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { icon: <FileText className="w-5 h-5" />, color: "bg-blue-50 text-blue-600", title: "Understanding Heart Disease Risks", type: "Article", date: "Today" },
                        { icon: <Video className="w-5 h-5" />, color: "bg-red-50 text-red-600", title: "Healthy Diet for Blood Pressure", type: "Video", date: "Yesterday" },
                        { icon: <MessageSquare className="w-5 h-5" />, color: "bg-yellow-50 text-yellow-600", title: "Drink 8 glasses of water daily", type: "Advice", date: "Oct 28" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>{item.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                              <span className="text-xs text-gray-500">{item.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Patients Tab ── */}
            {activeTab === "patients" && <PatientsTab isRTL={isRTL} />}

            {/* ── Assistants Tab ── */}
            {activeTab === "assistants" && user?.doctorId && (
              <AssistantsTab isRTL={isRTL} doctorId={user.doctorId} />
            )}

            {/* ── Publications Tab ── */}
            {activeTab === "publications" && (
              isSubscribed
                ? <PublicationsTab isRTL={isRTL} />
                : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {isRTL ? "ميزة مدفوعة" : "Subscription Required"}
                    </h2>
                    <p className="text-gray-500 text-sm max-w-sm mb-6">
                      {isRTL
                        ? "نشر المقالات والنصائح والفيديوهات متاح فقط للأطباء المشتركين في المنصة."
                        : "Publishing articles, tips, and videos is available only to subscribed doctors."}
                    </p>
                    <Button onClick={() => setActiveTab("billing")} className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      {isRTL ? "اشترك الآن" : "Subscribe Now"}
                    </Button>
                  </div>
                )
            )}

            {/* ── Preferences Tab ── */}
            {activeTab === "preferences" && <PreferencesTab isRTL={isRTL} />}

            {/* ── Billing Tab ── */}
            {activeTab === "billing" && <BillingTab isRTL={isRTL} />}

          </div>
        </main>
      </div>
    </Layout>
  );
}
