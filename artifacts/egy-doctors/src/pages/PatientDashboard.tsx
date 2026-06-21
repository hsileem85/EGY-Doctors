import { useState, useEffect } from "react";
import { CalendarDays, Bell, User, Pill, Stethoscope, LogOut, Settings, Globe, Mail, MessageSquare } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getPreferences, updatePreferences, type UserPreferences } from "@/lib/api";

type View = "appointments" | "preferences";

export default function PatientDashboard() {
  const { dir, setLang } = useLanguage();
  const { user, signOut } = useAuth();
  const isRTL = dir === "rtl";
  const [activeView, setActiveView] = useState<View>("appointments");

  const firstName = user?.name?.split(" ")[0] ?? (isRTL ? "مريض" : "Patient");

  // Apply site language from user preferences on load
  useEffect(() => {
    if (user?.siteLanguage) setLang(user.siteLanguage);
  }, [user?.siteLanguage]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["patient-appointments", user?.id],
    queryFn: () => getAppointments({ patientUserId: user!.id }),
    enabled: !!user?.id,
  });

  const today = new Date().toISOString().split("T")[0];

  const upcoming = appointments
    .filter(a => a.appointmentDate >= today && a.status !== "cancelled")
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));

  const recentActivity = appointments
    .filter(a => a.appointmentDate < today)
    .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
    .slice(0, 4);

  const visitCount = appointments.filter(a => a.status !== "cancelled").length;

  const navItems: { view: View; icon: React.ReactNode; label: string }[] = [
    { view: "appointments", icon: <CalendarDays className="h-4 w-4" />, label: isRTL ? "مواعيدي" : "My Appointments" },
    { view: "preferences", icon: <Settings className="h-4 w-4" />, label: isRTL ? "الإعدادات" : "Preferences" },
  ];

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 border-e bg-white hidden md:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {firstName[0]?.toUpperCase() ?? "P"}
              </div>
              <div>
                <h3 className="font-bold text-sm">{user?.name ?? firstName}</h3>
                <p className="text-xs text-gray-500">{isRTL ? "مريض" : "Patient"}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors text-left ${
                    activeView === item.view
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
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

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">

            {/* ── Appointments View ── */}
            {activeView === "appointments" && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isRTL ? `مرحباً، ${firstName}` : `Welcome back, ${firstName}`}
                    </h1>
                    <p className="text-gray-500">
                      {isRTL
                        ? "هنا ملخص صحتك ومواعيدك القادمة."
                        : "Here is your health summary and upcoming schedule."}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-gray-500 md:hidden" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    {isRTL ? "خروج" : "Sign Out"}
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{isRTL ? "أدوية" : "Medications"}</p>
                        <p className="text-sm text-gray-400 italic">
                          {isRTL ? "الخدمة قادمة قريباً" : "Service coming soon"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D4A853]/10 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-[#D4A853]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{isRTL ? "زيارات" : "Visits"}</p>
                        <p className="text-xl font-bold">{isLoading ? "—" : visitCount}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Appointments */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {isRTL ? "المواعيد القادمة" : "Upcoming Appointments"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2 py-2">
                          {[1, 2].map(i => (
                            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : upcoming.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">
                          {isRTL ? "لا توجد مواعيد قادمة." : "No upcoming appointments."}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {upcoming.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <div>
                                <p className="font-medium text-sm">{apt.doctorName ?? `Doctor #${apt.doctorId}`}</p>
                                <p className="text-xs text-gray-500">
                                  {(isRTL ? apt.specialtyAr : apt.specialty) ?? ""}
                                  {apt.specialty || apt.specialtyAr ? " · " : ""}
                                  {apt.appointmentDate} · {apt.appointmentTime}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[#D4A853] border-[#D4A853]/20 bg-[#D4A853]/5 capitalize">
                                {apt.status === "confirmed"
                                  ? (isRTL ? "مؤكد" : "Confirmed")
                                  : apt.status === "pending"
                                  ? (isRTL ? "في الانتظار" : "Pending")
                                  : apt.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Medical Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        {isRTL ? "آخر النشاطات الطبية" : "Recent Medical Activity"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2 py-2">
                          {[1, 2].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : recentActivity.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">
                          {isRTL ? "لا يوجد نشاط سابق." : "No past activity yet."}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {recentActivity.map((apt) => (
                            <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Stethoscope className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {(isRTL ? apt.specialtyAr : apt.specialty) ?? (isRTL ? "استشارة" : "Consultation")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {apt.doctorName ?? `Doctor #${apt.doctorId}`} · {apt.appointmentDate}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* ── Preferences View ── */}
            {activeView === "preferences" && (
              <PatientPreferencesView isRTL={isRTL} />
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}

function PatientPreferencesView({ isRTL }: { isRTL: boolean }) {
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

        {/* Notification Settings */}
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
                  { key: "notifyViaSms" as const, icon: <MessageSquare className="h-4 w-4" />, label: "SMS", labelAr: "رسالة قصيرة", note: "coming soon", noteAr: "قريباً" },
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
