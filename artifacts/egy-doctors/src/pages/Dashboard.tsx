import { CalendarDays, Users, TrendingUp, Search, PenSquare, FileText, Video, MessageSquare, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appointments } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 border-e bg-white hidden md:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                D
              </div>
              <div>
                <h3 className="font-bold text-sm">Dr. Ahmed Youssef</h3>
                <p className="text-xs text-gray-500">{t.specialties["Cardiology"]}</p>
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
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
              <p className="text-gray-500">{t.dashboard.welcome}</p>
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
                  <p className="text-xs text-green-600 mt-1 font-medium">{t.dashboard.sinceYesterday}</p>
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
                  <div className="text-3xl font-bold text-gray-900">1,248</div>
                  <p className="text-xs text-green-600 mt-1 font-medium">{t.dashboard.vsLastMonthViews}</p>
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
                    12,400 <span className="text-lg font-normal text-gray-500">{t.dashboard.egp}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 font-medium">{t.dashboard.vsLastMonthEarnings}</p>
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
                    {appointments.map(apt => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium text-gray-900">{apt.patientName}</TableCell>
                        <TableCell className="text-gray-600">{apt.phone}</TableCell>
                        <TableCell className="text-gray-600">{apt.date}</TableCell>
                        <TableCell className="text-gray-600">{apt.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {t.dashboard.confirmed}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {t.dashboard.noAppointments}
                        </TableCell>
                      </TableRow>
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
