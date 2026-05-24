import "./_group.css";

const doctors = [
  {
    id: "1", name: "Dr. Ahmed Youssef", specialty: "Cardiology",
    location: "New Cairo", fee: 450,
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    clinicAddress: "15 South Teseen St, 4th Floor, New Cairo",
    slots: ["Today 4:00 PM", "Tomorrow 9:00 AM", "Thu 5:30 PM", "Fri 11:00 AM"]
  },
  {
    id: "2", name: "Dr. Sara Mahmoud", specialty: "Dermatology",
    location: "Zamalek", fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    clinicAddress: "8A 26th of July Corridor, Zamalek",
    slots: ["Today 2:00 PM", "Tomorrow 1:00 PM", "Wed 6:00 PM", "Sat 10:00 AM"]
  },
  {
    id: "3", name: "Dr. Kareem Hassan", specialty: "Orthopedics",
    location: "Maadi", fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    clinicAddress: "45 Road 9, Maadi",
    slots: ["Today 5:00 PM", "Tomorrow 4:30 PM", "Thu 2:00 PM", "Mon 12:00 PM"]
  }
];

const specialties = ["Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];
const locations = ["New Cairo", "Zamalek", "Maadi", "Heliopolis", "Dokki"];

export function EditorialSplit() {
  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-[hsl(158,65%,38%)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            <span className="text-xl font-bold text-gray-900 tracking-tight font-['Plus_Jakarta_Sans']">EGY Doctors</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">Search Doctors</span>
            <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
              <span className="text-base leading-none">🇪🇬</span><span>عربي</span>
            </button>
            <span className="text-sm font-medium text-gray-600 hidden sm:block">Register</span>
            <button className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg">Doctor Login</button>
          </div>
        </div>
      </nav>

      {/* Hero - Editorial Split-Screen */}
      <section className="relative bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[720px]">
            {/* Left: Text + Search */}
            <div className="lg:w-[55%] flex flex-col justify-center py-16 lg:py-0 lg:pr-16">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(158,65%,38%)] tracking-wider uppercase mb-6">
                <span className="w-8 h-[1px] bg-current"></span>
                Egypt's Trusted Healthcare Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] font-['Plus_Jakarta_Sans']">
                Find & Book the Best<br />Doctors in Egypt<br />for Free
              </h1>
              <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed">
                Connect with top-rated medical professionals. Read verified patient reviews, compare fees, and book your appointment instantly.
              </p>

              {/* Search bar */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">Specialty</label>
                  <div className="flex items-center gap-2 h-12 px-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-gray-700 outline-none">
                      <option>Choose specialty</option>
                      {specialties.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">Location</label>
                  <div className="flex items-center gap-2 h-12 px-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-gray-700 outline-none">
                      <option>Choose city or area</option>
                      {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <button className="w-full md:w-auto h-12 px-8 bg-[hsl(158,65%,38%)] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 mt-10">
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-500">Verified Doctors</div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12K+</div>
                  <div className="text-sm text-gray-500">Bookings Monthly</div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right: Professional imagery */}
            <div className="lg:w-[45%] relative flex items-center justify-center py-8 lg:py-0">
              <div className="relative w-full h-[400px] lg:h-[560px]">
                <div className="absolute top-8 right-0 w-[85%] h-[85%] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                    alt="Doctor with patient"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(158,65%,38%)]/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
                    alt="Medical consultation"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating trust badge */}
                <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(158,65%,38%)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[hsl(158,65%,38%)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Verified</div>
                    <div className="text-xs text-gray-500">Licensed professionals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Specialists */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans']">Featured Specialists</h2>
              <p className="text-gray-600">Top-rated doctors available for booking today.</p>
            </div>
            <button className="text-[hsl(158,65%,38%)] hover:text-[hsl(158,65%,30%)] font-medium text-sm hidden md:flex items-center gap-1">
              View All Doctors
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row gap-6 p-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm mb-4" />
                  <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                    {[1,2,3,4,5].map(i => <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">120+ Reviews</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                      <p className="text-[hsl(158,65%,38%)] font-medium flex items-center gap-1.5 mb-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                        {doctor.specialty}
                      </p>
                    </div>
                    <span className="bg-[hsl(158,65%,38%)]/5 text-[hsl(158,65%,38%)] text-xs px-2.5 py-1 rounded-full font-medium border-0">{doctor.fee} EGP</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-6">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{doctor.location}</span>
                    <span className="mx-2 text-gray-300">&bull;</span>
                    <span className="truncate">{doctor.clinicAddress}</span>
                  </div>
                  <div className="mt-auto pt-4 flex justify-end">
                    <button className="bg-[hsl(158,65%,38%)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all">Book Appointment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-start">
            <p className="text-sm font-medium text-gray-900">EGY Doctors</p>
            <p className="text-xs text-gray-500 mt-1">&copy; 2025 EGY Doctors. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[hsl(158,65%,38%)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[hsl(158,65%,38%)] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[hsl(158,65%,38%)] transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
