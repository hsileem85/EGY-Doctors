import { useState } from "react";
import "./_group.css";

const NAVY = "#0F172A";
const GOLD = "#D4A853";
const SECONDARY = "#1E293B";
const BORDER = "#334155";

const doctors = [
  { id: "1", name: "Dr. Ahmed Youssef", specialty: "Cardiology", location: "New Cairo", fee: 450,
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9, reviews: 128, experience: "15+ years" },
  { id: "2", name: "Dr. Sara Mahmoud", specialty: "Dermatology", location: "Zamalek", fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.8, reviews: 96, experience: "12+ years" },
  { id: "3", name: "Dr. Kareem Hassan", specialty: "Orthopedics", location: "Maadi", fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg", rating: 4.9, reviews: 154, experience: "18+ years" },
];

const specialties = ["Cardiology","Dermatology","Orthopedics","Neurology","Pediatrics","Ophthalmology"];
const locations = ["New Cairo","Zamalek","Maadi","Heliopolis","Dokki","Nasr City"];

function Star() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" style={{ color: GOLD }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function MinimalistCommandLine() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Minimal Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: NAVY }}>
            <svg className="w-5 h-5" style={{ color: GOLD }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: NAVY }}>
            EGY <span style={{ color: GOLD }}>Doctors</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <button className="hover:text-gray-600 transition-colors" style={{ color: NAVY }}>EN / AR</button>
          <button className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: NAVY }}>Sign In</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        {/* Command Line Hero */}
        <div className="max-w-4xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8 text-center" style={{ color: NAVY }}>
            Find your doctor.
          </h1>
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-16 pr-6 py-5 text-xl bg-white border-2 border-gray-200 rounded-2xl focus:border-[#D4A853] focus:ring-0 outline-none transition-all placeholder:text-gray-400 shadow-sm"
              placeholder="Type specialty, location, or doctor name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="hidden sm:inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-gray-500 py-1">Suggestions:</span>
            {specialties.slice(0, 4).map(s => (
              <button key={s} onClick={() => setQuery(s)} className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white hover:border-[#D4A853] hover:text-[#D4A853] transition-colors"
                style={{ color: NAVY }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 items-start">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block space-y-8 sticky top-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: NAVY }}>Specialty</h3>
              <div className="space-y-3">
                {specialties.map(s => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 focus:ring-[#D4A853]" style={{ accentColor: NAVY }} />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: NAVY }}>Location</h3>
              <div className="space-y-3">
                {locations.slice(0, 5).map(l => (
                  <label key={l} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 focus:ring-[#D4A853]" style={{ accentColor: NAVY }} />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium" style={{ color: NAVY }}>
                {query ? `Results for "${query}"` : "Top Doctors"} <span className="text-gray-400 font-normal ml-2">({doctors.length})</span>
              </h2>
              <select className="text-sm border-none bg-transparent font-medium text-gray-600 focus:ring-0 cursor-pointer">
                <option>Sort by: Recommended</option>
                <option>Highest Rated</option>
                <option>Lowest Fee</option>
              </select>
            </div>

            <div className="space-y-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border border-gray-200" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-semibold truncate" style={{ color: NAVY }}>{doctor.name}</h3>
                        <p className="font-medium" style={{ color: GOLD }}>{doctor.specialty}</p>
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="text-lg font-semibold text-gray-900">{doctor.fee} EGP</div>
                        <div className="text-sm text-gray-500">Consultation</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Star />
                        <span className="font-semibold text-gray-900">{doctor.rating}</span>
                        <span>({doctor.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {doctor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {doctor.experience}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-2xl">{doctor.bio}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button className="px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: NAVY }}>
                        Book Appointment
                      </button>
                      <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-8 text-center">
              <button className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                Load More Results
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
