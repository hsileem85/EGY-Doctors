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
    <svg className="w-4 h-4 fill-[#D4A090] text-[#D4A090]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function WarmClinical() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#2D3728]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2EC]/90 backdrop-blur-xl border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8B9D77] flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#2D3728]">EGY <span className="text-[#8B9D77]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-[#4A5545] font-medium">Search</span>
            <span className="hidden md:block text-sm text-[#4A5545] font-medium">For Doctors</span>
            <span className="hidden md:block text-sm text-[#4A5545] font-medium">Medical Centers</span>
            <button className="text-sm text-[#4A5545] px-2 py-1 rounded-lg hover:bg-[#E5E0D5]">عربي</button>
            <button className="text-sm px-4 py-2 rounded-lg border border-[#DCD7CB] text-[#4A5545] hover:bg-[#E5E0D5]">Sign In</button>
            <button className="text-sm px-4 py-2 rounded-lg bg-[#8B9D77] text-white hover:bg-[#7A8A68] font-medium shadow-sm transition-colors">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Two Column Split */}
      <section className="relative pt-16 min-h-[92vh] bg-[#F5F2EC]">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text + Search */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DCD7CB] text-[#8B9D77] text-sm font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#D4A090] animate-pulse"></span>
                Egypt's #1 Medical Booking Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold text-[#2D3728] leading-[1.1]">
                Find & Book the <span className="text-[#D4A090]">Best Doctors</span> in Egypt
              </h1>
              <p className="text-lg text-[#5C6656] leading-relaxed max-w-lg">
                Connect with 2,500+ verified medical professionals. Read reviews, compare fees, and book in seconds.
              </p>
              {/* Search Bar */}
              <div className="bg-white/80 backdrop-blur-xl border border-[#E5E0D5] rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(139,157,119,0.1)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#E5E0D5] rounded-xl bg-white focus-within:border-[#8B9D77] transition-colors">
                    <svg className="h-4 w-4 text-[#8B9D77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search by name" className="flex-1 bg-transparent text-sm text-[#2D3728] placeholder:text-[#8E9988] outline-none w-0" />
                  </div>
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#E5E0D5] rounded-xl bg-white focus-within:border-[#8B9D77] transition-colors">
                    <svg className="h-4 w-4 text-[#8B9D77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-[#2D3728] outline-none cursor-pointer w-0"><option value="">Specialty</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                  </div>
                  <div className="flex items-center gap-2 h-11 px-3 border border-[#E5E0D5] rounded-xl bg-white focus-within:border-[#8B9D77] transition-colors">
                    <svg className="h-4 w-4 text-[#8B9D77]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-[#2D3728] outline-none cursor-pointer w-0"><option value="">Location</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                  </div>
                </div>
                <button className="w-full h-12 bg-[#8B9D77] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#7A8A68] transition-all shadow-md active:scale-[0.98]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search Doctors
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.slice(0,5).map(s=> (
                  <button key={s} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E0D5] text-[#5C6656] text-sm hover:bg-[#F5F2EC] hover:text-[#2D3728] transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Stats Panel */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-[#D4A090]/10 rounded-full blur-3xl"></div>
              </div>
              <div className="relative grid grid-cols-2 gap-4">
                {stats.map((stat,i)=> (
                  <div key={i} className="bg-white/60 backdrop-blur border border-[#E5E0D5] rounded-2xl p-6 text-center hover:border-[#8B9D77]/40 transition-all shadow-sm">
                    <div className="text-3xl font-bold text-[#8B9D77] mb-1">{stat.value}</div>
                    <div className="text-sm text-[#5C6656]">{stat.label}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-[#D4A090]/10 border border-[#D4A090]/20 rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {doctors.map(d => (
                      <div key={d.id} className="w-10 h-10 rounded-full border-2 border-[#F5F2EC] overflow-hidden"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#F5F2EC] bg-[#8B9D77] flex items-center justify-center text-xs text-white font-bold">+2K</div>
                  </div>
                  <div className="text-sm text-[#5C6656]">
                    <span className="text-[#8B9D77] font-bold">2,500+</span> doctors registered across Egypt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Scroll Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#8B9D77] uppercase tracking-wider mb-3 block">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D3728] mb-4">How It Works</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {[
              { title:"Search", desc:"Find doctors by specialty, location, or insurance.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, step:"01" },
              { title:"Compare", desc:"Read reviews, compare fees, and view profiles.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>, step:"02" },
              { title:"Book", desc:"Choose a time slot and book instantly.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>, step:"03" },
              { title:"Visit", desc:"Get a reminder and visit your doctor.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>, step:"04" },
            ].map((step,i)=> (
              <div key={i} className="flex-shrink-0 w-72 snap-start p-6 rounded-2xl border border-[#E5E0D5] hover:border-[#8B9D77]/40 hover:shadow-md transition-all bg-[#F5F2EC]/50 group">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#8B9D77] group-hover:bg-[#8B9D77] group-hover:text-white transition-colors shadow-sm">{step.icon}</div>
                  <span className="text-4xl font-bold text-[#E5E0D5]">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#2D3728] mb-2">{step.title}</h3>
                <p className="text-[#5C6656] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors - Masonry Grid */}
      <section className="py-20 bg-[#F5F2EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-sm font-semibold text-[#8B9D77] uppercase tracking-wider mb-3 block">Top Rated</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2D3728]">Featured Specialists</h2>
            </div>
            <button className="text-[#8B9D77] hover:text-[#7A8A68] font-medium text-sm flex items-center gap-1.5">View All <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {doctors.map((doctor, i)=> (
              <div key={doctor.id} className={`bg-white rounded-2xl border border-[#E5E0D5] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden ${i === 1 ? 'md:translate-y-8' : ''}`}>
                <div className="relative h-28 bg-[#8B9D77]/10 overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_top,white,transparent)]"></div>
                  <div className="absolute bottom-3 left-5 z-10">
                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm overflow-hidden bg-white">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#D4A090] rounded-full px-3 py-1 text-xs font-bold text-white">{doctor.fee} EGP</div>
                </div>
                <div className="pt-5 px-5 pb-5">
                  <h3 className="text-lg font-bold text-[#2D3728] mb-1">{doctor.name}</h3>
                  <p className="text-[#8B9D77] font-medium text-sm flex items-center gap-1.5 mb-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-xs font-bold text-[#2D3728]">{doctor.rating}</span>
                    <span className="text-xs text-[#8E9988]">({doctor.reviews})</span>
                  </div>
                  <p className="text-[#5C6656] text-sm mb-3 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-[#5C6656] mb-4">
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full h-10 bg-[#F5F2EC] text-[#8B9D77] rounded-xl font-medium text-sm hover:bg-[#8B9D77] hover:text-white transition-colors">Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Marquee */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#D4A090] uppercase tracking-wider mb-3 block">Trusted Partners</span>
            <h2 className="text-3xl font-bold text-[#2D3728]">Egypt's Top Medical Partners</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p,i)=> (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#E5E0D5] bg-[#F5F2EC]/50 hover:border-[#8B9D77]/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#8B9D77] font-bold text-sm shadow-sm">{p.abbr}</div>
                <span className="text-sm text-[#4A5545] font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Side by Side */}
      <section className="py-20 bg-[#F5F2EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#8B9D77] uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-3xl font-bold text-[#2D3728]">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5E0D5] hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-[#5C6656] text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#8B9D77] font-bold text-sm">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="font-semibold text-[#2D3728] text-sm">{r.name}</div>
                    <div className="text-xs text-[#8E9988]">{r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#8B9D77]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Find Your Doctor?</h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">Join 150,000+ patients who have already found their perfect healthcare match.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#D4A090] text-white rounded-xl font-semibold hover:bg-[#C38D7D] transition-colors shadow-lg">Search Doctors Now</button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-[#2D3728] py-16 border-t border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#8B9D77] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-lg font-bold">EGY Doctors</span>
              </div>
              <p className="text-sm text-[#5C6656] leading-relaxed">Egypt's leading platform for connecting patients with top-rated medical professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[#2D3728]">For Patients</h4>
              <ul className="space-y-3">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=> (
                  <li key={item}><span className="text-sm text-[#5C6656] hover:text-[#8B9D77] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[#2D3728]">For Doctors</h4>
              <ul className="space-y-3">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=> (
                  <li key={item}><span className="text-sm text-[#5C6656] hover:text-[#8B9D77] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[#2D3728]">Contact</h4>
              <ul className="space-y-3 text-sm text-[#5C6656]">
                <li>+20 1 234 5678</li>
                <li>hello@egydoctors.com</li>
                <li>Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E5E0D5] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#8E9988]">&copy; 2025 EGY Doctors. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-[#8E9988]">
              <span className="hover:text-[#8B9D77] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#8B9D77] cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-[#8B9D77] cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
