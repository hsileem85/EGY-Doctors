import { Building2, Users, CalendarDays, Stethoscope, TrendingUp, FileText, Settings, Bell, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

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
  { id: 1, patient: "Amira Hassan", service: "Chest X-Ray", doctor: "Dr. Khaled Samir", date: "2026-05-28", time: "10:00", status: "confirmed" },
  { id: 2, patient: "Mohamed Ali", service: "MRI Brain", doctor: "Dr. Nadia Fathy", date: "2026-05-28", time: "11:30", status: "pending" },
  { id: 3, patient: "Samar Youssef", service: "Ultrasound Abdomen", doctor: "Dr. Khaled Samir", date: "2026-05-29", time: "09:00", status: "confirmed" },
];

const doctors = [
  { id: 1, name: "Dr. Khaled Samir", specialty: "Radiology", patients: 145 },
  { id: 2, name: "Dr. Nadia Fathy", specialty: "Radiology", patients: 98 },
  { id: 3, name: "Dr. Omar Tarek", specialty: "Radiology", patients: 112 },
];

const typeLabels = {
  en: { hospital: "Hospital", clinic: "Clinic", polyclinic: "Poly Clinic", lab: "Lab", scan: "Scan Center" },
  ar: { hospital: "مستشفى", clinic: "عيادة", polyclinic: "عيادة متعددة", lab: "معمل", scan: "مركز أشعة" },
};

export default function MedicalCenterDashboard() {
  const { dir, lang } = useLanguage();
  const isRTL = dir === "rtl";

  const t = {
    title: isRTL ? "لوحة تحكم المركز الطبي" : "Medical Center Dashboard",
    welcome: isRTL ? "مرحباً بك، هنا نظرة عامة على أداء مركزك." : "Welcome back. Here's an overview of your center.",
    doctors: isRTL ? "الأطباء" : "Doctors",
    appointments: isRTL ? "المواعيد" : "Appointments",
    patients: isRTL ? "المريضين" : "Patients",
    services: isRTL ? "الخدمات" : "Services",
    upcomingAppointments: isRTL ? "المواعيد القادمة" : "Upcoming Appointments",
    ourDoctors: isRTL ? "أطباءنا" : "Our Doctors",
    addDoctor: isRTL ? "إضافة طبيب" : "Add Doctor",
    serviceList: isRTL ? "الخدمات المتوفرة" : "Available Services",
    noAppointments: isRTL ? "لا توجد مواعيد قادمة." : "No upcoming appointments.",
    confirmed: isRTL ? "مؤكد" : "Confirmed",
    pending: isRTL ? "معلق" : "Pending",
  };

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
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm cursor-default">
                <TrendingUp className="h-4 w-4" />
                {isRTL ? "نظرة عامة" : "Overview"}
              </span>
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
                <Stethoscope className="h-4 w-4" />
                {t.services}
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <CalendarDays className="h-4 w-4" />
                {t.appointments}
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
                <Settings className="h-4 w-4" />
                {isRTL ? "الإعدادات" : "Settings"}
              </span>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-500">{t.welcome}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.doctors}</p>
                    <p className="text-xl font-bold">{center.doctors}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.appointments}</p>
                    <p className="text-xl font-bold">{center.appointments}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.services}</p>
                    <p className="text-xl font-bold">{center.services.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.patients}</p>
                    <p className="text-xl font-bold">{center.patients}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {t.upcomingAppointments}
                  </CardTitle>
                  <Badge variant="outline" className="text-primary border-primary/20">
                    {upcomingAppointments.length}
                  </Badge>
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
                          <Badge
                            variant="outline"
                            className={
                              apt.status === "confirmed"
                                ? "text-green-700 border-green-200 bg-green-50"
                                : "text-amber-700 border-amber-200 bg-amber-50"
                            }
                          >
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
          </div>
        </main>
      </div>
    </Layout>
  );
}
