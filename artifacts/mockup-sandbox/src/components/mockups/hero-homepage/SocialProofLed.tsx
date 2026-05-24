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

export function SocialProofLed() {
  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
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

      {/* Hero - Compact, punchy */}
      <section className="bg-[hsl(158,65%,38%)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight font-['Plus_Jakarta_Sans']">
                Find & Book the Best Doctors in Egypt for Free
              </h1>
              <p className="text-white/80 text-base max-w-lg">
                Connect with top-rated medical professionals. Read verified patient reviews, compare fees, and book your appointment instantly.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-white rounded-xl shadow-lg p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 h-11 px-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-gray-700 outline-none">
                      <option>Choose specialty</option>
                      {specialties.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 h-11 px-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-gray-700 outline-none">
                      <option>Choose city or area</option>
                      {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <button className="h-11 px-6 bg-[hsl(158,65%,38%)] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[32, 44, 65, 68, 82].map((id, i) => (
                  <img key={i} src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${id}.jpg`} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <span className="text-sm text-gray-600">500+ doctors on the platform</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              </div>
              <span className="text-sm text-gray-600">4.8 average rating</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[hsl(158,65%,38%)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
              <span className="text-sm text-gray-600">Verified & licensed professionals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Specialists - Hero Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 font-['Plus_Jakarta_Sans']">Featured Specialists</h2>
              <p className="text-gray-500 text-sm">Top-rated doctors available for booking today.</p>
            </div>
            <button className="text-[hsl(158,65%,38%)] hover:text-[hsl(158,65%,30%)] font-medium text-sm hidden md:flex items-center gap-1">
              View All Doctors
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{doctor.name}</h3>
                      <p className="text-[hsl(158,65%,38%)] font-medium text-sm flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                        {doctor.specialty}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                        </div>
                        <span className="text-xs text-gray-500">(120+)</span>
                      </div>
                    </div>
                    <span className="bg-[hsl(158,65%,38%)]/5 text-[hsl(158,65%,38%)] text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">{doctor.fee} EGP</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{doctor.location}</span>
                    <span className="mx-1 text-gray-300">&bull;</span>
                    <span className="truncate">{doctor.clinicAddress}</span>
                  </div>
                  <div className="flex gap-2">
                    {doctor.slots.slice(0, 2).map((slot, i) => (
                      <button key={i} className="flex-1 h-8 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:border-[hsl(158,65%,38%)] hover:text-[hsl(158,65%,38%)] transition-all">
                        {slot}
                      </button>
                    ))}
                    <button className="flex-shrink-0 h-8 px-3 bg-[hsl(158,65%,38%)] text-white rounded-md text-xs font-medium hover:brightness-110 transition-all">Book</button>
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
