const API_BASE = "/api";

export interface UserPreferences {
  siteLanguage: "en" | "ar";
  notificationLanguage: "en" | "ar";
  notifyViaEmail: boolean;
  notifyViaSms: boolean;
  notifyViaWhatsApp: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  nameAr?: string | null;
  phone: string;
  email?: string | null;
  role: "patient" | "doctor" | "medical_center" | "admin" | "assistant";
  doctorId?: number | null;
  accountStatus?: string | null;
  isSubmittedForReview?: boolean | null;
  image?: string | null;
  assistantClinicId?: number | null;
  assistantDoctorId?: number | null;
  siteLanguage?: "en" | "ar" | null;
  notificationLanguage?: "en" | "ar" | null;
  notifyViaEmail?: boolean | null;
  notifyViaSms?: boolean | null;
  notifyViaWhatsApp?: boolean | null;
}

export type DayKey = "Sat" | "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
export type ClinicScheduleMap = Record<string, { active: boolean; from: string; to: string }>;
export type DoctorScheduleMap = Record<string, { from: string; to: string }>;

export type AvailabilityPeriod = "week" | "month" | "quarter" | "year" | "custom";

export interface AvailabilityConfig {
  availabilityPeriod?: AvailabilityPeriod | null;
  availabilityFrom?: string | null;
  availabilityTo?: string | null;
  sessionsPerHour?: number | null;
}

export interface ApiClinic extends AvailabilityConfig {
  id: number;
  name: string;
  nameAr?: string;
  address: string;
  mapUrl: string;
  phone: string;
  fee: number;
  followUpDays?: number | null;
  followUpPrice?: number | null;
  bookingConfirmationMethod?: "automatic" | "manual" | null;
  location: string;
  areaId?: number | null;
  areaName: string;
  lat?: number | null;
  lng?: number | null;
  schedule?: ClinicScheduleMap | null;
}

export interface ApiReview {
  id: number;
  patientName: string;
  rating: number;
  text: string;
  date: string;
}

export interface ApiDoctor extends AvailabilityConfig {
  id: number;
  name: string;
  nameAr?: string;
  specialty: string;
  specialtyAr: string;
  location: string;
  cityName: string;
  cityNameAr: string;
  areaName?: string;
  bio: string;
  bioAr?: string;
  image: string;
  fee: number;
  experience: number | null;
  rating: number;
  reviews: number;
  reviewsCount: number;
  accountStatus: string;
  isSubmittedForReview?: boolean;
  mapUrl: string;
  distance: string;
  clinics: ApiClinic[];
  reviewList: ApiReview[];
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
  isFollowing?: boolean;
  polyClinic?: { id: number; name: string; nameAr: string | null } | null;
  affiliatedCenter?: {
    id: number;
    name: string;
    nameAr: string | null;
    phone?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    cityName?: string | null;
    services?: { id: number; name: string; nameAr: string }[] | null;
  } | null;
  schedule?: DoctorScheduleMap | null;
}

export interface ApiSpecialty {
  id: number;
  name: string;
  nameAr: string;
  displayOrder: number;
}

export interface ApiCity {
  id: number;
  name: string;
  nameAr: string;
  displayOrder: number;
}

export interface ApiArea {
  id: number;
  cityId: number;
  name: string;
  nameAr: string;
  displayOrder: number;
}

export interface ApiAppointment {
  id: number;
  doctorId: number;
  clinicId: number | null;
  patientUserId: number | null;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "pending_confirmation";
  notes: string | null;
  isFollowUp?: boolean;
  feeCharged?: number | null;
  createdAt: string;
  updatedAt: string;
  doctorName?: string | null;
  specialty?: string | null;
  specialtyAr?: string | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("egy_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

/* ── Auth ── */

export interface SignUpData {
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  nationalId?: string;
  syndicateNumber?: string;
  password: string;
  role: "patient" | "doctor" | "medical_center";
  specialtyId?: number;
  cityId?: number;
  experience?: number;
  license?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function signUp(data: SignUpData): Promise<AuthResponse> {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
}

export function signIn(phone: string, password: string): Promise<AuthResponse> {
  return request("/auth/signin", { method: "POST", body: JSON.stringify({ phone, password }) });
}

export function getMe(): Promise<AuthUser> {
  return request("/auth/me");
}

export interface ContactSettings {
  phone: string;
  phoneSubEn: string;
  phoneSubAr: string;
  email: string;
  address: string;
  addressAr: string;
  hoursEn: string;
  hoursAr: string;
  daysEn: string;
  daysAr: string;
  whatsapp: string;
}

export function submitDoctorForReview(): Promise<{ message: string }> {
  return request("/doctors/profile/submit-for-review", { method: "POST" });
}

export function toggleDoctorActive(id: number): Promise<{ isActive: boolean }> {
  return request(`/admin/doctors/${id}/toggle-active`, { method: "PATCH" });
}

export function toggleDoctorVezeeta(id: number): Promise<{ hasVezeetaProfile: boolean }> {
  return request(`/admin/doctors/${id}/toggle-vezeeta`, { method: "PATCH" });
}

export interface AdminClinic {
  id: number;
  name: string | null;
  address: string | null;
  phone: string | null;
  fee: number | null;
  areaName: string | null;
  cityName: string | null;
  lat: number | null;
  lng: number | null;
}

export function getAdminDoctorClinics(doctorId: number): Promise<AdminClinic[]> {
  return request(`/admin/doctors/${doctorId}/clinics`);
}

export function getContactSettings(): Promise<ContactSettings> {
  return request("/settings/contact");
}

export function updateContactSettings(data: ContactSettings): Promise<{ message: string }> {
  return request("/admin/settings/contact", { method: "PUT", body: JSON.stringify(data) });
}

export function sendContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ message: string }> {
  return request("/contact", { method: "POST", body: JSON.stringify(data) });
}

export function forgotPassword(phone: string): Promise<{ message: string; maskedEmail?: string; emailSent?: boolean; resetToken?: string }> {
  return request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ phone }) });
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

/* ── Doctors ── */

export function getDoctors(params?: {
  q?: string;
  specialtyId?: number;
  cityId?: number;
  areaId?: number;
  lat?: number;
  lng?: number;
}): Promise<ApiDoctor[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.specialtyId) qs.set("specialtyId", String(params.specialtyId));
  if (params?.cityId) qs.set("cityId", String(params.cityId));
  if (params?.areaId) qs.set("areaId", String(params.areaId));
  if (params?.lat != null) qs.set("lat", String(params.lat));
  if (params?.lng != null) qs.set("lng", String(params.lng));
  const query = qs.toString();
  return request(`/doctors${query ? `?${query}` : ""}`);
}

export function getDoctor(id: number): Promise<ApiDoctor> {
  return request(`/doctors/${id}`);
}

/* ── Own Doctor Profile ── */

export function getMyDoctorProfile(): Promise<ApiDoctor & { clinics: ApiClinic[]; specialtyId?: number; cityId?: number }> {
  return request("/doctor/profile");
}

export function updateDoctorProfile(data: {
  name?: string;
  nameAr?: string;
  bio: string;
  bioAr: string;
  image?: string;
  specialtyId?: number;
  cityId?: number;
  areaId?: number;
  fee?: number;
  experience?: number;
  license?: string;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
}): Promise<unknown> {
  return request("/doctor/profile", { method: "PUT", body: JSON.stringify(data) });
}

export function addClinic(data: {
  name?: string;
  nameAr?: string;
  address: string;
  mapUrl?: string;
  phone: string;
  fee?: number;
  followUpDays?: number;
  followUpPrice?: number;
  bookingConfirmationMethod: "automatic" | "manual";
  areaId: number;
  lat: number;
  lng: number;
  schedule: ClinicScheduleMap;
} & AvailabilityConfig): Promise<ApiClinic> {
  return request("/doctor/clinics", { method: "POST", body: JSON.stringify(data) });
}

export function updateClinic(id: number, data: {
  name?: string;
  nameAr?: string;
  address: string;
  mapUrl?: string;
  phone: string;
  fee?: number;
  followUpDays?: number;
  followUpPrice?: number;
  bookingConfirmationMethod: "automatic" | "manual";
  areaId: number;
  lat: number;
  lng: number;
  schedule: ClinicScheduleMap;
} & AvailabilityConfig): Promise<ApiClinic> {
  return request(`/doctor/clinics/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function updateAppointmentStatus(id: number, status: ApiAppointment["status"]): Promise<ApiAppointment> {
  return request(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function updateAppointment(id: number, data: { appointmentDate?: string; appointmentTime?: string }): Promise<ApiAppointment> {
  return request(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteClinic(id: number): Promise<void> {
  return request(`/doctor/clinics/${id}`, { method: "DELETE" });
}

/* ── Listings ── */

export function getSpecialties(): Promise<ApiSpecialty[]> {
  return request("/specialties");
}

export function getCities(): Promise<ApiCity[]> {
  return request("/cities");
}

export function getAreas(cityId?: number): Promise<ApiArea[]> {
  const qs = cityId ? `?cityId=${cityId}` : "";
  return request(`/areas${qs}`);
}

/* ── Appointments ── */

export function bookAppointment(data: {
  doctorId: number;
  clinicId?: number;
  patientUserId?: number;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}): Promise<ApiAppointment> {
  return request("/appointments", { method: "POST", body: JSON.stringify(data) });
}

export function initiateAppointmentPayment(appointmentId: number): Promise<PaymobInitiateResponse> {
  return request(`/billing/paymob/appointments/${appointmentId}/initiate`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getAppointmentPaymentStatus(appointmentId: number): Promise<{
  status: "PENDING" | "PAID" | "FAILED" | "REFUND_PENDING" | "REFUND_REQUESTED" | "REFUNDED" | "SETTLED";
  paymobOrderId: string | null;
}> {
  return request(`/billing/paymob/appointments/${appointmentId}/status`);
}

export function submitReview(
  doctorId: number,
  data: { patientName: string; rating: number; text?: string },
): Promise<{ ok: boolean }> {
  return request(`/doctors/${doctorId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function adminSearchUser(phone: string): Promise<{ id: number; name: string; phone: string; email: string | null; role: string }> {
  return request(`/admin/users/search?phone=${encodeURIComponent(phone)}`);
}

export async function adminResetUserPassword(phone: string, newPassword: string): Promise<{ ok: boolean; user: { id: number; name: string; phone: string; email: string | null; role: string } }> {
  return request("/admin/users/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, newPassword }),
  });
}

export function getAppointments(params?: {
  doctorId?: number;
  clinicId?: number;
  patientUserId?: number;
  patientPhone?: string;
}): Promise<ApiAppointment[]> {
  const qs = new URLSearchParams();
  if (params?.doctorId) qs.set("doctorId", String(params.doctorId));
  if (params?.clinicId) qs.set("clinicId", String(params.clinicId));
  if (params?.patientUserId) qs.set("patientUserId", String(params.patientUserId));
  if (params?.patientPhone) qs.set("patientPhone", params.patientPhone);
  const query = qs.toString();
  return request(`/appointments${query ? `?${query}` : ""}`);
}

/* ── Assistants ── */

export interface ApiAssistant {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  assistantClinicId: number | null;
  clinicNameEn: string | null;
  clinicName: string | null;
  createdAt: string;
}

export function getAssistants(): Promise<ApiAssistant[]> {
  return request("/doctors/assistants");
}

export function createAssistant(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  clinicId: number;
}): Promise<ApiAssistant> {
  return request("/doctors/assistants", { method: "POST", body: JSON.stringify(data) });
}

export function toggleAssistant(id: number): Promise<{ isActive: boolean }> {
  return request(`/doctors/assistants/${id}/toggle`, { method: "PATCH" });
}

export function deleteAssistant(id: number): Promise<void> {
  return request(`/doctors/assistants/${id}`, { method: "DELETE" });
}

/* ── Patient Directory ── */

export interface ApiPatientRecord {
  patientName: string;
  patientPhone: string;
  patientUserId: number | null;
  lastVisit: string;
  totalVisits: number;
}

export function getDoctorPatients(): Promise<ApiPatientRecord[]> {
  return request("/doctors/patients");
}

/* ── Preferences ── */

export function getPreferences(): Promise<UserPreferences> {
  return request("/auth/preferences");
}

export function updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
  return request("/auth/preferences", { method: "PATCH", body: JSON.stringify(data) });
}

/* ── Magazine ── */

export interface ApiMagazinePost {
  id: number;
  doctorId: number;
  type: "article" | "tip" | "video";
  title: string | null;
  content: string | null;
  mediaUrl: string | null;
  createdAt: string;
  sharesCount: number;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
  isFollowingDoctor: boolean;
  doctorName: string;
  doctorNameAr: string | null;
  doctorImage: string;
  specialty: string;
  specialtyAr: string;
}

export interface ApiPostComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: string;
}

export function getMagazinePosts(params?: { type?: string; doctorId?: number }): Promise<ApiMagazinePost[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.doctorId !== undefined) qs.set("doctorId", String(params.doctorId));
  const q = qs.toString();
  return request(`/magazine/posts${q ? `?${q}` : ""}`);
}

export function getMyMagazinePosts(): Promise<ApiMagazinePost[]> {
  return request("/magazine/posts/mine");
}

export function createMagazinePost(data: {
  type: "article" | "tip" | "video";
  title?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
}): Promise<{ id: number }> {
  return request("/magazine/posts", { method: "POST", body: JSON.stringify(data) });
}

export function deleteMagazinePost(id: number): Promise<{ ok: boolean }> {
  return request(`/magazine/posts/${id}`, { method: "DELETE" });
}

export function getPostComments(postId: number): Promise<ApiPostComment[]> {
  return request(`/magazine/posts/${postId}/comments`);
}

export function likePost(postId: number): Promise<{ liked: boolean; likesCount: number }> {
  return request(`/magazine/posts/${postId}/like`, { method: "POST" });
}

export function commentOnPost(postId: number, text: string): Promise<ApiPostComment> {
  return request(`/magazine/posts/${postId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function sharePost(postId: number): Promise<{ sharesCount: number }> {
  return request(`/magazine/posts/${postId}/share`, { method: "POST" });
}

export function followDoctor(doctorId: number): Promise<{ following: boolean }> {
  return request(`/doctors/${doctorId}/follow`, { method: "POST" });
}

export function getStats(): Promise<{ clinicsCount: number; citiesWithClinics: number }> {
  return request("/stats");
}

/* ─── Billing ─── */

export interface BillingInfo {
  status: "ACTIVE" | "INACTIVE" | "TRIAL";
  plan: string;
  endDate: string | null;
  isTrialUsed: boolean;
  price3Months: number;
  price6Months: number;
  price1Year: number;
  trialDays: number;
  currency: string;
}

export type PlanType = "MONTHS_3" | "MONTHS_6" | "YEARLY";

export function getBillingInfo(): Promise<BillingInfo> {
  return request("/billing/subscription");
}

export function startTrial(): Promise<{ success: boolean; status: string; endDate: string; trialDays: number }> {
  return request("/billing/start-trial", { method: "POST" });
}

export interface VoucherValidation {
  valid: boolean;
  code: string;
  discountPercentage: number;
  additionalFreeDays: number;
  originalPrice: number;
  finalPrice: number;
  currency: string;
}

export function validateVoucher(code: string, planType: PlanType): Promise<VoucherValidation> {
  return request("/billing/validate-voucher", { method: "POST", body: JSON.stringify({ code, planType }) });
}

export interface CheckoutParams { planType: PlanType; voucherCode?: string }
export function checkout(params: CheckoutParams): Promise<{ success: boolean; status: string; plan: string; endDate: string; price: number; currency: string }> {
  return request("/billing/checkout", { method: "POST", body: JSON.stringify(params) });
}

export interface PaymobInitiateParams { planType: PlanType; voucherCode?: string; paymentMethod?: "card" | "fawry" | "wallet" }
export interface PaymobInitiateResponse {
  paymentKey: string;
  iframeId: string;
  orderId: string;
  paymentId: number;
  iframeUrl: string;
}
export function initiatePaymobPayment(params: PaymobInitiateParams): Promise<PaymobInitiateResponse> {
  return request("/billing/paymob/initiate", { method: "POST", body: JSON.stringify(params) });
}

export interface PaymentRecord {
  id: number;
  planType: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  voucherCode: string | null;
  paymobOrderId: string | null;
  paymobTransactionId: string | null;
  createdAt: string;
  paidAt: string | null;
}

export function getPaymentHistory(): Promise<PaymentRecord[]> {
  return request("/billing/payments");
}

export async function downloadPaymentReceipt(paymentId: number): Promise<void> {
  const token = localStorage.getItem("egy_token");
  const res = await fetch(`${API_BASE}/billing/payments/${paymentId}/receipt`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${paymentId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ─── Admin Platform Settings ─── */

export interface PlatformSettings {
  doctorPrice3Months: number;
  doctorPrice6Months: number;
  doctorPrice1Year: number;
  centerPrice3Months: number;
  centerPrice6Months: number;
  centerPrice1Year: number;
  defaultFreeTrialDays: number;
  currency: string;
}

export function getAdminPlatformSettings(): Promise<PlatformSettings> {
  return request("/admin/settings");
}

export function updateAdminPlatformSettings(data: PlatformSettings): Promise<{ message: string }> {
  return request("/admin/settings", { method: "PUT", body: JSON.stringify(data) });
}

/* ─── Admin Vouchers ─── */

export interface AdminVoucher {
  id: number;
  code: string;
  discountPercentage: number;
  additionalFreeDays: number;
  expirationDate: string | null;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
}

export function getAdminVouchers(): Promise<AdminVoucher[]> {
  return request("/admin/vouchers");
}

export function createAdminVoucher(data: Omit<AdminVoucher, "id" | "currentUses" | "createdAt">): Promise<AdminVoucher> {
  return request("/admin/vouchers", { method: "POST", body: JSON.stringify(data) });
}

export function updateAdminVoucher(id: number, data: Partial<Pick<AdminVoucher, "discountPercentage" | "additionalFreeDays" | "expirationDate" | "isActive" | "maxUses">>): Promise<AdminVoucher> {
  return request(`/admin/vouchers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteAdminVoucher(id: number): Promise<{ message: string }> {
  return request(`/admin/vouchers/${id}`, { method: "DELETE" });
}

/* ─── Medical Center Profile ─── */

export type CenterSubType = "POLY_CLINIC" | "HOSPITAL" | "LAB" | "SCAN_CENTER" | "VETERINARY_CLINIC";

export interface ApiService {
  id: number;
  name: string;
  nameAr: string;
  displayOrder: number;
}

export function getServices(params?: { isVeterinary?: boolean }): Promise<ApiService[]> {
  const qs = params?.isVeterinary !== undefined ? `?isVeterinary=${params.isVeterinary}` : "";
  return request(`/services${qs}`);
}

export interface MedicalCenterProfile {
  id: number;
  userId: number;
  name: string;
  nameAr: string | null;
  type: string;
  subType: CenterSubType | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  bioAr: string | null;
  commercialRegistrationNumber: string | null;
  image: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  lat: number | null;
  lng: number | null;
  services: number[] | null;
  isApproved: boolean;
  hasVezeetaProfile: boolean;
  subscriptionStatus: string;
}

export function getMedicalCenterProfile(): Promise<MedicalCenterProfile> {
  return request("/medical-centers/profile");
}

export function updateMedicalCenterProfile(
  data: Partial<Pick<MedicalCenterProfile,
    "name" | "nameAr" | "type" | "subType" | "phone" | "address" |
    "bio" | "bioAr" | "commercialRegistrationNumber" | "image" |
    "website" | "facebook" | "instagram" | "lat" | "lng" | "services"
  >>,
): Promise<MedicalCenterProfile> {
  return request("/medical-centers/profile", { method: "PUT", body: JSON.stringify(data) });
}

/* ─── Affiliated Doctors ─── */

export interface AffiliatedDoctor extends AvailabilityConfig {
  id: number;
  name: string;
  nameAr: string;
  specialtyId: number | null;
  specialtyName: string | null;
  specialtyNameAr: string | null;
  fee: number | null;
  schedule: Record<string, { from: string; to: string }> | null;
  isActive: boolean;
}

export function getAffiliatedDoctors(): Promise<AffiliatedDoctor[]> {
  return request("/medical-centers/affiliated-doctors");
}

export function createAffiliatedDoctor(data: {
  name: string;
  nameAr?: string;
  specialtyId?: number | null;
  fee?: number | null;
  schedule?: Record<string, { from: string; to: string }> | null;
} & AvailabilityConfig): Promise<AffiliatedDoctor> {
  return request("/medical-centers/affiliated-doctors", { method: "POST", body: JSON.stringify(data) });
}

export function updateAffiliatedDoctor(
  id: number,
  data: Partial<{
    name: string;
    nameAr: string;
    specialtyId: number | null;
    fee: number | null;
    schedule: Record<string, { from: string; to: string }> | null;
  } & AvailabilityConfig>,
): Promise<AffiliatedDoctor> {
  return request(`/medical-centers/affiliated-doctors/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteAffiliatedDoctor(id: number): Promise<void> {
  return request(`/medical-centers/affiliated-doctors/${id}`, { method: "DELETE" });
}

/* ─── Medical Centers Directory (Home page section) ─── */

export interface MedicalCenterDirectoryEntry {
  id: number;
  name: string;
  nameAr: string | null;
  type: string;
  subType: CenterSubType | null;
  image: string | null;
  bio: string | null;
  bioAr: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  cityName: string | null;
  cityNameAr: string | null;
  specialties: { name: string | null; nameAr: string | null }[];
  doctors: { id: number; name: string; nameAr: string | null }[];
  doctorsCount: number;
  services: { id: number; name: string; nameAr: string }[];
}

export function getMedicalCentersDirectory(params?: { subType?: string }): Promise<MedicalCenterDirectoryEntry[]> {
  const qs = params?.subType ? `?subType=${encodeURIComponent(params.subType)}` : "";
  return request(`/medical-centers/directory${qs}`);
}

export interface MedicalCenterPublicProfile {
  id: number;
  name: string;
  nameAr: string | null;
  type: string;
  subType: CenterSubType | null;
  image: string | null;
  bio: string | null;
  bioAr: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  lat: number | null;
  lng: number | null;
  cityName: string | null;
  cityNameAr: string | null;
  specialties: { name: string | null; nameAr: string | null }[];
  doctors: { id: number; name: string; nameAr: string | null; specialtyName: string | null; specialtyNameAr: string | null }[];
  doctorsCount: number;
  services: { id: number; name: string; nameAr: string }[];
}

export function getMedicalCenterPublicProfile(id: number): Promise<MedicalCenterPublicProfile> {
  return request(`/medical-centers/${id}`);
}

/* ─── Admin Medical Centers ─── */

export interface AdminMedicalCenter {
  id: number;
  userId: number;
  name: string;
  nameAr: string | null;
  type: string;
  subType: CenterSubType | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  isActive: boolean;
  isApproved: boolean;
  hasVezeetaProfile: boolean;
  subscriptionStatus: string;
  createdAt: string;
  email: string | null;
  userPhone: string | null;
}

export function getAdminMedicalCenters(): Promise<AdminMedicalCenter[]> {
  return request("/admin/medical-centers");
}

export function approveCenter(id: number): Promise<AdminMedicalCenter> {
  return request(`/admin/medical-centers/${id}/approve`, { method: "PATCH" });
}

export function toggleCenterVezeeta(id: number): Promise<AdminMedicalCenter> {
  return request(`/admin/medical-centers/${id}/toggle-vezeeta`, { method: "PATCH" });
}

/* ─── Admin financial operations ─── */
export interface AdminFinancialSettings {
  deductionType: "FIXED" | "PERCENTAGE";
  deductionValue: number;
  platformSharePercentage: number;
  cashbackSharePercentage: number;
  minDoctorWalletBalance: number;
  subscriptionModelEnabled: boolean;
}

export interface AdminPlatformBankAccount {
  accountHolderName: string;
  bankName: string;
  accountNumber: string | null;
  iban: string | null;
  branchName?: string | null;
  swiftCode?: string | null;
}

export interface AdminWithdrawal {
  id: string;
  doctorUserId: string;
  amount: number;
  bankAccountId: string;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  adminNote?: string | null;
}

export function getAdminFinancialSettings(): Promise<AdminFinancialSettings> {
  return request("/admin/financial-settings");
}

export function updateAdminFinancialSettings(data: AdminFinancialSettings): Promise<AdminFinancialSettings> {
  return request("/admin/financial-settings", { method: "PATCH", body: JSON.stringify(data) });
}

export function getAdminPlatformBankAccount(): Promise<AdminPlatformBankAccount> {
  return request<AdminPlatformBankAccount>("/admin/platform-bank-account").catch((error: Error): AdminPlatformBankAccount => {
    if (error.message === "HTTP 404" || error.message === "Bank account not found") {
      return { accountHolderName: "", bankName: "", accountNumber: null, iban: "", branchName: "", swiftCode: "" };
    }
    throw error;
  });
}

export function updateAdminPlatformBankAccount(data: AdminPlatformBankAccount): Promise<AdminPlatformBankAccount> {
  return request("/admin/platform-bank-account", { method: "PUT", body: JSON.stringify(data) });
}

export function getAdminWithdrawals(): Promise<AdminWithdrawal[]> {
  return request("/admin/withdrawal-requests");
}

export function decideAdminWithdrawal(id: string, decision: "COMPLETED" | "REJECTED", adminNote?: string): Promise<AdminWithdrawal> {
  return request(`/admin/withdrawal-requests/${id}/decision`, { method: "POST", body: JSON.stringify({ decision, ...(adminNote ? { adminNote } : {}) }) });
}

export function giftAdminWalletFunds(doctorUserId: number, amount: number, description?: string): Promise<unknown> {
  return request("/admin/wallet-gifts", { method: "POST", body: JSON.stringify({ doctorUserId: String(doctorUserId), amount, description: description || undefined }) });
}

/* ─── Notifications ─── */

export interface AppNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export function getNotifications(): Promise<AppNotification[]> {
  return request("/notifications");
}

export function getUnreadCount(): Promise<{ count: number }> {
  return request("/notifications/unread-count");
}

export function markNotificationRead(id: number): Promise<{ ok: boolean }> {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  return request("/notifications/read-all", { method: "PATCH" });
}

/* ─── Push subscriptions ─── */

export function getVapidPublicKey(): Promise<{ publicKey: string }> {
  return request("/push/vapid-public-key");
}

export function savePushSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ ok: boolean }> {
  return request("/push/subscribe", { method: "POST", body: JSON.stringify(sub) });
}

export function removePushSubscription(endpoint: string): Promise<{ ok: boolean }> {
  return request("/push/subscribe", { method: "DELETE", body: JSON.stringify({ endpoint }) });
}
