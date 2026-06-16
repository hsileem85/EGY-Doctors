import { useState } from "react";
import { Link } from "wouter";
import {
  useListDoctors,
  useApproveDoctor,
  useRejectDoctor,
  useUpdateDoctorOnboarding,
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
  getListDoctorsQueryKey,
  getListSpecialtiesQueryKey,
  getListCitiesQueryKey,
  getListAreasQueryKey,
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
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
} from "lucide-react";

function useInvalidateAdmin() {
  return () => {
    queryClient.invalidateQueries({ queryKey: getListDoctorsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListSpecialtiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCitiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListAreasQueryKey() });
  };
}

const tabs = [
  { id: "doctors", label: "Doctors", labelAr: "الأطباء", icon: Users },
  { id: "specialties", label: "Specialties", labelAr: "التخصصات", icon: Stethoscope },
  { id: "cities", label: "Cities", labelAr: "المحافظات", icon: MapPinHouse },
  { id: "areas", label: "Areas", labelAr: "المناطق", icon: MapPin },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Admin() {
  const { lang, t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("doctors");
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

function DoctorsSection({ lang }: { lang: string }) {
  const { data: doctors = [], isLoading } = useListDoctors();
  const approve = useApproveDoctor();
  const reject = useRejectDoctor();
  const updateOnboarding = useUpdateDoctorOnboarding();
  const invalidate = useInvalidateAdmin();

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
                    <TableCell className="text-gray-500">{doctor.specialtyId ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {doctor.accountStatus === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(doctor.id)}
                              disabled={approve.isPending}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(doctor.id)}
                              disabled={reject.isPending}
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
                        >
                          <Clock className="w-3.5 h-3.5" />
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

/* ─── Specialties Section ─── */

function SpecialtiesSection({ lang }: { lang: string }) {
  const { data: items = [], isLoading } = useListSpecialties();
  const create = useCreateSpecialty();
  const update = useUpdateSpecialty();
  const remove = useDeleteSpecialty();
  const invalidate = useInvalidateAdmin();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", description: "", displayOrder: 0 });

  const reset = () => {
    setForm({ name: "", nameAr: "", description: "", displayOrder: 0 });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { ...form, displayOrder: Number(form.displayOrder) };
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
        <Dialog open={open} onOpenChange={setOpen}>
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
                placeholder={lang === "ar" ? "الوصف" : "Description"}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder={lang === "ar" ? "ترتيب العرض" : "Display Order"}
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
              <Button
                className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]"
                onClick={handleSubmit}
                disabled={create.isPending || update.isPending}
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
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>{item.displayOrder}</TableCell>
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
  const [form, setForm] = useState({ name: "", nameAr: "", displayOrder: 0 });

  const reset = () => {
    setForm({ name: "", nameAr: "", displayOrder: 0 });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { ...form, displayOrder: Number(form.displayOrder) };
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
        <Dialog open={open} onOpenChange={setOpen}>
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
              <Input type="number" placeholder={lang === "ar" ? "ترتيب العرض" : "Display Order"} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={handleSubmit} disabled={create.isPending || update.isPending}>
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
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>{item.displayOrder}</TableCell>
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
  const [form, setForm] = useState({ cityId: 0, name: "", nameAr: "", displayOrder: 0 });

  const reset = () => {
    setForm({ cityId: cities[0]?.id ?? 0, name: "", nameAr: "", displayOrder: 0 });
    setEditId(null);
  };

  const handleSubmit = () => {
    const payload = { ...form, cityId: Number(form.cityId), displayOrder: Number(form.displayOrder) };
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
        <Dialog open={open} onOpenChange={setOpen}>
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
                onChange={(e) => setForm({ ...form, cityId: Number(e.target.value) })}
              >
                <option value="">{lang === "ar" ? "اختر المحافظة" : "Select City"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Input placeholder={lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              <Input type="number" placeholder={lang === "ar" ? "ترتيب العرض" : "Display Order"} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              <Button className="w-full bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48]" onClick={handleSubmit} disabled={create.isPending || update.isPending}>
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
                  <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{lang === "ar" ? "الاسم (ع)" : "Name (AR)"}</TableHead>
                  <TableHead>{lang === "ar" ? "المحافظة" : "City"}</TableHead>
                  <TableHead>{lang === "ar" ? "الترتيب" : "Order"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>{cities.find((c) => c.id === item.cityId)?.name ?? item.cityId}</TableCell>
                    <TableCell>{item.displayOrder}</TableCell>
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
