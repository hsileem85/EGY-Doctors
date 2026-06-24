import bcrypt from "bcryptjs";
import {
  db,
  specialtiesTable,
  citiesTable,
  areasTable,
  usersTable,
  doctorsTable,
  clinicsTable,
  reviewsTable,
} from "@workspace/db";

const HASH = await bcrypt.hash("password123", 10);
const ADMIN_HASH = await bcrypt.hash("admin123", 10);

function img(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4A853&size=200`;
}

/* ── Specialties ── */
const specialties = [
  { name: "Cardiology", nameAr: "أمراض القلب", displayOrder: 1 },
  { name: "Dermatology", nameAr: "الأمراض الجلدية", displayOrder: 2 },
  { name: "Orthopedics", nameAr: "جراحة العظام", displayOrder: 3 },
  { name: "Neurology", nameAr: "طب الأعصاب", displayOrder: 4 },
  { name: "Pediatrics", nameAr: "طب الأطفال", displayOrder: 5 },
  { name: "Gynecology", nameAr: "أمراض النساء والتوليد", displayOrder: 6 },
  { name: "Ophthalmology", nameAr: "طب وجراحة العيون", displayOrder: 7 },
  { name: "ENT", nameAr: "الأنف والأذن والحنجرة", displayOrder: 8 },
  { name: "Psychiatry", nameAr: "الطب النفسي", displayOrder: 9 },
  { name: "Urology", nameAr: "المسالك البولية", displayOrder: 10 },
  { name: "Gastroenterology", nameAr: "أمراض الجهاز الهضمي", displayOrder: 11 },
  { name: "Radiology", nameAr: "الأشعة التشخيصية", displayOrder: 12 },
  { name: "Oncology", nameAr: "الأورام", displayOrder: 13 },
  { name: "Endocrinology", nameAr: "الغدد الصماء", displayOrder: 14 },
  { name: "General Medicine", nameAr: "الطب العام", displayOrder: 15 },
  { name: "Dentistry", nameAr: "طب الأسنان", displayOrder: 16 },
];

console.log("🌱 Seeding specialties...");
const insertedSpecialties = await db
  .insert(specialtiesTable)
  .values(specialties)
  .onConflictDoNothing()
  .returning();

const specialtyMap = Object.fromEntries(
  insertedSpecialties.map((s) => [s.name, s.id])
);
// If some already existed, fetch them
const allSpecs = await db.select().from(specialtiesTable);
for (const s of allSpecs) specialtyMap[s.name] = s.id;

/* ── Cities ── */
const cities = [
  { name: "Cairo", nameAr: "القاهرة", displayOrder: 1 },
  { name: "Alexandria", nameAr: "الإسكندرية", displayOrder: 2 },
  { name: "Giza", nameAr: "الجيزة", displayOrder: 3 },
  { name: "Mansoura", nameAr: "المنصورة", displayOrder: 4 },
  { name: "Assiut", nameAr: "أسيوط", displayOrder: 5 },
  { name: "Tanta", nameAr: "طنطا", displayOrder: 6 },
  { name: "Zagazig", nameAr: "الزقازيق", displayOrder: 7 },
  { name: "Port Said", nameAr: "بورسعيد", displayOrder: 8 },
];

console.log("🌍 Seeding cities...");
const insertedCities = await db
  .insert(citiesTable)
  .values(cities)
  .onConflictDoNothing()
  .returning();

const cityMap = Object.fromEntries(insertedCities.map((c) => [c.name, c.id]));
const allCities = await db.select().from(citiesTable);
for (const c of allCities) cityMap[c.name] = c.id;

/* ── Areas ── */
const areas = [
  // Cairo
  { cityName: "Cairo", name: "Maadi", nameAr: "المعادي", displayOrder: 1 },
  { cityName: "Cairo", name: "Heliopolis", nameAr: "مصر الجديدة", displayOrder: 2 },
  { cityName: "Cairo", name: "Nasr City", nameAr: "مدينة نصر", displayOrder: 3 },
  { cityName: "Cairo", name: "Zamalek", nameAr: "الزمالك", displayOrder: 4 },
  { cityName: "Cairo", name: "Downtown Cairo", nameAr: "وسط البلد", displayOrder: 5 },
  { cityName: "Cairo", name: "New Cairo", nameAr: "القاهرة الجديدة", displayOrder: 6 },
  { cityName: "Cairo", name: "6th October", nameAr: "السادس من أكتوبر", displayOrder: 7 },
  // Alexandria
  { cityName: "Alexandria", name: "Smouha", nameAr: "سموحة", displayOrder: 1 },
  { cityName: "Alexandria", name: "Stanley", nameAr: "ستانلي", displayOrder: 2 },
  { cityName: "Alexandria", name: "Roushdy", nameAr: "روشدي", displayOrder: 3 },
  { cityName: "Alexandria", name: "Gleem", nameAr: "جليم", displayOrder: 4 },
  // Giza
  { cityName: "Giza", name: "Dokki", nameAr: "الدقي", displayOrder: 1 },
  { cityName: "Giza", name: "Mohandessin", nameAr: "المهندسين", displayOrder: 2 },
  { cityName: "Giza", name: "Agouza", nameAr: "العجوزة", displayOrder: 3 },
  { cityName: "Giza", name: "Haram", nameAr: "الهرم", displayOrder: 4 },
];

console.log("📍 Seeding areas...");
const areaRows = areas.map((a) => ({
  cityId: cityMap[a.cityName],
  name: a.name,
  nameAr: a.nameAr,
  displayOrder: a.displayOrder,
}));

const insertedAreas = await db
  .insert(areasTable)
  .values(areaRows)
  .onConflictDoNothing()
  .returning();

const areaMap = Object.fromEntries(insertedAreas.map((a) => [a.name, a.id]));
const allAreas = await db.select().from(areasTable);
for (const a of allAreas) areaMap[a.name] = a.id;

/* ── Doctors ── */
const doctorSeed = [
  {
    name: "Dr. Ahmed Youssef",
    phone: "01001000001",
    email: "ahmed.youssef@egydoctors.com",
    specialty: "Cardiology",
    city: "Cairo",
    area: "Maadi",
    fee: 400,
    experience: 18,
    rating: 4.9,
    reviews: 312,
    bio: "Prof. Ahmed Youssef is a leading interventional cardiologist with 18 years of experience at Cairo University Hospital. Specializing in coronary artery disease, heart failure management, and complex cardiac interventions.",
    clinics: [
      {
        name: "Maadi Cardiac Center",
        address: "15 Road 9, Maadi, Cairo",
        phone: "01001000001",
        fee: 400,
        area: "Maadi",
        mapUrl: "https://maps.google.com/?q=Maadi+Cairo",
      },
      {
        name: "Heliopolis Heart Clinic",
        address: "32 Makram Ebeid St, Heliopolis",
        phone: "01001000002",
        fee: 450,
        area: "Heliopolis",
        mapUrl: "https://maps.google.com/?q=Heliopolis+Cairo",
      },
    ],
    reviewData: [
      { name: "Khaled Hassan", rating: 5, text: "Excellent doctor, very professional and thorough. Fixed my heart condition perfectly. Highly recommend!" },
      { name: "Mona Samir", rating: 5, text: "Best cardiologist in Cairo. Very detailed explanation and caring attitude." },
      { name: "Omar Farouk", rating: 4, text: "Very good doctor. Waiting time was a bit long but totally worth it." },
    ],
  },
  {
    name: "Dr. Sara Nasser",
    phone: "01001000003",
    email: "sara.nasser@egydoctors.com",
    specialty: "Dermatology",
    city: "Cairo",
    area: "Zamalek",
    fee: 350,
    experience: 12,
    rating: 4.8,
    reviews: 187,
    bio: "Dr. Sara Nasser is a renowned dermatologist and cosmetologist with 12 years of experience. Expert in acne treatment, anti-aging procedures, laser therapy, and skin rejuvenation techniques.",
    clinics: [
      {
        name: "Zamalek Skin Clinic",
        address: "5 Hassan Sabry St, Zamalek, Cairo",
        phone: "01001000003",
        fee: 350,
        area: "Zamalek",
        mapUrl: "https://maps.google.com/?q=Zamalek+Cairo",
      },
    ],
    reviewData: [
      { name: "Rania Ali", rating: 5, text: "Dr. Sara is amazing! My skin has transformed completely after her treatment plan." },
      { name: "Dina Mahmoud", rating: 5, text: "Very professional and knowledgeable. Results exceeded my expectations." },
      { name: "Heba Mostafa", rating: 4, text: "Great doctor, explains everything clearly. Clinic is clean and modern." },
    ],
  },
  {
    name: "Dr. Mohamed El-Sayed",
    phone: "01001000005",
    email: "mohamed.elsayed@egydoctors.com",
    specialty: "Orthopedics",
    city: "Cairo",
    area: "Nasr City",
    fee: 500,
    experience: 22,
    rating: 4.9,
    reviews: 428,
    bio: "Prof. Mohamed El-Sayed is a pioneer in orthopedic surgery with 22 years at the forefront of joint replacement and sports medicine. Chief of Orthopedics at Ain Shams University Hospital.",
    clinics: [
      {
        name: "Nasr City Orthopedic Center",
        address: "12 Abbas El-Akkad St, Nasr City",
        phone: "01001000005",
        fee: 500,
        area: "Nasr City",
        mapUrl: "https://maps.google.com/?q=Nasr+City+Cairo",
      },
      {
        name: "New Cairo Bone & Joint Clinic",
        address: "90 St, New Cairo, 5th Settlement",
        phone: "01001000006",
        fee: 600,
        area: "New Cairo",
        mapUrl: "https://maps.google.com/?q=New+Cairo",
      },
    ],
    reviewData: [
      { name: "Tarek Ibrahim", rating: 5, text: "Prof. Mohamed performed my knee replacement. Recovery was smooth and I'm pain-free now." },
      { name: "Samira Kamel", rating: 5, text: "Exceptional surgeon. Very detailed pre-op consultation and post-op follow up." },
      { name: "Amr Tawfik", rating: 5, text: "Best orthopedic surgeon in Egypt. Fixed my herniated disc without surgery using injection therapy." },
    ],
  },
  {
    name: "Dr. Hana Sherif",
    phone: "01001000007",
    email: "hana.sherif@egydoctors.com",
    specialty: "Pediatrics",
    city: "Cairo",
    area: "Heliopolis",
    fee: 300,
    experience: 15,
    rating: 4.8,
    reviews: 523,
    bio: "Dr. Hana Sherif is a dedicated pediatrician with 15 years of caring for children from newborns to teenagers. Specialist in growth disorders, childhood nutrition, and developmental pediatrics.",
    clinics: [
      {
        name: "Heliopolis Children's Clinic",
        address: "18 El-Nozha St, Heliopolis, Cairo",
        phone: "01001000007",
        fee: 300,
        area: "Heliopolis",
        mapUrl: "https://maps.google.com/?q=Heliopolis+Cairo",
      },
    ],
    reviewData: [
      { name: "Fatma Adel", rating: 5, text: "Dr. Hana is wonderful with children! My kids actually look forward to their check-ups." },
      { name: "Mariam Saad", rating: 5, text: "She's incredibly patient and knowledgeable. Always available for follow-up questions." },
      { name: "Nadia Fouad", rating: 4, text: "Very professional pediatrician. Clinic is child-friendly and welcoming." },
    ],
  },
  {
    name: "Dr. Yasser Gamal",
    phone: "01001000009",
    email: "yasser.gamal@egydoctors.com",
    specialty: "Neurology",
    city: "Cairo",
    area: "Downtown Cairo",
    fee: 550,
    experience: 20,
    rating: 4.7,
    reviews: 289,
    bio: "Dr. Yasser Gamal is a distinguished neurologist specializing in stroke management, epilepsy treatment, and neurodegenerative diseases. Graduate of Cairo University and Johns Hopkins Hospital fellowship.",
    clinics: [
      {
        name: "Cairo Neurology Center",
        address: "4 Tahrir Square, Downtown Cairo",
        phone: "01001000009",
        fee: 550,
        area: "Downtown Cairo",
        mapUrl: "https://maps.google.com/?q=Tahrir+Square+Cairo",
      },
    ],
    reviewData: [
      { name: "Sherif Hamdi", rating: 5, text: "Dr. Yasser diagnosed my migraine condition after years of misdiagnosis. Life changing!" },
      { name: "Alia Badr", rating: 5, text: "Extremely knowledgeable and compassionate. Takes time to explain everything." },
      { name: "Mahmoud Galal", rating: 4, text: "Excellent neurologist. Very thorough examination process." },
    ],
  },
  {
    name: "Dr. Layla Hassan",
    phone: "01001000011",
    email: "layla.hassan@egydoctors.com",
    specialty: "Gynecology",
    city: "Cairo",
    area: "Maadi",
    fee: 400,
    experience: 14,
    rating: 4.9,
    reviews: 367,
    bio: "Dr. Layla Hassan is a highly respected OB-GYN with special expertise in high-risk pregnancy, laparoscopic surgery, and reproductive medicine. Trained at Cairo University and Oxford University.",
    clinics: [
      {
        name: "Maadi Women's Health Center",
        address: "22 Road 250, Maadi, Cairo",
        phone: "01001000011",
        fee: 400,
        area: "Maadi",
        mapUrl: "https://maps.google.com/?q=Maadi+Cairo",
      },
    ],
    reviewData: [
      { name: "Noha Salah", rating: 5, text: "Dr. Layla guided me through a high-risk pregnancy beautifully. Forever grateful." },
      { name: "Reem Ezzat", rating: 5, text: "Best gynecologist I've ever visited. Very thorough and caring." },
      { name: "Samar Ibrahim", rating: 5, text: "Professional, experienced, and always makes you feel comfortable." },
    ],
  },
  {
    name: "Dr. Karim Atef",
    phone: "01001000013",
    email: "karim.atef@egydoctors.com",
    specialty: "Ophthalmology",
    city: "Alexandria",
    area: "Smouha",
    fee: 350,
    experience: 16,
    rating: 4.8,
    reviews: 241,
    bio: "Dr. Karim Atef is a leading ophthalmologist in Alexandria with 16 years of experience in LASIK surgery, cataract operations, retinal diseases, and pediatric eye care.",
    clinics: [
      {
        name: "Alexandria Eye Center",
        address: "7 Victor Emanuel St, Smouha, Alexandria",
        phone: "01001000013",
        fee: 350,
        area: "Smouha",
        mapUrl: "https://maps.google.com/?q=Smouha+Alexandria",
      },
      {
        name: "Roushdy Vision Clinic",
        address: "15 Mostafa Kamel St, Roushdy, Alexandria",
        phone: "01001000014",
        fee: 400,
        area: "Roushdy",
        mapUrl: "https://maps.google.com/?q=Roushdy+Alexandria",
      },
    ],
    reviewData: [
      { name: "Wael Mansour", rating: 5, text: "Dr. Karim performed my LASIK surgery. Perfect results, zero complications." },
      { name: "Ghada Fahmy", rating: 5, text: "Very professional. Explained the procedure fully and results were excellent." },
      { name: "Tarek Lotfy", rating: 4, text: "Good ophthalmologist. Helpful staff and modern equipment." },
    ],
  },
  {
    name: "Dr. Nour El-Din Ramzy",
    phone: "01001000015",
    email: "nour.ramzy@egydoctors.com",
    specialty: "Gastroenterology",
    city: "Giza",
    area: "Mohandessin",
    fee: 450,
    experience: 13,
    rating: 4.7,
    reviews: 178,
    bio: "Dr. Nour El-Din Ramzy specializes in digestive diseases, endoscopy, colonoscopy, and inflammatory bowel disease management. Known for his precision in diagnostic procedures and patient-centered approach.",
    clinics: [
      {
        name: "Mohandessin GI Clinic",
        address: "28 Gamet El-Dewal El-Arabia St, Mohandessin",
        phone: "01001000015",
        fee: 450,
        area: "Mohandessin",
        mapUrl: "https://maps.google.com/?q=Mohandessin+Giza",
      },
    ],
    reviewData: [
      { name: "Ayman Rizk", rating: 5, text: "Dr. Nour diagnosed my Crohn's disease after years of confusion. Excellent specialist." },
      { name: "Hind Abou Zeid", rating: 4, text: "Professional and detailed. Endoscopy procedure was smooth and quick." },
      { name: "Samy Wahba", rating: 5, text: "Best gastroenterologist in Giza. Very thorough and takes time to explain." },
    ],
  },
  {
    name: "Dr. Amira Fawzi",
    phone: "01001000017",
    email: "amira.fawzi@egydoctors.com",
    specialty: "Psychiatry",
    city: "Cairo",
    area: "Zamalek",
    fee: 500,
    experience: 10,
    rating: 4.9,
    reviews: 143,
    bio: "Dr. Amira Fawzi is a distinguished psychiatrist and psychotherapist specializing in anxiety disorders, depression, OCD, and trauma therapy. She brings warmth and evidence-based practice to mental health care.",
    clinics: [
      {
        name: "Zamalek Mind & Wellness Center",
        address: "11 Ismail Mohamed St, Zamalek, Cairo",
        phone: "01001000017",
        fee: 500,
        area: "Zamalek",
        mapUrl: "https://maps.google.com/?q=Zamalek+Cairo",
      },
    ],
    reviewData: [
      { name: "Yasmine Khairy", rating: 5, text: "Dr. Amira changed my life. Her CBT sessions helped me overcome severe anxiety." },
      { name: "Karim Soliman", rating: 5, text: "Excellent psychiatrist. Non-judgmental and highly effective treatment approach." },
      { name: "Lina Fouad", rating: 5, text: "Very empathetic and professional. I finally feel understood and supported." },
    ],
  },
  {
    name: "Dr. Bassem Samir",
    phone: "01001000019",
    email: "bassem.samir@egydoctors.com",
    specialty: "Endocrinology",
    city: "Cairo",
    area: "Nasr City",
    fee: 400,
    experience: 17,
    rating: 4.7,
    reviews: 215,
    bio: "Dr. Bassem Samir is an endocrinologist with expertise in diabetes management, thyroid disorders, obesity treatment, and hormonal imbalances. Trained at Cairo University and Royal College of Physicians, London.",
    clinics: [
      {
        name: "Nasr City Diabetes & Endocrine Center",
        address: "45 Makram Ebeid St, Nasr City, Cairo",
        phone: "01001000019",
        fee: 400,
        area: "Nasr City",
        mapUrl: "https://maps.google.com/?q=Nasr+City+Cairo",
      },
    ],
    reviewData: [
      { name: "Saad El-Shafei", rating: 5, text: "Dr. Bassem got my diabetes under control in 3 months. Excellent approach." },
      { name: "Hala Morsi", rating: 4, text: "Very knowledgeable about thyroid conditions. Wait time is a bit long." },
      { name: "Mahmoud Hafez", rating: 5, text: "Best endocrinologist in Cairo. Very detailed and patient with explanations." },
    ],
  },
  {
    name: "Dr. Moustafa Abdou",
    phone: "01001000021",
    email: "moustafa.abdou@egydoctors.com",
    specialty: "ENT",
    city: "Alexandria",
    area: "Stanley",
    fee: 280,
    experience: 11,
    rating: 4.6,
    reviews: 193,
    bio: "Dr. Moustafa Abdou is an ENT specialist with expertise in sinus surgery, cochlear implants, voice disorders, and pediatric ENT. Known for minimally invasive surgical techniques.",
    clinics: [
      {
        name: "Alexandria ENT & Head-Neck Clinic",
        address: "19 Stanley Beach Road, Stanley, Alexandria",
        phone: "01001000021",
        fee: 280,
        area: "Stanley",
        mapUrl: "https://maps.google.com/?q=Stanley+Alexandria",
      },
    ],
    reviewData: [
      { name: "Ehab Salama", rating: 5, text: "Dr. Moustafa fixed my deviated septum. Breathing is so much better now!" },
      { name: "Iman El-Sisi", rating: 4, text: "Good doctor. Friendly and professional. Clinic is well-equipped." },
      { name: "Adham Nour", rating: 5, text: "Excellent ENT specialist. Diagnosed and treated my chronic sinusitis." },
    ],
  },
  {
    name: "Dr. Rasha Abdel-Aziz",
    phone: "01001000023",
    email: "rasha.abdelaziz@egydoctors.com",
    specialty: "General Medicine",
    city: "Giza",
    area: "Dokki",
    fee: 200,
    experience: 9,
    rating: 4.6,
    reviews: 318,
    bio: "Dr. Rasha Abdel-Aziz is a compassionate general practitioner providing comprehensive primary care for all ages. Expert in preventive medicine, chronic disease management, and health screenings.",
    clinics: [
      {
        name: "Dokki Family Medical Center",
        address: "7 El-Batal Ahmed Abd El-Aziz St, Dokki, Giza",
        phone: "01001000023",
        fee: 200,
        area: "Dokki",
        mapUrl: "https://maps.google.com/?q=Dokki+Giza",
      },
      {
        name: "Agouza Primary Care Clinic",
        address: "3 Nile St, Agouza, Giza",
        phone: "01001000024",
        fee: 200,
        area: "Agouza",
        mapUrl: "https://maps.google.com/?q=Agouza+Giza",
      },
    ],
    reviewData: [
      { name: "Wafaa Galal", rating: 5, text: "Dr. Rasha is wonderful. Very caring and always available for urgent consultations." },
      { name: "Hassan El-Masry", rating: 4, text: "Great family doctor. Thorough check-ups and good follow-up." },
      { name: "Suzan Nabil", rating: 5, text: "My whole family sees Dr. Rasha. Highly recommend for primary care." },
    ],
  },
];

/* ── Admin user ── */
console.log("🔐 Seeding admin user...");
await db
  .insert(usersTable)
  .values({
    name: "Admin",
    phone: "01000000000",
    passwordHash: ADMIN_HASH,
    role: "admin",
  })
  .onConflictDoNothing();

console.log("👨‍⚕️ Seeding doctors...");

for (const d of doctorSeed) {
  // 1. Create user
  const [user] = await db
    .insert(usersTable)
    .values({
      name: d.name,
      phone: d.phone,
      email: d.email,
      passwordHash: HASH,
      role: "doctor",
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    console.log(`  ⚠️  Skipping ${d.name} (user already exists)`);
    continue;
  }

  // 2. Create doctor
  const [doctor] = await db
    .insert(doctorsTable)
    .values({
      userId: user.id,
      nameEn: d.name,
      specialtyId: specialtyMap[d.specialty],
      cityId: cityMap[d.city],
      areaId: areaMap[d.area],
      bioEn: d.bio,
      image: img(d.name),
      fee: d.fee,
      experience: d.experience,
      rating: d.rating,
      reviews: d.reviews,
      accountStatus: "approved",
      onboardingStatus: "approved",
    })
    .returning();

  // 3. Create clinics
  for (const c of d.clinics) {
    await db.insert(clinicsTable).values({
      doctorId: doctor.id,
      nameEn: c.name,
      address: c.address,
      phone: c.phone,
      fee: c.fee,
      areaId: areaMap[c.area] ?? null,
      mapUrl: c.mapUrl,
    });
  }

  // 4. Create reviews
  for (const r of d.reviewData) {
    await db.insert(reviewsTable).values({
      doctorId: doctor.id,
      patientName: r.name,
      rating: r.rating,
      text: r.text,
    });
  }

  console.log(`  ✅ ${d.name} (${d.specialty}, ${d.city})`);
}

console.log("\n✅ Seed complete!");
process.exit(0);
