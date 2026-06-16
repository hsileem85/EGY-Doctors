export type Specialty = "Cardiology" | "Dermatology" | "Orthopedics" | "Neurology" | "Pediatrics";
export type Location = "New Cairo" | "Zamalek" | "Maadi" | "Heliopolis" | "Dokki";
export type Governorate = "Cairo" | "Giza" | "Alexandria";
export type InsuranceNetwork = "Cigna" | "AXA" | "MetLife" | "Bupa" | "None";

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  text: string;
}

export interface ClinicBranch {
  name: string;
  location: Location;
  address: string;
  mapUrl: string;
  fee: number;
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

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    location: "New Cairo",
    governorate: "Cairo",
    insuranceNetwork: "Cigna",
    fee: 450,
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    clinicAddress: "15 South Teseen St, 4th Floor, New Cairo",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=15+South+Teseen+St,+New+Cairo,+Egypt",
    clinics: [
      { name: "Heart Care Clinic", location: "New Cairo", address: "15 South Teseen St, 4th Floor", mapUrl: "https://www.google.com/maps/search/?api=1&query=15+South+Teseen+St,+New+Cairo,+Egypt", fee: 450 },
      { name: "Cairo Heart Center", location: "Heliopolis", address: "3 Merghany St, Heliopolis", mapUrl: "https://www.google.com/maps/search/?api=1&query=3+Merghany+St,+Heliopolis,+Cairo,+Egypt", fee: 500 },
    ],
    slots: ["Today 4:00 PM", "Tomorrow 9:00 AM", "Thu 5:30 PM", "Fri 11:00 AM"],
    distance: "1.2 km",
    rating: 4.9,
    reviews: 128,
    reviewList: [
      { id: "r1", patientName: "Omar Tarek", rating: 5, date: "2026-06-10", text: "Dr. Ahmed is an excellent cardiologist. He took time to explain everything and made me feel comfortable. Highly recommended!" },
      { id: "r2", patientName: "Nourhan Ali", rating: 5, date: "2026-05-28", text: "Very professional and thorough. The clinic is clean and well-organized. Will definitely visit again." },
      { id: "r3", patientName: "Youssef Adel", rating: 4, date: "2026-05-15", text: "Great doctor, but the wait time was a bit long. Otherwise, the consultation was very helpful." },
      { id: "r4", patientName: "Sara Mahmoud", rating: 5, date: "2026-04-22", text: "The best cardiologist I have ever visited. He detected an issue that previous doctors missed." },
      { id: "r5", patientName: "Khaled Ibrahim", rating: 5, date: "2026-04-10", text: "Very knowledgeable and patient. Explained my condition in simple terms and gave me a clear treatment plan." },
    ],
    nextAvailable: "Today, 4:00 PM"
  },
  {
    id: "2",
    name: "Dr. Sara Mahmoud",
    specialty: "Dermatology",
    location: "Zamalek",
    governorate: "Cairo",
    insuranceNetwork: "AXA",
    fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    clinicAddress: "8A 26th of July Corridor, Zamalek",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=8A+26th+of+July+Corridor,+Zamalek,+Cairo,+Egypt",
    clinics: [
      { name: "Skin & Glow Clinic", location: "Zamalek", address: "8A 26th of July Corridor", mapUrl: "https://www.google.com/maps/search/?api=1&query=8A+26th+of+July+Corridor,+Zamalek,+Cairo,+Egypt", fee: 350 },
      { name: "DermaCare Maadi", location: "Maadi", address: "7 Road 233, Maadi", mapUrl: "https://www.google.com/maps/search/?api=1&query=7+Road+233,+Maadi,+Cairo,+Egypt", fee: 350 },
    ],
    slots: ["Today 2:00 PM", "Tomorrow 1:00 PM", "Wed 6:00 PM", "Sat 10:00 AM"],
    distance: "2.5 km",
    rating: 4.8,
    reviews: 96,
    reviewList: [
      { id: "r6", patientName: "Mona Hassan", rating: 5, date: "2026-06-08", text: "Dr. Sara transformed my skin! After years of acne issues, I finally have clear skin. Amazing results!" },
      { id: "r7", patientName: "Laila Omar", rating: 4, date: "2026-05-20", text: "Good dermatologist, very gentle with treatments. The laser session was painless and effective." },
      { id: "r8", patientName: "Amr Zaki", rating: 5, date: "2026-05-05", text: "Professional and friendly. The clinic has the latest equipment. Very satisfied with the results." },
    ],
    nextAvailable: "Tomorrow, 10:30 AM"
  },
  {
    id: "3",
    name: "Dr. Kareem Hassan",
    specialty: "Orthopedics",
    location: "Maadi",
    governorate: "Cairo",
    insuranceNetwork: "MetLife",
    fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    clinicAddress: "45 Road 9, Maadi",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=45+Road+9,+Maadi,+Cairo,+Egypt",
    clinics: [
      { name: "Maadi Ortho Center", location: "Maadi", address: "45 Road 9, Maadi", mapUrl: "https://www.google.com/maps/search/?api=1&query=45+Road+9,+Maadi,+Cairo,+Egypt", fee: 400 },
    ],
    slots: ["Today 5:00 PM", "Tomorrow 4:30 PM", "Thu 2:00 PM", "Mon 12:00 PM"],
    distance: "3.8 km",
    rating: 4.9,
    reviews: 154,
    reviewList: [
      { id: "r9", patientName: "Salma Fouad", rating: 5, date: "2026-06-12", text: "Dr. Kareem performed my knee surgery flawlessly. Recovery was faster than expected. A true expert!" },
      { id: "r10", patientName: "Hassan Mostafa", rating: 5, date: "2026-05-30", text: "Best orthopedic surgeon in Cairo. He explained every step of my shoulder rehabilitation." },
      { id: "r11", patientName: "Dina Khaled", rating: 4, date: "2026-05-10", text: "Very skilled doctor. The physiotherapy plan he prescribed worked wonders for my back pain." },
    ],
    nextAvailable: "Today, 7:15 PM"
  },
  {
    id: "4",
    name: "Dr. Laila Omar",
    specialty: "Pediatrics",
    location: "Heliopolis",
    governorate: "Cairo",
    insuranceNetwork: "Bupa",
    fee: 300,
    bio: "Compassionate pediatrician dedicated to child health, development, and vaccination programs.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    clinicAddress: "12 El Hegaz St, Heliopolis",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=12+El+Hegaz+St,+Heliopolis,+Cairo,+Egypt",
    clinics: [
      { name: "Little Stars Clinic", location: "Heliopolis", address: "12 El Hegaz St, Heliopolis", mapUrl: "https://www.google.com/maps/search/?api=1&query=12+El+Hegaz+St,+Heliopolis,+Cairo,+Egypt", fee: 300 },
      { name: "Kids Care New Cairo", location: "New Cairo", address: "90 North 90 St, New Cairo", mapUrl: "https://www.google.com/maps/search/?api=1&query=90+North+90+St,+New+Cairo,+Egypt", fee: 300 },
    ],
    slots: ["Today 10:00 AM", "Tomorrow 11:30 AM", "Wed 9:00 AM", "Sun 3:00 PM"],
    distance: "5.1 km",
    rating: 4.7,
    reviews: 82,
    reviewList: [
      { id: "r12", patientName: "Fatma Ali", rating: 5, date: "2026-06-05", text: "Dr. Laila is wonderful with children. My kids actually look forward to their checkups!" },
      { id: "r13", patientName: "Karim Tarek", rating: 4, date: "2026-05-18", text: "Great pediatrician, very patient with my toddler. The vaccination schedule was well explained." },
    ],
    nextAvailable: "Wed, 9:00 AM"
  },
  {
    id: "5",
    name: "Dr. Tarek Ibrahim",
    specialty: "Neurology",
    location: "Dokki",
    governorate: "Giza",
    insuranceNetwork: "None",
    fee: 500,
    bio: "Renowned neurologist treating complex neurological disorders, migraines, and epilepsy.",
    image: "https://randomuser.me/api/portraits/men/82.jpg",
    clinicAddress: "22 Mossadak St, Dokki",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=22+Mossadak+St,+Dokki,+Giza,+Egypt",
    clinics: [
      { name: "Neurology & Brain Clinic", location: "Dokki", address: "22 Mossadak St, Dokki", mapUrl: "https://www.google.com/maps/search/?api=1&query=22+Mossadak+St,+Dokki,+Giza,+Egypt", fee: 500 },
    ],
    slots: ["Today 6:00 PM", "Tomorrow 7:00 PM", "Thu 8:00 PM", "Fri 4:00 PM"],
    distance: "4.2 km",
    rating: 4.8,
    reviews: 110,
    reviewList: [
      { id: "r14", patientName: "Nadia Sherif", rating: 5, date: "2026-06-09", text: "Dr. Tarek helped me manage my chronic migraines after years of suffering. Life-changing treatment!" },
      { id: "r15", patientName: "Ahmed Samir", rating: 4, date: "2026-05-25", text: "Very thorough neurological examination. He identified issues that other neurologists overlooked." },
      { id: "r16", patientName: "Reem Hani", rating: 5, date: "2026-05-12", text: "Excellent neurologist. The cognitive therapy program he designed has significantly improved my condition." },
    ],
    nextAvailable: "Today, 6:00 PM"
  }
];

export const appointments: Appointment[] = [
  { id: "a1", patientName: "Omar Tarek", phone: "01012345678", date: "2023-11-01", time: "4:00 PM", doctorId: "1" },
  { id: "a2", patientName: "Nourhan Ali", phone: "01123456789", date: "2023-11-02", time: "9:00 AM", doctorId: "1" },
  { id: "a3", patientName: "Youssef Adel", phone: "01234567890", date: "2023-11-02", time: "1:00 PM", doctorId: "2" },
  { id: "a4", patientName: "Mona Hassan", phone: "01545678901", date: "2023-11-03", time: "6:00 PM", doctorId: "2" },
  { id: "a5", patientName: "Salma Fouad", phone: "01098765432", date: "2023-11-04", time: "10:00 AM", doctorId: "4" },
  { id: "a6", patientName: "Amr Zaki", phone: "01187654321", date: "2023-11-05", time: "5:00 PM", doctorId: "3" },
];

export const specialties: Specialty[] = ["Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];
export const locations: Location[] = ["New Cairo", "Zamalek", "Maadi", "Heliopolis", "Dokki"];
export const governorates: Governorate[] = ["Cairo", "Giza", "Alexandria"];
export const insuranceNetworks: InsuranceNetwork[] = ["Cigna", "AXA", "MetLife", "Bupa", "None"];
export const stats = [
  { value: "2,500+", label: "Verified Doctors", labelAr: "طبيب معتمد" },
  { value: "150K+", label: "Happy Patients", labelAr: "مريض سعيد" },
  { value: "50+", label: "Medical Partners", labelAr: "شريك طبي" },
  { value: "4.9/5", label: "Average Rating", labelAr: "متوسط التقييم" }
];
