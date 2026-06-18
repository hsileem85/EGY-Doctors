export function SymptomLed() {
  const specialties = [
    { icon: "🧠", label: "Neurology", labelAr: "أعصاب", count: 142 },
    { icon: "❤️", label: "Cardiology", labelAr: "قلب", count: 98 },
    { icon: "🦷", label: "Dentistry", labelAr: "أسنان", count: 310 },
    { icon: "👁️", label: "Ophthalmology", labelAr: "عيون", count: 87 },
    { icon: "🦴", label: "Orthopedics", labelAr: "عظام", count: 201 },
    { icon: "🌿", label: "Dermatology", labelAr: "جلدية", count: 156 },
    { icon: "👶", label: "Pediatrics", labelAr: "أطفال", count: 188 },
    { icon: "🧬", label: "Oncology", labelAr: "أورام", count: 64 },
    { icon: "🩺", label: "General", labelAr: "عام", count: 412 },
    { icon: "🫁", label: "Pulmonology", labelAr: "صدر", count: 73 },
    { icon: "🧪", label: "Endocrinology", labelAr: "غدد", count: 55 },
    { icon: "💊", label: "Psychiatry", labelAr: "نفسية", count: 91 },
  ];

  const symptoms = [
    "Chest pain", "Persistent cough", "Joint pain", "Skin rash",
    "Headache", "Blurred vision", "Back pain", "Fatigue",
  ];

  const topDoctors = [
    { name: "Dr. Sarah Khalil", specialty: "Cardiologist", rating: 4.9, reviews: 312, wait: "Today" },
    { name: "Dr. Ahmed Mostafa", specialty: "Neurologist", rating: 4.8, reviews: 204, wait: "Tomorrow" },
    { name: "Dr. Mona Hassan", specialty: "Dermatologist", rating: 5.0, reviews: 188, wait: "Today" },
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
          <button className="text-gray-300 text-sm hover:text-white">Sign In</button>
          <button className="bg-[#D4A853] text-[#0F172A] text-sm font-semibold px-3 py-1.5 rounded-lg">Join Free</button>
        </div>
      </nav>

      {/* Hero — question-led */}
      <div className="bg-[#0F172A] px-6 py-10 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853] text-xs font-medium px-3 py-1 rounded-full mb-4">
          🇪🇬 Egypt's largest verified medical network
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          What's bringing you in?
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Pick a specialty or describe your symptoms — we'll find the right doctor.
        </p>

        {/* Symptom chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg mx-auto">
          {symptoms.map((s) => (
            <button
              key={s}
              className="bg-[#1E293B] border border-[#334155] text-gray-300 text-xs px-3 py-1.5 rounded-full hover:border-[#D4A853] hover:text-[#D4A853] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Or search */}
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            placeholder="Or type a doctor's name…"
            className="flex-1 bg-[#1E293B] border border-[#334155] text-white text-sm px-4 py-2.5 rounded-xl placeholder-gray-500 focus:outline-none focus:border-[#D4A853]"
          />
          <button className="bg-[#D4A853] text-[#0F172A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#C49A43] transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-[#D4A853] px-6 py-2.5 flex items-center justify-center gap-8 text-[#0F172A] text-xs font-semibold">
        {["2,500+ Doctors", "27 Governorates", "4.9★ Avg Rating", "Same-day booking"].map(s => (
          <span key={s} className="whitespace-nowrap">{s}</span>
        ))}
      </div>

      {/* Specialty grid */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0F172A]">Browse by Specialty</h2>
          <button className="text-xs text-[#D4A853] font-semibold hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {specialties.map((sp) => (
            <button
              key={sp.label}
              className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-[#D4A853] hover:shadow-md transition-all group"
            >
              <span className="text-2xl">{sp.icon}</span>
              <span className="text-[11px] font-semibold text-[#0F172A] group-hover:text-[#D4A853] transition-colors">{sp.label}</span>
              <span className="text-[9px] text-gray-400">{sp.count} doctors</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top doctors strip */}
      <div className="px-6 pb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0F172A]">Highest Rated This Week</h2>
          <button className="text-xs text-[#D4A853] font-semibold hover:underline">See all →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {topDoctors.map((doc) => (
            <div key={doc.name} className="bg-white border border-gray-100 rounded-2xl p-4 min-w-[200px] flex-shrink-0 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold mb-3">
                {doc.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="text-sm font-bold text-[#0F172A] mb-0.5">{doc.name}</div>
              <div className="text-xs text-gray-500 mb-2">{doc.specialty}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#D4A853] font-semibold">⭐ {doc.rating} ({doc.reviews})</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.wait === "Today" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>
                  {doc.wait}
                </span>
              </div>
              <button className="mt-3 w-full bg-[#0F172A] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#1E293B] transition-colors">
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
