import { useState } from "react";
import { CalendarDays, LogOut, CheckCircle, XCircle, Clock, Phone } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, type ApiAppointment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function statusBadge(status: ApiAppointment["status"], isRTL: boolean) {
  const map: Record<ApiAppointment["status"], { cls: string; label: string; labelAr: string }> = {
    confirmed: { cls: "bg-[#D4A853]/5 text-[#D4A853] border-[#D4A853]/20", label: "Confirmed", labelAr: "مؤكد" },
    pending: { cls: "bg-blue-50 text-blue-600 border-blue-200", label: "Pending", labelAr: "قيد الانتظار" },
    cancelled: { cls: "bg-red-50 text-red-600 border-red-200", label: "Cancelled", labelAr: "ملغي" },
    completed: { cls: "bg-green-50 text-green-600 border-green-200", label: "Completed", labelAr: "مكتمل" },
  };
  const s = map[status];
  return <Badge variant="outline" className={s.cls}>{isRTL ? s.labelAr : s.label}</Badge>;
}

export default function AssistantDashboard() {
  const { dir } = useLanguage();
  const { user, signOut } = useAuth();
  const isRTL = dir === "rtl";
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const clinicId = user?.assistantClinicId ?? undefined;
  const assistantName = user?.name ?? "Assistant";

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", "clinic", clinicId],
    queryFn: () => getAppointments({ clinicId }),
    enabled: !!clinicId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ApiAppointment["status"] }) => {
      setUpdatingId(id);
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("egy_token")}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments", "clinic", clinicId] }); setUpdatingId(null); },
    onError: () => setUpdatingId(null),
  });

  if (!user || user.role !== "assistant") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{isRTL ? "غير مصرح لك بالوصول." : "Unauthorized."}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isRTL ? `مرحباً، ${assistantName}` : `Welcome, ${assistantName}`}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isRTL ? "إدارة حجوزات عيادتك" : "Managing bookings for your clinic"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-gray-500" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {isRTL ? "خروج" : "Sign Out"}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: isRTL ? "الإجمالي" : "Total", value: appointments.length, color: "text-gray-900" },
              { label: isRTL ? "قيد الانتظار" : "Pending", value: appointments.filter(a => a.status === "pending").length, color: "text-blue-600" },
              { label: isRTL ? "مؤكدة" : "Confirmed", value: appointments.filter(a => a.status === "confirmed").length, color: "text-[#D4A853]" },
              { label: isRTL ? "مكتملة" : "Completed", value: appointments.filter(a => a.status === "completed").length, color: "text-green-600" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Appointments Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{isRTL ? "الحجوزات" : "Appointments"}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "اسم المريض" : "Patient"}</TableHead>
                    <TableHead>{isRTL ? "الجوال" : "Mobile"}</TableHead>
                    <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isRTL ? "الوقت" : "Time"}</TableHead>
                    <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isRTL ? "متابعة" : "Follow-up"}</TableHead>
                    <TableHead className="text-right">{isRTL ? "إجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">{isRTL ? "جار التحميل..." : "Loading..."}</TableCell></TableRow>
                  ) : appointments.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">{isRTL ? "لا توجد حجوزات" : "No appointments"}</TableCell></TableRow>
                  ) : (
                    appointments.map(apt => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.patientName}</TableCell>
                        <TableCell>
                          <a href={`tel:${apt.patientPhone}`} className="flex items-center gap-1 text-gray-600 hover:text-[#D4A853]">
                            <Phone className="w-3.5 h-3.5" />{apt.patientPhone}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-600">{apt.appointmentDate}</TableCell>
                        <TableCell className="text-gray-600">{apt.appointmentTime}</TableCell>
                        <TableCell>{statusBadge(apt.status, isRTL)}</TableCell>
                        <TableCell>
                          {(apt as ApiAppointment & { isFollowUp?: boolean }).isFollowUp && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              {isRTL ? "استشارة" : "Follow-up"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {apt.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus.mutate({ id: apt.id, status: "confirmed" })}
                                  disabled={updatingId === apt.id}
                                  className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                  title={isRTL ? "تأكيد" : "Confirm"}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}
                                  disabled={updatingId === apt.id}
                                  className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title={isRTL ? "إلغاء" : "Cancel"}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {apt.status === "confirmed" && (
                              <button
                                onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}
                                disabled={updatingId === apt.id}
                                className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title={isRTL ? "تم" : "Complete"}
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
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
      </div>
    </Layout>
  );
}
