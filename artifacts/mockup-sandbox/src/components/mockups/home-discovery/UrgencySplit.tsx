import { useState } from "react";

type Track = "today" | "browse" | null;

export function UrgencySplit() {
  const [track, setTrack] = useState<Track>(null);

  const todaySlots = [
    { name: "Dr. Rania Adel", specialty: "Cardiologist", slots: ["10:00", "11:30", "14:00"], rating: 4.9 },
    { name: "Dr. Youssef Nabil", specialty: "General Practice", slots: ["09:30", "12:00", "15:30"], rating: 4.7 },
    { name: "Dr. Amira Sayed", specialty: "Pediatrician", slots: ["10:30", "13:00"], rating: 5.0 },
    { name: "Dr. Tarek Aziz", specialty: "Orthopedics", slots: ["11:00", "16:00"], rating: 4.8 },
  ];

  const specialties = [
    { icon: "🧠", label: "Neurology", count: 142 },
    { icon: "❤️", label: "Cardiology", count: 98 },
    { icon: "🦷", label: "Dentistry", count: 310 },
    { icon: "👁️", label: "Eye Care", count: 87 },
    { icon: "🦴", label: "Orthopedics", count: 201 },
    { icon: "🌿", label: "Dermatology", count: 156 },
    { icon: "👶", label: "Pediatrics", count: 188 },
    { icon: "🩺", label: "General", count: 412 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Navbar */}
      <nav className="bg-[#0F172A] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <span className="text-white font-bold text-lg">
          <span className="text-white">EG</span>
          <span className="text-[#D4A853]">Y</span>
          <span className="text-white text-sm font-normal ml-1">Doctors</span>
        </span>
        <div className="flex items-center gap-3">
          <button className="text-gray-300 text-sm">Sign In</button>
          <button className="bg-[#D4A853] text-[#0F172A] text-sm font-semibold px-3 py-1.5 rounded-lg">Join Free</button>
        </div>
      </nav>

      {/* Hero — split intent */}
      <div className="bg-[#0F172A] px-6 pt-10 pb-0">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            How can we help you today?
          </h1>
          <p className="text-gray-400 text-sm">Egypt's verified medical directory — find the right doctor, at the right time.</p>
        </div>

        {/* Two-track selector */}
        {track === null && (
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4 pb-10">
            {/* Today track */}
            <button
              onClick={() => setTrack("today")}
              className="group bg-gradient-to-br from-red-900/60 to-red-800/40 border-2 border-red-500/40 hover:border-red-400 rounded-2xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="text-2xl mb-3">🚨</div>
              <div className="text-white font-bold text-base mb-1">I need to see a doctor today</div>
              <div className="text-red-300 text-xs mb-4">View only doctors with open slots today</div>
              <div className="flex items-center gap-1.5 text-red-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                312 available now
              </div>
            </button>

            {/* Browse track */}
            <button
              onClick={() => setTrack("browse")}
              className="group bg-gradient-to-br from-[#1E3A5F]/80 to-[#1E293B]/60 border-2 border-[#334155] hover:border-[#D4A853] rounded-2xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="text-2xl mb-3">🔍</div>
              <div className="text-white font-bold text-base mb-1">I'm looking for the right doctor</div>
              <div className="text-gray-400 text-xs mb-4">Browse by specialty, rating, and location</div>
              <div className="flex items-center gap-1.5 text-[#D4A853] text-xs font-semibold">
                <span>2,500+ verified doctors</span>
              </div>
            </button>
          </div>
        )}

        {/* Today track content */}
        {track === "today" && (
          <div className="max-w-3xl mx-auto pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span className="text-white font-bold text-base">Available Today</span>
                </div>
                <span className="text-gray-400 text-xs ml-4">Click a time to book instantly</span>
              </div>
              <button onClick={() => setTrack(null)} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                ← Change
              </button>
            </div>
          </div>
        )}

        {/* Browse track search */}
        {track === "browse" && (
          <div className="max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-base">Find Your Doctor</span>
              <button onClick={() => setTrack(null)} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                ← Change
              </button>
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Specialty, doctor name, or condition…"
                className="flex-1 bg-[#1E293B] border border-[#334155] text-white text-sm px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#D4A853]"
              />
              <select className="bg-[#1E293B] border border-[#334155] text-gray-300 text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-[#D4A853]">
                <option>All Cities</option>
                <option>Cairo</option>
                <option>Alexandria</option>
                <option>Giza</option>
              </select>
              <button className="bg-[#D4A853] text-[#0F172A] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#C49A43] transition-colors">
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today track: availability grid */}
      {track === "today" && (
        <div className="bg-[#0A0F1E] px-6 pb-8 pt-2">
          <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
            {todaySlots.map((doc) => (
              <div key={doc.name} className="bg-[#1E293B] border border-red-900/30 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white text-sm font-bold">{doc.name}</div>
                    <div className="text-gray-400 text-xs">{doc.specialty}</div>
                  </div>
                  <span className="text-[#D4A853] text-xs font-semibold">⭐ {doc.rating}</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-2 font-medium uppercase tracking-wide">Today's slots</div>
                <div className="flex flex-wrap gap-1.5">
                  {doc.slots.map((slot) => (
                    <button
                      key={slot}
                      className="bg-red-900/30 border border-red-500/40 text-red-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto mt-4 text-center">
            <button className="text-red-400 text-xs font-semibold hover:underline">Load more available doctors →</button>
          </div>
        </div>
      )}

      {/* Browse track: specialty grid */}
      {track === "browse" && (
        <div className="px-6 py-8 max-w-3xl mx-auto">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Browse by Specialty</h2>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {specialties.map((sp) => (
              <button
                key={sp.label}
                className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-[#D4A853] hover:shadow-md transition-all"
              >
                <span className="text-2xl">{sp.icon}</span>
                <span className="text-[11px] font-semibold text-[#0F172A]">{sp.label}</span>
                <span className="text-[9px] text-gray-400">{sp.count} doctors</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Default: stats strip when no track selected */}
      {track === null && (
        <div className="bg-[#D4A853] px-6 py-3 flex items-center justify-center gap-10 text-[#0F172A] text-xs font-bold">
          {["2,500+ Doctors", "27 Governorates", "4.9★ Avg Rating", "Free to use"].map(s => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}

      {/* Default: preview of both tracks */}
      {track === null && (
        <div className="px-6 py-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-sm font-bold text-[#0F172A]">Available Today</span>
              </div>
              <div className="space-y-2">
                {todaySlots.slice(0, 2).map(doc => (
                  <div key={doc.name} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">{doc.name}</div>
                      <div className="text-[10px] text-gray-400">{doc.specialty}</div>
                    </div>
                    <div className="flex gap-1">
                      {doc.slots.slice(0, 2).map(s => (
                        <span key={s} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">🔍</span>
                <span className="text-sm font-bold text-[#0F172A]">Browse Specialties</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {specialties.slice(0, 8).map(sp => (
                  <div key={sp.label} className="bg-white border border-gray-100 rounded-xl p-2 flex flex-col items-center gap-1 text-center">
                    <span className="text-lg">{sp.icon}</span>
                    <span className="text-[9px] font-semibold text-[#0F172A]">{sp.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
