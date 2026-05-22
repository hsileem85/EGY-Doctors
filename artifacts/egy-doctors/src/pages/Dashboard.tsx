import { CalendarDays, Users, TrendingUp, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { appointments } from "@/lib/data";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Mock Sidebar */}
        <aside className="w-64 border-r bg-white hidden md:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                D
              </div>
              <div>
                <h3 className="font-bold text-sm">Dr. Ahmed Youssef</h3>
                <p className="text-xs text-gray-500">Cardiology</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm">
                <CalendarDays className="h-4 w-4" />
                Appointments
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                <Users className="h-4 w-4" />
                Patients
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">
                <TrendingUp className="h-4 w-4" />
                Performance
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome back, Dr. Ahmed. Here's your clinic overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointments</CardTitle>
                  <CalendarDays className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{appointments.length}</div>
                  <p className="text-xs text-green-600 mt-1 font-medium">+2 since yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Profile Views (30d)</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">1,248</div>
                  <p className="text-xs text-green-600 mt-1 font-medium">+14% vs last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Earnings (MTD)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">12,400 <span className="text-lg font-normal text-gray-500">EGP</span></div>
                  <p className="text-xs text-green-600 mt-1 font-medium">+5% vs last month</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm shadow-gray-200/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-gray-50/50 rounded-t-xl pb-4">
                <div>
                  <CardTitle className="text-lg">Appointments</CardTitle>
                  <p className="text-sm text-gray-500 font-normal">Manage your upcoming schedule</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search patients..." className="pl-9 bg-white" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white hover:bg-white">
                      <TableHead className="font-semibold text-gray-600">Patient Name</TableHead>
                      <TableHead className="font-semibold text-gray-600">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-600">Date</TableHead>
                      <TableHead className="font-semibold text-gray-600">Time</TableHead>
                      <TableHead className="font-semibold text-gray-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium text-gray-900">{apt.patientName}</TableCell>
                        <TableCell className="text-gray-600">{apt.phone}</TableCell>
                        <TableCell className="text-gray-600">{apt.date}</TableCell>
                        <TableCell className="text-gray-600">{apt.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Confirmed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No upcoming appointments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}
