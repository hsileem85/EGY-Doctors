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
  "Saudi German Hospital", "Dar Al Fouad", "Alfa Lab", "Alfa Scan", "Cleopatra Hospital", "Al-Mokhtabar", "Nile Scan", "Elite Medical"
];
const reviews = [
  { name: "Mohamed Ali", text: "Found an excellent cardiologist in minutes. The booking was seamless, and the doctor was exactly as described.", rating: 5, date: "2 days ago" },
  { name: "Nour Hassan", text: "The verification system gives me peace of mind. I can see real reviews and compare fees before booking.", rating: 5, date: "1 week ago" },
  { name: "Ahmed Khaled", text: "Booked my appointment while waiting for coffee. The app is incredibly fast and easy to use.", rating: 5, date: "3 weeks ago" },
];

function Star() {
  return (
    <svg className="w-4 h-4 fill-[#E07A5F] text-[#E07A5F]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function WarmCoralSand() {
  return (
    <div className="min-h-screen bg-[#FEFCF8] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FEFCF8]/90 backdrop-blur-xl border-b border-[#F2E8DC]/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            <span className="text-xl font-bold text-[#3D405B]">EGY <span className="text-[#E07A5F]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-[#3D405B] font-medium">Search</span>
            <span className="hidden md:block text-sm text-[#3D405B] font-medium">For Doctors</span>
            <span className="hidden md:block text-sm text-[#3D405B] font-medium">Medical Centers</span>
            <button className="text-sm text-[#3D405B] px-2 py-1 rounded-lg hover:bg-[#F2E8DC]">🇪🇬 عربي</button>
            <button className="text-sm px-4 py-2 rounded-lg border border-[#F2E8DC] text-[#3D405B] hover:bg-[#F2E8DC]">Sign In</button>
            <button className="text-sm px-4 py-2 rounded-lg bg-[#E07A5F] text-white hover:bg-[#D16A4F] font-medium shadow-md shadow-[#E07A5F]/20">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Full bleed with gradient overlay */}
      <section className="relative pt-16 min-h-screen bg-[#F2E8DC] overflow-hidden">
        <div className="absolute inset-0 bg-[#E07A5F]/20"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E07A5F]/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F2CC8F]/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col items-center justify-center text-center py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 border border-white/40 text-[#3D405B] text-sm font-medium mb-8 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse"></span>
            Egypt's #1 Medical Booking Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#3D405B] leading-[1.05] max-w-4xl mb-6">
            Your Health,<br />Our <span className="text-[#E07A5F]">Priority</span>
          </h1>
          <p className="text-xl text-[#3D405B]/70 max-w-xl mb-12 leading-relaxed">
            Connect with 2,500+ verified doctors. Book appointments, read reviews, and find the best care.
          </p>

          {/* Floating search bar */}
          <div className="w-full max-w-3xl bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl shadow-[#E07A5F]/10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-14 px-4 bg-white rounded-2xl border border-[#F2E8DC] shadow-sm">
                <svg className="h-5 w-5 text-[#E07A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Search doctors by name..." className="flex-1 bg-transparent text-[#3D405B] placeholder:text-[#3D405B]/40 outline-none text-sm" />
              </div>
              <div className="flex-1 flex items-center gap-3 h-14 px-4 bg-white rounded-2xl border border-[#F2E8DC] shadow-sm">
                <svg className="h-5 w-5 text-[#E07A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <select className="flex-1 bg-transparent text-[#3D405B] outline-none text-sm cursor-pointer"><option value="">All Locations</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
              </div>
              <button className="h-14 px-8 bg-[#E07A5F] text-white rounded-2xl font-semibold text-sm hover:bg-[#D16A4F] transition-all shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Search
              </button>
            </div>
          </div>

          {/* Stats row below search */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {stats.map((stat,i)=> (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-[#E07A5F]">{stat.value}</div>
                <div className="text-sm text-[#3D405B]/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Circular with connecting line */}
      <section className="py-20 bg-[#FEFCF8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#E07A5F] uppercase tracking-wider mb-3 block">Simple Steps</span>
            <h2 className="text-3xl font-bold text-[#3D405B]">Book in Minutes</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-[#F2E8DC]"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Search", desc: "Find doctors by specialty, location, or insurance.", icon: "🔍" },
                { title: "Compare", desc: "Read reviews, compare fees, and view profiles.", icon: "⚖️" },
                { title: "Book", desc: "Choose a time slot and book instantly.", icon: "📅" },
              ].map((step, i) => (
                <div key={i} className="text-center relative z-10">
                  <div className="w-32 h-32 mx-auto rounded-full bg-white border-4 border-[#F2E8DC] flex flex-col items-center justify-center shadow-lg hover:border-[#E07A5F] transition-all hover:scale-105 cursor-default mb-4">
                    <span className="text-3xl mb-1">{step.icon}</span>
                    <span className="text-sm font-bold text-[#3D405B]">{step.title}</span>
                  </div>
                  <p className="text-sm text-[#3D405B]/60 max-w-[200px] mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors - Horizontal Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-sm font-semibold text-[#E07A5F] uppercase tracking-wider mb-3 block">Top Rated</span>
              <h2 className="text-3xl font-bold text-[#3D405B]">Featured Specialists</h2>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-[#F2E8DC] flex items-center justify-center text-[#3D405B] hover:bg-[#F2E8DC] transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <button className="w-10 h-10 rounded-full border border-[#F2E8DC] flex items-center justify-center text-[#3D405B] hover:bg-[#F2E8DC] transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex-shrink-0 w-80 snap-start bg-[#FEFCF8] rounded-2xl border border-[#F2E8DC] overflow-hidden hover:shadow-xl hover:shadow-[#E07A5F]/10 transition-all">
                <div className="relative h-40 bg-[#F2E8DC]">
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(to_top,white,transparent)]"></div>
                  <div className="absolute top-4 right-4 bg-[#E07A5F] rounded-full px-3 py-1 text-xs font-bold text-white">{doctor.fee} EGP</div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="pt-8 px-6 pb-6 text-center">
                  <h3 className="text-lg font-bold text-[#3D405B] mb-1">{doctor.name}</h3>
                  <p className="text-[#E07A5F] font-medium text-sm mb-2">{doctor.specialty}</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-xs font-bold text-[#3D405B]">{doctor.rating}</span>
                    <span className="text-xs text-[#3D405B]/40">({doctor.reviews})</span>
                  </div>
                  <p className="text-[#3D405B]/70 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                  <button className="w-full h-11 bg-[#E07A5F] text-white rounded-xl font-medium text-sm hover:bg-[#D16A4F] transition-colors shadow-md shadow-[#E07A5F]/20">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Logo strip */}
      <section className="py-16 bg-[#FEFCF8] border-y border-[#F2E8DC]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-[#3D405B]/50 mb-8 font-medium uppercase tracking-wider">Trusted by Egypt's Leading Medical Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {partners.map((name, i) => (
              <div key={i} className="text-lg font-bold text-[#3D405B]/40 tracking-wide">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#E07A5F] uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-3xl font-bold text-[#3D405B]">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-[#FEFCF8] rounded-2xl p-6 border border-[#F2E8DC] hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-[#3D405B] text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E07A5F] flex items-center justify-center text-white font-bold text-sm">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="font-semibold text-[#3D405B] text-sm">{r.name}</div>
                    <div className="text-xs text-[#3D405B]/40">{r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Full width image */}
      <section className="relative py-24 overflow-hidden bg-[#3D405B]">
        <div className="absolute inset-0 bg-[#E07A5F]/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_#E07A5F/20_0%,transparent_70%)]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Doctor?</h2>
          <p className="text-lg text-[#F2E8DC]/70 mb-10 max-w-xl mx-auto">Join thousands of patients who trust EGY Doctors for their healthcare needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#E07A5F] text-white rounded-xl font-semibold hover:bg-[#D16A4F] transition-colors shadow-xl shadow-[#E07A5F]/20">Search Doctors Now</button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D405B] text-white py-16 border-t border-[#3D405B]/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E07A5F] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-lg font-bold">EGY Doctors</span>
              </div>
              <p className="text-sm text-[#F2E8DC]/60 leading-relaxed">Egypt's leading platform for connecting patients with top-rated medical professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=> (
                  <li key={item}><span className="text-sm text-[#F2E8DC]/60 hover:text-[#E07A5F] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Doctors</h4>
              <ul className="space-y-3">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=> (
                  <li key={item}><span className="text-sm text-[#F2E8DC]/60 hover:text-[#E07A5F] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">Contact</h4>
              <ul className="space-y-3 text-sm text-[#F2E8DC]/60">
                <li>+20 1 234 5678</li>
                <li>hello@egydoctors.com</li>
                <li>Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#F2E8DC]/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#F2E8DC]/40">&copy; 2025 EGY Doctors. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-[#F2E8DC]/40">
              <span className="hover:text-[#E07A5F] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#E07A5F] cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-[#E07A5F] cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
