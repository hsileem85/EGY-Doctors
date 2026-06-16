import "./_group.css";
import React, { useState } from "react";
import { Search, MapPin, HeartPulse, Star, Navigation, CalendarDays, User, Building, Map } from "lucide-react";

const doctors = [
  { id: "1", name: "Dr. Ahmed Youssef", specialty: "Cardiology", location: "New Cairo", fee: 450, distance: "1.2 km",
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9, reviews: 128, experience: "15+ years", nextAvailable: "Today, 4:00 PM" },
  { id: "2", name: "Dr. Sara Mahmoud", specialty: "Dermatology", location: "Zamalek", fee: 350, distance: "2.5 km",
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.8, reviews: 96, experience: "12+ years", nextAvailable: "Tomorrow, 10:30 AM" },
  { id: "3", name: "Dr. Kareem Hassan", specialty: "Orthopedics", location: "Maadi", fee: 400, distance: "3.8 km",
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg", rating: 4.9, reviews: 154, experience: "18+ years", nextAvailable: "Today, 7:15 PM" },
  { id: "4", name: "Dr. Omar Tarek", specialty: "Neurology", location: "Heliopolis", fee: 500, distance: "5.1 km",
    bio: "Specialist in treating headaches, migraines, and peripheral nerve disorders.",
    image: "https://randomuser.me/api/portraits/men/78.jpg", rating: 4.7, reviews: 82, experience: "10+ years", nextAvailable: "Wed, 9:00 AM" },
];

const specialties = ["Cardiology","Dermatology","Orthopedics","Neurology","Pediatrics","Ophthalmology"];
const stats = [
  { value: "2,500+", label: "Verified Doctors" },
  { value: "150K+", label: "Happy Patients" },
  { value: "50+", label: "Medical Partners" },
  { value: "4.9/5", label: "Average Rating" },
];

export function NearbyDoctorList() {
  const [isDetecting, setIsDetecting] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans pb-20">
      {/* Navbar Minimal */}
      <nav className="bg-[#0F172A] border-b border-[#1E293B]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-[#0F172A]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EGY <span className="text-[#D4A853]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white text-sm font-medium transition-colors">🇪🇬 عربي</button>
            <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-gray-300 hover:bg-[#334155] cursor-pointer transition-colors">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </nav>

      {/* Header: Location & Search */}
      <header className="bg-[#0F172A] pt-8 pb-10 px-4 shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          
          {/* Location indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 bg-[#1E293B]/80 border border-[#334155] px-5 py-2.5 rounded-full text-white backdrop-blur-sm">
              <Navigation className="w-5 h-5 text-[#D4A853] fill-[#D4A853]/20" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium leading-none mb-0.5">Current Location</span>
                <span className="text-sm font-bold tracking-wide">Maadi, Cairo Governorate</span>
              </div>
              <button 
                onClick={() => setIsDetecting(true)} 
                className="ml-3 pl-3 border-l border-[#334155] text-xs text-[#D4A853] hover:text-[#C49A48] font-semibold tracking-wide uppercase transition-colors"
              >
                {isDetecting ? "Detecting..." : "Change"}
              </button>
            </div>
          </div>

          {/* Single Pill Search */}
          <div className="bg-white rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center flex-1 h-12 sm:h-14 pl-4">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search doctors, specialties, or clinics..." 
                className="flex-1 bg-transparent border-none outline-none px-3 text-[#0F172A] font-medium placeholder:font-normal placeholder:text-gray-400 w-full" 
              />
            </div>
            
            <div className="hidden sm:block h-8 w-[1px] bg-gray-200 mx-1"></div>
            
            <div className="flex items-center flex-1 sm:flex-none sm:w-48 h-12 sm:h-14 px-4 border-t sm:border-t-0 border-gray-100">
              <HeartPulse className="w-4 h-4 text-gray-400 shrink-0" />
              <select className="flex-1 bg-transparent border-none outline-none text-[#0F172A] font-medium cursor-pointer pl-2 text-sm w-full truncate">
                <option value="">Any Specialty</option>
                {specialties.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <button className="bg-[#D4A853] text-[#0F172A] font-bold rounded-xl sm:rounded-full px-8 h-12 sm:h-14 mt-2 sm:mt-0 sm:ml-2 hover:bg-[#C49A48] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base">
              Find Doctors
            </button>
          </div>
        </div>
      </header>

      {/* Stats Strip */}
      <div className="bg-[#1E293B] border-b border-[#334155] py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center text-xs sm:text-sm text-gray-300 gap-x-8 gap-y-4">
            {stats.map(s => (
                <div key={s.label} className="flex items-center gap-2 tracking-wide">
                    <span className="text-[#D4A853] font-bold">{s.value}</span>
                    <span className="font-medium text-gray-400 uppercase text-[11px] sm:text-xs tracking-wider">{s.label}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Main List */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
             Doctors Near You
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <span className="text-[#0F172A]">Sort by:</span>
             <select className="bg-transparent border-none outline-none cursor-pointer font-bold text-[#0F172A]">
               <option>Nearest First</option>
               <option>Highest Rated</option>
               <option>Lowest Fee</option>
             </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={doc.image} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-gray-100" alt={doc.name} />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                  <div className="bg-[#D4A853]/10 text-[#0F172A] font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#D4A853] text-[#D4A853]" />
                    {doc.rating}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] leading-tight mb-1 hover:text-[#D4A853] cursor-pointer transition-colors">{doc.name}</h3>
                    <p className="text-[#0F172A]/70 font-medium text-sm flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#D4A853]" /> {doc.specialty}
                    </p>
                  </div>
                  
                  {/* Distance Highlight */}
                  <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1.5 self-start shrink-0">
                    <Navigation className="w-4 h-4 text-[#D4A853] fill-[#D4A853]/20" />
                    <span className="font-bold text-[#0F172A] text-sm">{doc.distance}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">away</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-gray-400">Fee:</span>
                        <span className="text-[#0F172A] font-bold">{doc.fee} EGP</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{doc.location}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <span className="text-green-600 font-semibold">{doc.nextAvailable}</span>
                    </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full sm:w-[140px] flex flex-col gap-2 shrink-0 sm:border-l border-gray-100 sm:pl-6 sm:py-2 mt-2 sm:mt-0">
                  <button className="w-full bg-[#0F172A] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1E293B] shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                    Book
                  </button>
                  <button className="w-full bg-white text-[#0F172A] rounded-xl py-2.5 font-semibold text-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    Profile
                  </button>
              </div>

            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
            <button className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-white transition-colors bg-transparent">
                Load More Doctors
            </button>
        </div>
      </main>
    </div>
  );
}
