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
  image?: string | null;
  assistantClinicId?: number | null;
  assistantDoctorId?: number | null;
  siteLanguage?: "en" | "ar" | null;
  notificationLanguage?: "en" | "ar" | null;
  notifyViaEmail?: boolean | null;
  notifyViaSms?: boolean | null;
  notifyViaWhatsApp?: boolean | null;
}

export interface ApiClinic {
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
}

export interface ApiReview {
  id: number;
  patientName: string;
  rating: number;
  text: string;
  date: string;
}

export interface ApiDoctor {
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
  lat?: number;
  lng?: number;
}): Promise<ApiDoctor[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.specialtyId) qs.set("specialtyId", String(params.specialtyId));
  if (params?.cityId) qs.set("cityId", String(params.cityId));
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
  bio?: string;
  bioAr?: string;
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
  name: string;
  nameAr?: string;
  address?: string;
  mapUrl?: string;
  phone?: string;
  fee?: number;
  followUpDays?: number;
  followUpPrice?: number;
  bookingConfirmationMethod?: "automatic" | "manual";
  areaId?: number;
  lat?: number;
  lng?: number;
}): Promise<ApiClinic> {
  return request("/doctor/clinics", { method: "POST", body: JSON.stringify(data) });
}

export function updateClinic(id: number, data: {
  name?: string;
  nameAr?: string;
  address?: string;
  mapUrl?: string;
  phone?: string;
  fee?: number;
  followUpDays?: number;
  followUpPrice?: number;
  bookingConfirmationMethod?: "automatic" | "manual";
  areaId?: number;
  lat?: number;
  lng?: number;
}): Promise<ApiClinic> {
  return request(`/doctor/clinics/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function updateAppointmentStatus(id: number, status: ApiAppointment["status"]): Promise<ApiAppointment> {
  return request(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
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
