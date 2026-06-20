import { useState } from "react";
import { CalendarDays, Users, TrendingUp, Search, PenSquare, FileText, Video, MessageSquare, Plus, Clock, LogOut, XCircle, UserCheck } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAppointments, type ApiAppointment, submitDoctorForReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function statusBadge(status: ApiAppointment["status"], t: { dashboard: { confirmed: string } }) {
  const map: Record<ApiAppointment["status"], string> = {
    confirmed: "bg-[#D4A853]/5 text-[#D4A853] border-[#D4A853]/20",
    pending: "bg-blue-50 text-blue-600 border-blue-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    completed: "bg-green-50 text-green-600 border-green-200",
  };
  const labels: Record<ApiAppointment["status"], string> = {
    confirmed: t.dashboard.confirmed,
    pending: "Pending",
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? "تم إرسال الطلب!" : "Application Submitted!"}
          </h1>
          <p className="text-gray-500 mb-8">
            {isRTL
              ? "سيتم مراجعة ملفك الشخصي من قِبل فريقنا وستتلقى إشعاراً بالبريد الإلكتروني عند الموافقة."
              : "Your profile will be reviewed by our team and you'll be notified by email once approved."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-[#D4A853]/10 flex items-center justify-center mx-auto mb-6">
          <UserCheck className="w-10 h-10 text-[#D4A853]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isRTL ? `مرحباً، ${doctorName}` : `Welcome, ${doctorName}`}
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {isRTL
            ? "لكي تظهر على المنصة وتستقبل الحجوزات، أكمل إعداد ملفك الشخصي أولاً ثم أرسل طلبك للمراجعة."
            : "To appear on the platform and receive bookings, complete your profile setup first, then submit your application for review."}
        </p>

        <div className="bg-[#FEF9F0] border border-[#D4A853]/30 rounded-xl p-4 mb-6 text-sm text-start">
          <p className="font-medium text-[#92400E] mb-2">
            {isRTL ? "خطوات الظهور على المنصة:" : "Steps to appear on the platform:"}
          </p>
          <ul className="space-y-1.5 text-[#78350F]">
            <li className="flex items-start gap-2">✅ <span>{isRTL ? "تم إنشاء حسابك بنجاح" : "Account created"}</span></li>
            <li className="flex items-start gap-2">📋 <span>{isRTL ? "أكمل ملفك الشخصي (التخصص، السيرة، العيادات)" : "Complete your profile (specialty, bio, clinics)"}</span></li>
            <li className="flex items-start gap-2">📤 <span>{isRTL ? "أرسل طلبك للمراجعة" : "Submit for admin review"}</span></li>
            <li className="flex items-start gap-2">✨ <span>{isRTL ? "بعد الموافقة، ستظهر في نتائج البحث" : "After approval, you'll appear in search results"}</span></li>
          </ul>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/profile-setup">
            <Button size="lg" className="w-full gap-2" data-testid="button-complete-profile">
              <UserCheck className="w-4 h-4" />
              {isRTL ? "إكمال إعداد الملف الشخصي" : "Complete Profile Setup"}
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853]/10"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="button-submit-for-review"
          >
            <Clock className="w-4 h-4" />
            {submitting
              ? (isRTL ? "جاري الإرسال..." : "Submitting...")
              : (isRTL ? "إرسال الطلب للمراجعة" : "Submit for Review")}
          </Button>
          <Button variant="ghost" className="gap-2 text-gray-500" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            {isRTL ? "تسجيل الخروج" : "Sign Out"}
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
          {isRejected
            ? (isRTL ? "تم رفض طلبك" : "Application Not Approved")
            : (isRTL ? "حسابك قيد المراجعة" : "Your Account is Under Review")
          }
        </h1>
        <p className="text-gray-500 mb-2">
          {isRTL ? `مرحباً، ${doctorName}` : `Hello, ${doctorName}`}
        </p>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {isRejected
            ? (isRTL
                ? "نأسف، لم يتم قبول طلب تسجيلك في الوقت الحالي. يرجى التواصل مع الدعم للمزيد من المعلومات."
                : "We're sorry, your registration was not approved at this time. Please contact support for more information.")
            : (isRTL
                ? "شكراً لتسجيلك في إيجي دكتورز. يراجع فريقنا طلبك حالياً وسيتم إخطارك بالبريد الإلكتروني عند القبول."
                : "Thank you for registering with EGY Doctors. Our team is reviewing your application and you'll be notified by email once approved.")
          }
        </p>
        {!isRejected && (
          <div className="bg-[#FEF9F0] border border-[#D4A853]/30 rounded-xl p-4 mb-8 text-sm text-left">
            <p className="font-medium text-[#92400E] mb-2">
              {isRTL ? "ما الذي يحدث الآن؟" : "What happens next?"}
            </p>
            <ul className="space-y-1 text-[#78350F]">
              <li>✅ {isRTL ? "تم إرسال طلبك للمراجعة" : "Your application has been submitted"}</li>
              <li>⏳ {isRTL ? "يراجع فريقنا بياناتك" : "Our team is reviewing your details"}</li>
              <li>📧 {isRTL ? "ستصلك رسالة بريدية عند الموافقة" : "You'll get an email when approved"}</li>
            </ul>
          </div>
        )}
        <Button
          variant="outline"
          className="gap-2 text-gray-600"
          onClick={signOut}
          data-testid="button-pending-signout"
        >
          <LogOut className="w-4 h-4" />
          {isRTL ? "تسجيل الخروج" : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t, dir } = useLanguage();
  const { user, signOut, refreshUser } = useAuth();
  const isRTL = dir === "rtl";

  const accountStatus = user?.accountStatus ?? "approved";

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.doctorId],
    queryFn: () => getAppointments({ doctorId: user?.doctorId ?? undefined }),
    enabled: !!user?.doctorId && accountStatus === "approved",
  });

  const doctorName = user?.name ?? "Doctor";

  if (user?.role === "doctor" && accountStatus === "incomplete") {
    return (
      <IncompleteScreen
        doctorName={doctorName}
        signOut={signOut}
        isRTL={isRTL}
        refreshUser={refreshUser}
      />
    );
  }

  if (user?.role === "doctor" && (accountStatus === "pending" || accountStatus === "rejected")) {
    return (
      <PendingScreen
        status={accountStatus}
        doctorName={doctorName}
        signOut={signOut}
        isRTL={isRTL}
      />
    );
  }

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
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm">
                <CalendarDays className="h-4 w-4" />
                {t.dashboard.appointments}
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                <Users className="h-4 w-4" />
                {t.dashboard.patients}
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                <TrendingUp className="h-4 w-4" />
                {t.dashboard.performance}
              </a>
              <Link href="/dashboard/publish">
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                  <PenSquare className="h-4 w-4" />
                  {t.dashboard.publishContent}
                </span>
              </Link>
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
                <p className="text-gray-500">
                  {isRTL ? `مرحباً بك، ${doctorName}. هنا نظرة عامة على عيادتك.` : `Welcome back, ${doctorName}. Here's your clinic overview.`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-gray-500 md:hidden"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                {isRTL ? "خروج" : "Sign Out"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {t.dashboard.upcomingAppointments}
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{appointments.length}</div>
                  <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.sinceYesterday}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {t.dashboard.profileViews}
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">—</div>
                  <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.vsLastMonthViews}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {t.dashboard.totalEarnings}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    — <span className="text-lg font-normal text-gray-500">{t.dashboard.egp}</span>
                  </div>
                  <p className="text-xs text-[#D4A853] mt-1 font-medium">{t.dashboard.vsLastMonthEarnings}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm shadow-gray-200/50 mb-8">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-gray-50/50 rounded-t-xl pb-4">
                <div>
                  <CardTitle className="text-lg">{t.dashboard.appointments}</CardTitle>
                  <p className="text-sm text-gray-500 font-normal">{t.dashboard.manageSchedule}</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t.dashboard.searchPatients}
                    className="ps-9 bg-white"
                    data-testid="input-search-patients"
                  />
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          {isRTL ? "جار التحميل..." : "Loading..."}
                        </TableCell>
                      </TableRow>
                    ) : appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {t.dashboard.noAppointments}
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((apt) => (
                        <TableRow key={apt.id}>
                          <TableCell className="font-medium text-gray-900">{apt.patientName}</TableCell>
                          <TableCell className="text-gray-600">{apt.patientPhone}</TableCell>
                          <TableCell className="text-gray-600">{apt.appointmentDate}</TableCell>
                          <TableCell className="text-gray-600">{apt.appointmentTime}</TableCell>
                          <TableCell>{statusBadge(apt.status, t)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Publications */}
            <Card className="border-0 shadow-sm shadow-gray-200/50">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 rounded-t-xl pb-4">
                <CardTitle className="text-lg">{t.dashboard.recentPublications}</CardTitle>
                <Link href="/dashboard/publish">
                  <Button size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    {t.dashboard.newPublication}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Understanding Heart Disease Risks</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-5">Article</Badge>
                        <span className="text-xs text-gray-500">Today</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Healthy Diet for Blood Pressure</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-5">Video</Badge>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Drink 8 glasses of water daily</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-5">Advice</Badge>
                        <span className="text-xs text-gray-500">Oct 28</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}
