/* ── Types kept for legacy compatibility ── */
export type Specialty = string;
export type Location = string;
export type Governorate = string;
export type InsuranceNetwork = string;

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  text: string;
}

export interface ClinicBranch {
  name: string;
  location: string;
  address: string;
  mapUrl: string;
  fee: number;
  phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  location: Location;
  governorate: Governorate;
  insuranceNetwork: InsuranceNetwork;
  fee: number;
  bio: string;
  image: string;
  clinicAddress: string;
  mapUrl: string;
  clinics: ClinicBranch[];
  slots: string[];
  distance: string;
  rating: number;
  reviews: number;
  reviewList: Review[];
  nextAvailable: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  doctorId: string;
}

/* ── All data fetched from API — kept empty here ── */
export const doctors: Doctor[] = [];
export const appointments: Appointment[] = [];
export const specialties: string[] = [];
export const locations: string[] = [];
export const governorates: string[] = [];
export const insuranceNetworks: string[] = [];

export const stats = {
  doctors: 2500,
  cities: 27,
  bookings: 150000,
  rating: 4.9,
};
