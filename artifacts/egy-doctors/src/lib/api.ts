const API_BASE = "/api";

export interface AuthUser {
  id: number;
  name: string;
  nameAr?: string | null;
  phone: string;
  email?: string | null;
  role: "patient" | "doctor" | "medical_center" | "admin";
  doctorId?: number | null;
  accountStatus?: string | null;
  image?: string | null;
}

export interface ApiClinic {
  id: number;
  name: string;
  nameAr?: string;
  address: string;
  mapUrl: string;
  phone: string;
  fee: number;
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
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

export function forgotPassword(phone: string): Promise<{ message: string; resetToken?: string }> {
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
}): Promise<ApiDoctor[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.specialtyId) qs.set("specialtyId", String(params.specialtyId));
  if (params?.cityId) qs.set("cityId", String(params.cityId));
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
  areaId?: number;
  lat?: number;
  lng?: number;
}): Promise<ApiClinic> {
  return request(`/doctor/clinics/${id}`, { method: "PUT", body: JSON.stringify(data) });
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

export function getAppointments(params?: {
  doctorId?: number;
  patientUserId?: number;
  patientPhone?: string;
}): Promise<ApiAppointment[]> {
  const qs = new URLSearchParams();
  if (params?.doctorId) qs.set("doctorId", String(params.doctorId));
  if (params?.patientUserId) qs.set("patientUserId", String(params.patientUserId));
  if (params?.patientPhone) qs.set("patientPhone", params.patientPhone);
  const query = qs.toString();
  return request(`/appointments${query ? `?${query}` : ""}`);
}
