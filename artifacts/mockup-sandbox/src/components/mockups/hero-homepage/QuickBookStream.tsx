import "./_group.css";
import React, { useRef } from "react";

const doctors = [
  { id: "1", name: "Dr. Ahmed Youssef", specialty: "Cardiology", location: "New Cairo", fee: 450,
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9, reviews: 128, experience: "15+ years",
    nextSlot: "Today 3:00 PM", distance: "1.2 km" },
  { id: "2", name: "Dr. Sara Mahmoud", specialty: "Dermatology", location: "Zamalek", fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.8, reviews: 96, experience: "12+ years",
    nextSlot: "Today 4:30 PM", distance: "2.5 km" },
  { id: "3", name: "Dr. Kareem Hassan", specialty: "Orthopedics", location: "Maadi", fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg", rating: 4.9, reviews: 154, experience: "18+ years",
    nextSlot: "Today 5:15 PM", distance: "3.0 km" },
  { id: "4", name: "Dr. Laila Omar", specialty: "Pediatrics", location: "Heliopolis", fee: 300,
    bio: "Passionate pediatrician with over a decade of experience in child healthcare.",
    image: "https://randomuser.me/api/portraits/women/22.jpg", rating: 4.7, reviews: 112, experience: "10+ years",
    nextSlot: "Today 6:00 PM", distance: "4.1 km" },
  { id: "5", name: "Dr. Tarek Mounir", specialty: "Neurology", location: "Dokki", fee: 500,
    bio: "Expert in treating complex neurological disorders with 20 years of clinical practice.",
    image: "https://randomuser.me/api/portraits/men/50.jpg", rating: 4.9, reviews: 200, experience: "20+ years",
    nextSlot: "Tomorrow 10:00 AM", distance: "5.5 km" },
];

const specialties = ["Cardiology","Dermatology","Orthopedics","Neurology","Pediatrics","Ophthalmology", "Dentistry", "Psychiatry"];
const locations = ["New Cairo","Zamalek","Maadi","Heliopolis","Dokki","Nasr City"];
const stats = [
  { value: "2,500+", label: "Verified Doctors" },
  { value: "150K+", label: "Happy Patients" },
  { value: "50+", label: "Medical Partners" },
  { value: "4.9/5", label: "Average Rating" },
];

function StarIcon() {
  return (
    <svg className="w-3 h-3 fill-[#D4A853] text-[#D4A853]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function QuickBookStream() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans overflow-x-hidden pb-20">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#1E293B] sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
             <svg className="w-4 h-4 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
          </div>
          <span className="text-lg font-bold text-white">EGY <span className="text-[#D4A853]">Doctors</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1E293B] text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </header>

      <main className="pt-6">
        <div className="px-5 mb-5">
          <h1 className="text-2xl font-bold text-white mb-1">Doctors near you</h1>
          <p className="text-sm text-gray-400">Available for immediate booking</p>
        </div>

        {/* Horizontal Card Stream */}
        <div 
          className="flex gap-4 overflow-x-auto px-5 pb-8 pt-2 snap-x snap-mandatory scrollbar-hide scroll-smooth"
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {doctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center bg-[#1E293B] rounded-2xl p-4 border border-[#334155] shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4A853]">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-[#1E293B]"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{doctor.name}</h3>
                    <p className="text-[#D4A853] text-sm font-medium">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon />
                      <span className="text-xs font-bold text-gray-200">{doctor.rating}</span>
                      <span className="text-xs text-gray-400">({doctor.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#0F172A] py-2 px-3 rounded-lg">
                    <ClockIcon />
                    <span className="font-semibold text-green-400">{doctor.nextSlot}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 px-1">
                    <span className="flex items-center gap-1"><MapPinIcon /> {doctor.distance}</span>
                    <span className="font-bold text-white">{doctor.fee} EGP</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-[#D4A853] hover:bg-[#C49A48] text-[#0F172A] rounded-xl font-bold transition-colors active:scale-95 shadow-lg">
                Book Now
              </button>
            </div>
          ))}
        </div>

        {/* Compact Search & Filters */}
        <div className="px-5 mt-2">
          <div className="bg-[#1E293B] rounded-2xl p-4 border border-[#334155]">
            <h3 className="text-white font-bold mb-4">Find specific doctors</h3>
            
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="Doctor, specialty, or clinic" 
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#D4A853]"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPinIcon />
                  </div>
                  <select className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4A853] appearance-none cursor-pointer">
                    <option value="">Location</option>
                    {locations.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <button className="bg-[#D4A853] text-[#0F172A] px-5 rounded-xl font-bold text-sm hover:bg-[#C49A48] transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specialties Chips */}
        <div className="px-5 mt-8">
          <h3 className="text-white font-bold mb-3">Browse by Specialty</h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map(specialty => (
              <button key={specialty} className="px-4 py-2 bg-transparent border border-[#334155] text-gray-300 rounded-full text-sm font-medium hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
