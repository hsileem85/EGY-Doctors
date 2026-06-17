import { CalendarDays, Bell, User, Pill, Stethoscope } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const upcomingAppointments = [
  { id: 1, doctor: "Dr. Ahmed Youssef", specialty: "Cardiology", date: "2026-05-28", time: "10:00 AM", status: "confirmed" },
];

const recentRecords = [
  { id: 1, title: "Cardiology Consultation", doctor: "Dr. Ahmed Youssef", date: "2026-05-20", icon: Stethoscope },
  { id: 4, title: "Blood Pressure Medication", doctor: "Dr. Ahmed Youssef", date: "2026-05-20", icon: Pill },
];

export default function PatientDashboard() {
  const { dir } = useLanguage();
  const { user } = useAuth();
  const isRTL = dir === "rtl";

  const firstName = user?.name?.split(" ")[0] ?? (isRTL ? "مريض" : "Patient");

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
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm">
                <CalendarDays className="h-4 w-4" />
                {isRTL ? "مواعيدي" : "My Appointments"}
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <Bell className="h-4 w-4" />
                {isRTL ? "التنبيهات" : "Reminders"}
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <User className="h-4 w-4" />
                {isRTL ? "الملف الشخصي" : "My Profile"}
              </span>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {isRTL ? `مرحباً، ${firstName}` : `Welcome back, ${firstName}`}
              </h1>
              <p className="text-gray-500">
                {isRTL
                  ? "هنا ملخص صحتك ومواعيدك القادمة."
                  : "Here is your health summary and upcoming schedule."}
              </p>
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
                    <p className="text-xl font-bold">3</p>
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
                    <p className="text-xl font-bold">8</p>
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
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      {isRTL ? "لا توجد مواعيد قادمة." : "No upcoming appointments."}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium text-sm">{apt.doctor}</p>
                            <p className="text-xs text-gray-500">{apt.specialty} &middot; {apt.date} &middot; {apt.time}</p>
                          </div>
                          <Badge variant="outline" className="text-[#D4A853] border-[#D4A853]/20 bg-[#D4A853]/5">
                            {apt.status === "confirmed" ? (isRTL ? "مؤكد" : "Confirmed") : apt.status}
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
                  <div className="space-y-3">
                    {recentRecords.map((record) => {
                      const Icon = record.icon;
                      return (
                        <div key={record.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{record.title}</p>
                            <p className="text-xs text-gray-500">{record.doctor} &middot; {record.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
