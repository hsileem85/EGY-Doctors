import { useState } from "react";
import { FileText, CalendarDays, Pill, FlaskConical, Scan, Stethoscope, ChevronDown, ChevronUp, Download, Printer } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

const emrData = {
  patient: {
    name: "Amira Hassan",
    age: 32,
    gender: "Female",
    bloodType: "O+",
    nationalId: "2980515010****",
    allergies: ["Penicillin"],
    chronicConditions: ["Hypertension"],
  },
  visits: [
    {
      id: 1,
      date: "2026-05-20",
      doctor: "Dr. Ahmed Youssef",
      specialty: "Cardiology",
      type: "consultation",
      notes: "Patient reports mild chest discomfort. Blood pressure elevated. Recommended lifestyle changes and follow-up in 2 weeks.",
      prescriptions: [
        { name: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "30 days" },
        { name: "Aspirin 81mg", dosage: "1 tablet daily", duration: "30 days" },
      ],
    },
    {
      id: 2,
      date: "2026-04-15",
      doctor: "Dr. Sara Mahmoud",
      specialty: "Internal Medicine",
      type: "consultation",
      notes: "Routine check-up. All vitals normal. Continue current medications.",
      prescriptions: [],
    },
  ],
  labs: [
    { id: 1, name: "Complete Blood Count (CBC)", date: "2026-05-18", lab: "LabCare Center", result: "Normal", file: "cbc-may-2026.pdf" },
    { id: 2, name: "Lipid Profile", date: "2026-04-10", lab: "LabCare Center", result: "LDL slightly elevated", file: "lipid-apr-2026.pdf" },
    { id: 3, name: "HbA1c", date: "2026-04-10", lab: "LabCare Center", result: "Normal (5.4%)", file: "hba1c-apr-2026.pdf" },
  ],
  scans: [
    { id: 1, name: "Chest X-Ray", date: "2026-05-15", center: "ScanPro Radiology", result: "No abnormalities", file: "chest-xray-may-2026.jpg" },
    { id: 2, name: "Echocardiogram", date: "2026-03-20", center: "Heart Scan Center", result: "Normal ejection fraction", file: "echo-mar-2026.pdf" },
  ],
  medications: [
    { id: 1, name: "Amlodipine 5mg", dosage: "1 tablet daily", prescribedBy: "Dr. Ahmed Youssef", startDate: "2026-05-20", endDate: "2026-06-20", status: "active" },
    { id: 2, name: "Aspirin 81mg", dosage: "1 tablet daily", prescribedBy: "Dr. Ahmed Youssef", startDate: "2026-05-20", endDate: "2026-06-20", status: "active" },
    { id: 3, name: "Metformin 500mg", dosage: "1 tablet twice daily", prescribedBy: "Dr. Sara Mahmoud", startDate: "2026-04-15", endDate: "2026-05-15", status: "completed" },
  ],
};

export default function PatientEMR() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [expandedVisit, setExpandedVisit] = useState<number | null>(1);

  const t = {
    title: isRTL ? "الملف الطبي الإلكتروني" : "Electronic Medical Record",
    subtitle: isRTL ? "تاريخك الصحي الكامل في مكان واحد" : "Your complete health history in one place",
    patientInfo: isRTL ? "بيانات المريض" : "Patient Information",
    visits: isRTL ? "الزيارات" : "Visits",
    labTests: isRTL ? "التحاليل" : "Lab Tests",
    scans: isRTL ? "الأشعة" : "Scans",
    medications: isRTL ? "الأدوية" : "Medications",
    active: isRTL ? "نشطة" : "Active",
    completed: isRTL ? "منتهية" : "Completed",
    normal: isRTL ? "طبيعي" : "Normal",
    abnormal: isRTL ? "غير طبيعي" : "Abnormal",
    download: isRTL ? "تحميل" : "Download",
    print: isRTL ? "طباعة" : "Print",
    allergies: isRTL ? "حساسيات" : "Allergies",
    chronicConditions: isRTL ? "أمراض مزمنة" : "Chronic Conditions",
    none: isRTL ? "لا يوجد" : "None",
    prescription: isRTL ? "الوصفات" : "Prescriptions",
    dosage: isRTL ? "الجرعة" : "Dosage",
    duration: isRTL ? "المدة" : "Duration",
    result: isRTL ? "النتيجة" : "Result",
    date: isRTL ? "التاريخ" : "Date",
    prescribedBy: isRTL ? "وصفه" : "Prescribed By",
    startEnd: isRTL ? "مدة الاستخدام" : "Duration",
    noRecords: isRTL ? "لا توجد سجلات" : "No records found",
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {t.title}
                </h1>
                <p className="text-gray-500 mt-1">{t.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Printer className="h-4 w-4" />
                  {t.print}
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  {t.download}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Patient Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t.patientInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {emrData.patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{emrData.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {emrData.patient.age} {isRTL ? "سنة" : "years"} &middot; {emrData.patient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{isRTL ? "زمام الدم" : "Blood Type"}</span>
                      <span className="font-medium">{emrData.patient.bloodType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{isRTL ? "الرقم القومي" : "National ID"}</span>
                      <span className="font-medium font-mono">{emrData.patient.nationalId}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">{t.allergies}</p>
                    {emrData.patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {emrData.patient.allergies.map((a) => (
                          <Badge key={a} variant="outline" className="text-red-700 border-red-200 bg-red-50">{a}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">{t.none}</p>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">{t.chronicConditions}</p>
                    {emrData.patient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {emrData.patient.chronicConditions.map((c) => (
                          <Badge key={c} variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">{c}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">{t.none}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    {t.medications}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emrData.medications.map((med) => (
                    <div key={med.id} className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{med.name}</p>
                          <p className="text-xs text-gray-500">{med.dosage}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            med.status === "active"
                              ? "text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5"
                              : "text-gray-500 border-gray-200 bg-gray-50"
                          }
                        >
                          {med.status === "active" ? t.active : t.completed}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {med.prescribedBy} &middot; {med.startDate} → {med.endDate}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visits */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    {t.visits}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emrData.visits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-start"
                        onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{visit.doctor}</p>
                            <p className="text-xs text-gray-500">{visit.specialty} &middot; {visit.date}</p>
                          </div>
                        </div>
                        {expandedVisit === visit.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {expandedVisit === visit.id && (
                        <div className="px-4 pb-4 pt-0 bg-gray-50/50">
                          <div className="border-t pt-3 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">{isRTL ? "الملاحظات" : "Notes"}</p>
                              <p className="text-sm text-gray-700">{visit.notes}</p>
                            </div>
                            {visit.prescriptions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t.prescription}</p>
                                <div className="space-y-1">
                                  {visit.prescriptions.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <Pill className="h-3 w-3 text-primary" />
                                      <span className="font-medium">{p.name}</span>
                                      <span className="text-gray-500">
                                        — {p.dosage}, {t.duration}: {p.duration}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Lab Tests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    {t.labTests}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {emrData.labs.map((lab) => (
                      <div key={lab.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <FlaskConical className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{lab.name}</p>
                            <p className="text-xs text-gray-500">{lab.lab} &middot; {lab.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              lab.result === "Normal"
                                ? "text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5"
                                : "text-amber-700 border-amber-200 bg-amber-50"
                            }
                          >
                            {lab.result === "Normal" ? t.normal : lab.result}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-primary gap-1">
                            <Download className="h-3 w-3" />
                            {t.download}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scans */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Scan className="h-4 w-4 text-primary" />
                    {t.scans}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {emrData.scans.map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Scan className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{scan.name}</p>
                            <p className="text-xs text-gray-500">{scan.center} &middot; {scan.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              scan.result === "No abnormalities"
                                ? "text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5"
                                : "text-amber-700 border-amber-200 bg-amber-50"
                            }
                          >
                            {scan.result === "No abnormalities" ? t.normal : scan.result}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-primary gap-1">
                            <Download className="h-3 w-3" />
                            {t.download}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
