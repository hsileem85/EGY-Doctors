export function TrustFirst() {
  const testimonials = [
    {
      text: "Found an available cardiologist the same afternoon. The doctor was excellent and took 45 minutes with me.",
      author: "Nadia R.",
      city: "Cairo",
      specialty: "Cardiology",
      stars: 5,
    },
    {
      text: "I'd been putting off seeing a dermatologist for years. Booking took 2 minutes, appointment was next morning.",
      author: "Khaled M.",
      city: "Alexandria",
      specialty: "Dermatology",
      stars: 5,
    },
    {
      text: "My son needed a pediatrician urgently. Got a confirmed slot in 10 minutes. Cannot recommend enough.",
      author: "Sara T.",
      city: "Giza",
      specialty: "Pediatrics",
      stars: 5,
    },
  ];

  const trustSignals = [
    { icon: "✅", label: "ID-Verified Doctors", sub: "Every doctor manually reviewed" },
    { icon: "⚡", label: "Avg. Response < 1h", sub: "Booking confirmed instantly" },
    { icon: "🔒", label: "Secure & Private", sub: "Your records stay yours" },
    { icon: "🌟", label: "4.9 / 5 Rating", sub: "From 150,000+ patients" },
  ];

  const featuredDoctors = [
    {
      name: "Dr. Hana Samir", specialty: "Neurologist", rating: 4.9,
      reviews: 421, badge: "Top Rated", available: "Available Today",
      quote: "\"Takes time to really listen — felt heard for the first time\"",
    },
    {
      name: "Dr. Omar Farouk", specialty: "Cardiologist", rating: 5.0,
      reviews: 318, badge: "Verified", available: "2 slots left today",
      quote: "\"Explained everything clearly, no rush at all\"",
    },
    {
      name: "Dr. Laila Nour", specialty: "Dermatologist", rating: 4.8,
      reviews: 276, badge: "Most Booked", available: "Tomorrow",
      quote: "\"Results after one visit — finally!\"",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <span className="font-bold text-lg">
          <span className="text-[#0F172A]">EG</span>
          <span className="text-[#D4A853]">Y</span>
          <span className="text-[#0F172A] text-sm font-normal ml-1">Doctors</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">🇪🇬 Trusted by 150,000+ Egyptians</span>
          <button className="bg-[#D4A853] text-[#0F172A] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#C49A43] transition-colors">
            Find a Doctor
          </button>
        </div>
      </nav>

      {/* Hero — trust-led */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F3460] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left: headline + CTA */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
                🟢 312 doctors available right now
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                Egypt's most trusted<br />
                <span className="text-[#D4A853]">doctor booking</span> platform
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Join 150,000+ patients who found the right doctor on EGY Doctors — verified profiles, instant booking, no waiting.
              </p>
              {/* Floating search */}
              <div className="flex gap-2 max-w-md">
                <input
                  placeholder="Specialty, doctor name, or symptom…"
                  className="flex-1 bg-white text-[#0F172A] text-sm px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                />
                <button className="bg-[#D4A853] text-[#0F172A] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#C49A43] transition-colors whitespace-nowrap">
                  Search
                </button>
              </div>
            </div>

            {/* Right: testimonial card */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-1 text-[#D4A853] text-sm mb-3">
                  {"★★★★★"}
                </div>
                <p className="text-sm text-[#0F172A] font-medium leading-relaxed mb-4">
                  "{testimonials[0].text}"
                </p>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C49A43] flex items-center justify-center text-white text-xs font-bold">
                    {testimonials[0].author[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">{testimonials[0].author}</div>
                    <div className="text-[10px] text-gray-400">{testimonials[0].city} · {testimonials[0].specialty}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
          {trustSignals.map((ts) => (
            <div key={ts.label} className="flex items-center gap-2.5">
              <span className="text-xl">{ts.icon}</span>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">{ts.label}</div>
                <div className="text-[10px] text-gray-400">{ts.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured doctors with quotes */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-base font-bold text-[#0F172A] mb-1">Doctors patients love</h2>
        <p className="text-xs text-gray-500 mb-5">Real reviews · Verified appointments</p>
        <div className="grid grid-cols-3 gap-4">
          {featuredDoctors.map((doc) => (
            <div key={doc.name} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold">
                  {doc.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-[9px] font-bold bg-[#D4A853]/10 text-[#D4A853] px-2 py-0.5 rounded-full border border-[#D4A853]/30">
                  {doc.badge}
                </span>
              </div>
              <div className="text-sm font-bold text-[#0F172A] mb-0.5">{doc.name}</div>
              <div className="text-xs text-gray-500 mb-2">{doc.specialty}</div>
              <div className="text-[10px] text-gray-400 italic mb-3 leading-relaxed">{doc.quote}</div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[#D4A853] font-semibold">⭐ {doc.rating} <span className="text-gray-400 font-normal">({doc.reviews})</span></span>
                <span className={`font-semibold ${doc.available.includes("Today") ? "text-green-600" : "text-blue-500"}`}>
                  {doc.available}
                </span>
              </div>
              <button className="w-full bg-[#0F172A] text-white text-xs font-semibold py-2 rounded-xl hover:bg-[#1E293B] transition-colors">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* More testimonials */}
      <div className="bg-[#0F172A] px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-base font-bold text-center mb-6">What patients say</h2>
          <div className="grid grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-[#1E293B] rounded-2xl p-4">
                <div className="text-[#D4A853] text-xs mb-2">{"★".repeat(t.stars)}</div>
                <p className="text-gray-300 text-xs leading-relaxed mb-3">"{t.text}"</p>
                <div className="text-[10px] text-gray-500">{t.author} · {t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
