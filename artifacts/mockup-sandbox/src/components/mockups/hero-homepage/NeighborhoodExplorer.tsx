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

const neighborhoods = [
  { name: "New Cairo", doctors: 124, icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { name: "Zamalek", doctors: 45, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { name: "Maadi", doctors: 82, icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" },
  { name: "Heliopolis", doctors: 98, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { name: "Dokki", doctors: 56, icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
  { name: "Nasr City", doctors: 112, icon: "M3 21v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M10 21V9M14 21V9" },
];

function Star() {
  return (
    <svg className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function NeighborhoodExplorer() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center border border-slate-700">
              <svg className="w-5 h-5 text-[#D4A853]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">EGY <span className="text-[#D4A853]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">For Doctors</button>
            <div className="w-px h-5 bg-slate-800 hidden sm:block"></div>
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
            <button className="text-sm font-medium bg-[#D4A853] text-[#0F172A] px-4 py-2 rounded-lg hover:bg-[#C49A48] transition-colors">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero: Neighborhood Grid */}
      <section className="pt-24 pb-16 bg-[#0F172A] relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#D4A853] opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500 opacity-[0.03] rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Where do you need a <span className="text-[#D4A853]">Doctor?</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start by choosing your area. We'll show you the highest rated specialists available right now in your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {neighborhoods.map((n) => (
              <button 
                key={n.name}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1E293B] border border-slate-700 hover:border-[#D4A853] hover:bg-slate-800 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-[#0F172A] border border-slate-700 group-hover:border-[#D4A853] flex items-center justify-center text-[#D4A853] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={n.icon}/>
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-1">{n.name}</h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-full">{n.doctors} available</span>
              </button>
            ))}
          </div>

          {/* Compact Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Search doctor name or specialty..." className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder:text-slate-500" />
              </div>
              <button className="bg-[#D4A853] hover:bg-[#C49A48] text-[#0F172A] font-bold text-sm px-8 py-3 rounded-xl transition-colors whitespace-nowrap">
                Search All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Doctors Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Specialists Near You</h2>
              <p className="text-slate-500">Based on patient reviews and proximity</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#D4A853] transition-colors">
              View All Map <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50 group-hover:ring-[#D4A853] transition-all" />
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                        <p className="text-[#0F172A] font-medium text-sm mb-1">{doctor.specialty}</p>
                        <div className="flex items-center gap-1">
                          <Star />
                          <span className="text-sm font-bold text-slate-700">{doctor.rating}</span>
                          <span className="text-xs text-slate-500">({doctor.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      </div>
                      <span>Next available: Tomorrow</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      </div>
                      <span className="font-semibold text-slate-900">{doctor.fee} EGP</span>
                    </div>
                  </div>

                  <button className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-semibold text-sm transition-colors shadow-md">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
