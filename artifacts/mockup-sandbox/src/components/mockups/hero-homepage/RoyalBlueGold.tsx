import "./_group.css";

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
const stats = [
  { value: "2,500+", label: "Verified Doctors" },
  { value: "150K+", label: "Happy Patients" },
  { value: "50+", label: "Medical Partners" },
  { value: "4.9/5", label: "Average Rating" },
];
const partners = [
  { name: "Saudi German Hospital", abbr: "SGH" },
  { name: "Dar Al Fouad", abbr: "DAF" },
  { name: "Alfa Lab", abbr: "AL" },
  { name: "Alfa Scan", abbr: "AS" },
  { name: "Cleopatra Hospital", abbr: "CH" },
  { name: "Al-Mokhtabar", abbr: "AM" },
  { name: "Nile Scan", abbr: "NS" },
  { name: "Elite Medical", abbr: "EM" },
];
const reviews = [
  { name: "Mohamed Ali", text: "Found an excellent cardiologist in minutes. The booking was seamless, and the doctor was exactly as described.", rating: 5, date: "2 days ago" },
  { name: "Nour Hassan", text: "The verification system gives me peace of mind. I can see real reviews and compare fees before booking.", rating: 5, date: "1 week ago" },
  { name: "Ahmed Khaled", text: "Booked my appointment while waiting for coffee. The app is incredibly fast and easy to use.", rating: 5, date: "3 weeks ago" },
];

function Star() {
  return (
    <svg className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function RoyalBlueGold() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-[#D4A853]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0F172A]">EGY <span className="text-[#D4A853]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600 font-medium">Search</span>
            <span className="hidden md:block text-sm text-gray-600 font-medium">For Doctors</span>
            <span className="hidden md:block text-sm text-gray-600 font-medium">Medical Centers</span>
            <button className="text-sm text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100">🇪🇬 عربي</button>
            <button className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Sign In</button>
            <button className="text-sm px-4 py-2 rounded-lg bg-[#0F172A] text-[#D4A853] hover:bg-[#1E293B] font-medium shadow-md">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Two Column Split */}
      <section className="relative pt-16 min-h-[92vh] bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text + Search */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#D4A853]/30 text-[#D4A853] text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse"></span>
                Egypt's #1 Medical Booking Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold text-white leading-[1.1]">
                Find & Book the <span className="text-[#D4A853]">Best Doctors</span> in Egypt
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Connect with 2,500+ verified medical professionals. Read reviews, compare fees, and book in seconds.
              </p>
              {/* Search Bar */}
              <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155] rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search by name" className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none w-0" />
                  </div>
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer w-0"><option value="">Specialty</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                  </div>
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer w-0"><option value="">Location</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                  </div>
                </div>
                <button className="w-full h-12 bg-[#D4A853] text-[#0F172A] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#C49A48] transition-all shadow-lg active:scale-[0.98]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search Doctors
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.slice(0,5).map(s=> (
                  <button key={s} className="px-3 py-1.5 rounded-full bg-[#1E293B]/60 border border-[#334155] text-gray-400 text-sm hover:bg-[#334155] hover:text-white transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Stats Panel */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-[#D4A853]/5 rounded-full blur-3xl"></div>
              </div>
              <div className="relative grid grid-cols-2 gap-4">
                {stats.map((stat,i)=> (
                  <div key={i} className="bg-[#1E293B]/60 backdrop-blur border border-[#334155] rounded-2xl p-6 text-center hover:border-[#D4A853]/30 transition-all">
                    <div className="text-3xl font-bold text-[#D4A853] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-[#D4A853]/10 border border-[#D4A853]/20 rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {doctors.map(d => (
                      <div key={d.id} className="w-10 h-10 rounded-full border-2 border-[#0F172A] overflow-hidden"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-[#1E293B] flex items-center justify-center text-xs text-[#D4A853] font-bold">+2K</div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="text-[#D4A853] font-bold">2,500+</span> doctors registered across Egypt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Doctors - Horizontal Scroll */}
      <section className="py-16 bg-[#0F172A] border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-sm font-semibold text-[#D4A853] uppercase tracking-wider mb-2 block">Nearby You</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Doctors Near Your Location</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>New Cairo</span>
              <button className="text-[#D4A853] hover:text-[#C49A48] text-xs font-medium ml-2 underline">Change</button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {[
              { ...doctors[0], distance: "1.2 km", nextSlot: "Today 3:00 PM" },
              { ...doctors[1], distance: "2.8 km", nextSlot: "Today 5:30 PM" },
              { ...doctors[2], distance: "4.1 km", nextSlot: "Tomorrow 9:00 AM" },
              { ...doctors[0], distance: "3.5 km", nextSlot: "Today 6:00 PM", name: "Dr. Samir Fathy", specialty: "Neurology", image: "https://randomuser.me/api/portraits/men/28.jpg", fee: 500, rating: 4.7, reviews: 89 },
              { ...doctors[1], distance: "5.2 km", nextSlot: "Tomorrow 10:00 AM", name: "Dr. Laila Omar", specialty: "Pediatrics", image: "https://randomuser.me/api/portraits/women/52.jpg", fee: 300, rating: 4.9, reviews: 210 },
            ].map((doctor, i) => (
              <div key={i} className="flex-shrink-0 w-80 snap-start bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden hover:border-[#D4A853]/30 transition-all group">
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover border-2 border-[#334155]" />
                      <div className="absolute -bottom-1 -right-1 bg-[#D4A853] text-[#0F172A] text-[10px] font-bold px-1.5 py-0.5 rounded-md">{doctor.distance}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{doctor.name}</h3>
                      <p className="text-[#D4A853] text-sm font-medium">{doctor.specialty}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,j)=><Star key={j} />)}</div>
                        <span className="text-xs text-gray-400">{doctor.rating} ({doctor.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{doctor.location}</span>
                    <span className="mx-1 text-[#334155]">|</span>
                    <span className="text-[#D4A853] font-medium">{doctor.fee} EGP</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 flex-1">
                      <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                      <span className="text-xs text-gray-300">{doctor.nextSlot}</span>
                    </div>
                  </div>
                  <button className="w-full h-10 bg-[#D4A853] text-[#0F172A] rounded-xl font-semibold text-sm hover:bg-[#C49A48] transition-colors active:scale-[0.98]">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Scroll Cards */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#D4A853] uppercase tracking-wider mb-3 block">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">How It Works</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {[
              { title:"Search", desc:"Find doctors by specialty, location, or insurance.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, step:"01" },
              { title:"Compare", desc:"Read reviews, compare fees, and view profiles.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>, step:"02" },
              { title:"Book", desc:"Choose a time slot and book instantly.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>, step:"03" },
              { title:"Visit", desc:"Get a reminder and visit your doctor.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>, step:"04" },
            ].map((step,i)=> (
              <div key={i} className="flex-shrink-0 w-72 snap-start p-6 rounded-2xl border border-gray-100 hover:border-[#D4A853]/30 hover:shadow-lg transition-all bg-white group">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F172A]/10 flex items-center justify-center text-[#D4A853] group-hover:bg-[#0F172A]/20 transition-colors">{step.icon}</div>
                  <span className="text-4xl font-bold text-gray-100">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors - Masonry Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-sm font-semibold text-[#D4A853] uppercase tracking-wider mb-3 block">Top Rated</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">Featured Specialists</h2>
            </div>
            <button className="text-[#D4A853] hover:text-[#B89240] font-medium text-sm flex items-center gap-1.5">View All <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {doctors.map((doctor, i)=> (
              <div key={doctor.id} className={`bg-[#F8FAFC] rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${i === 1 ? 'md:translate-y-8' : ''}`}>
                <div className="relative h-28 bg-[#0F172A]/10 overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_top,white,transparent)]"></div>
                  <div className="absolute bottom-3 left-5 z-10">
                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#D4A853] rounded-full px-3 py-1 text-xs font-bold text-[#0F172A]">{doctor.fee} EGP</div>
                </div>
                <div className="pt-5 px-5 pb-5">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">{doctor.name}</h3>
                  <p className="text-[#D4A853] font-medium text-sm flex items-center gap-1.5 mb-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-xs font-bold text-gray-700">{doctor.rating}</span>
                    <span className="text-xs text-gray-400">({doctor.reviews})</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full h-10 bg-[#0F172A] text-[#D4A853] rounded-xl font-medium text-sm hover:bg-[#1E293B] transition-colors">Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Marquee */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#D4A853] uppercase tracking-wider mb-3 block">Trusted Partners</span>
            <h2 className="text-3xl font-bold text-white">Egypt's Top Medical Partners</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p,i)=> (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#334155] bg-[#1E293B]/50 hover:border-[#D4A853]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#D4A853]/10 flex items-center justify-center text-[#D4A853] font-bold text-sm">{p.abbr}</div>
                <span className="text-sm text-gray-300 font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Side by Side */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#D4A853] uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-3xl font-bold text-[#0F172A]">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-[#D4A853] font-bold text-sm">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Find Your Doctor?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">Join 150,000+ patients who have already found their perfect healthcare match.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#D4A853] text-[#0F172A] rounded-xl font-semibold hover:bg-[#C49A48] transition-colors shadow-xl">Search Doctors Now</button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-lg font-bold">EGY Doctors</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Egypt's leading platform for connecting patients with top-rated medical professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#D4A853] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Doctors</h4>
              <ul className="space-y-3">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#D4A853] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>+20 1 234 5678</li>
                <li>hello@egydoctors.com</li>
                <li>Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1E293B] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">&copy; 2025 EGY Doctors. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <span className="hover:text-[#D4A853] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#D4A853] cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-[#D4A853] cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
