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
    <svg className="w-4 h-4 fill-[#2DD4BF] text-[#2DD4BF]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function DarkSlateElectric() {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF] flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)]">
              <svg className="w-5 h-5 text-[#0B0F19]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            <span className="text-xl font-bold text-white">EGY <span className="text-[#2DD4BF]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-400 font-medium">Search</span>
            <span className="hidden md:block text-sm text-gray-400 font-medium">For Doctors</span>
            <span className="hidden md:block text-sm text-gray-400 font-medium">Medical Centers</span>
            <button className="text-sm text-gray-400 px-2 py-1 rounded-lg hover:bg-[#1E293B]">🇪🇬 عربي</button>
            <button className="text-sm px-4 py-2 rounded-lg border border-[#1E293B] text-gray-300 hover:bg-[#1E293B]">Sign In</button>
            <button className="text-sm px-4 py-2 rounded-lg bg-[#2DD4BF] text-[#0B0F19] hover:bg-[#14B8A6] font-medium shadow-[0_0_15px_rgba(45,212,191,0.2)]">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Asymmetric Bento Grid */}
      <section className="relative pt-16 min-h-[92vh] bg-[#0B0F19] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#2DD4BF]/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#0EA5E9]/5 rounded-full blur-[80px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* Left column - main text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#2DD4BF]/30 text-[#2DD4BF] text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                Egypt's #1 Medical Booking Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.05]">
                Find & Book the <span className="text-[#2DD4BF]">Best</span> Healthcare in Egypt
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Connect with 2,500+ verified medical professionals. Read reviews, compare fees, and book in seconds.
              </p>
              {/* Large search card */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155] rounded-3xl p-6 shadow-[0_0_40px_rgba(45,212,191,0.06)]">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3 h-14 px-4 bg-[#0B0F19]/60 border border-[#334155] rounded-xl">
                    <svg className="h-5 w-5 text-[#2DD4BF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search by name, specialty, or location..." className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 h-12 px-4 bg-[#0B0F19]/60 border border-[#334155] rounded-xl">
                      <svg className="h-4 w-4 text-[#2DD4BF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                      <select className="flex-1 bg-transparent text-white outline-none text-sm cursor-pointer w-0"><option value="">All Specialties</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                    </div>
                    <div className="flex items-center gap-3 h-12 px-4 bg-[#0B0F19]/60 border border-[#334155] rounded-xl">
                      <svg className="h-4 w-4 text-[#2DD4BF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <select className="flex-1 bg-transparent text-white outline-none text-sm cursor-pointer w-0"><option value="">All Locations</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                    </div>
                  </div>
                </div>
                <button className="w-full h-13 bg-[#2DD4BF] text-[#0B0F19] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#14B8A6] transition-all shadow-[0_0_30px_rgba(45,212,191,0.2)] active:scale-[0.98] py-3.5">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search Doctors
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.slice(0,5).map(s=> (
                  <button key={s} className="px-3 py-1.5 rounded-full bg-[#1E293B]/60 border border-[#334155] text-gray-400 text-sm hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Right column - bento cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 content-start">
              <div className="col-span-2 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-5 hover:border-[#2DD4BF]/20 transition-all">
                <div className="text-sm text-gray-500 mb-3">Total Verified Doctors</div>
                <div className="text-4xl font-bold text-[#2DD4BF]">2,500+</div>
                <div className="text-sm text-gray-400 mt-1">Across 50+ specialties</div>
              </div>
              <div className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-5 hover:border-[#2DD4BF]/20 transition-all">
                <div className="text-sm text-gray-500 mb-2">Happy Patients</div>
                <div className="text-2xl font-bold text-white">150K+</div>
              </div>
              <div className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-5 hover:border-[#2DD4BF]/20 transition-all">
                <div className="text-sm text-gray-500 mb-2">Avg. Rating</div>
                <div className="text-2xl font-bold text-[#2DD4BF]">4.9/5</div>
              </div>
              <div className="col-span-2 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-5 hover:border-[#2DD4BF]/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {doctors.map(d => (
                      <div key={d.id} className="w-9 h-9 rounded-full border-2 border-[#0B0F19] overflow-hidden"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-[#0B0F19] bg-[#2DD4BF] flex items-center justify-center text-[10px] text-[#0B0F19] font-bold">+2K</div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="text-[#2DD4BF] font-bold">New doctors</span> joining every week
                  </div>
                </div>
              </div>
              <div className="col-span-2 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-4 hover:border-[#2DD4BF]/20 transition-all">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {["Mon","Tue","Wed","Thu"].map((day, i) => (
                    <div key={i} className="bg-[#0B0F19]/50 rounded-lg py-3">
                      <div className="text-xs text-gray-500">{day}</div>
                      <div className="text-sm font-bold text-[#2DD4BF]">140+</div>
                      <div className="text-[10px] text-gray-600">slots</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Bento Grid */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Simple Process</span>
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
            <div className="md:col-span-1 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-6 hover:border-[#2DD4BF]/20 transition-all group">
              <div className="text-[#2DD4BF] text-4xl font-bold mb-4">01</div>
              <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center mb-4 text-[#2DD4BF] group-hover:bg-[#2DD4BF]/20 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Search</h3>
              <p className="text-gray-400 text-sm">Find doctors by specialty, location, or insurance coverage.</p>
            </div>
            <div className="md:col-span-2 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-6 hover:border-[#2DD4BF]/20 transition-all group">
              <div className="flex items-start gap-6">
                <div>
                  <div className="text-[#2DD4BF] text-4xl font-bold mb-4">02</div>
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center mb-4 text-[#2DD4BF] group-hover:bg-[#2DD4BF]/20 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Compare</h3>
                  <p className="text-gray-400 text-sm">Read reviews, compare fees, and view detailed profiles.</p>
                </div>
                <div className="hidden sm:block flex-1 bg-[#0B0F19]/50 rounded-xl p-4 border border-[#334155]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/20 flex items-center justify-center text-xs text-[#2DD4BF] font-bold">4.9</div>
                      <div className="text-sm text-gray-300">Dr. Ahmed Youssef</div>
                      <div className="text-sm text-[#2DD4BF] ml-auto">450 EGP</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#334155] flex items-center justify-center text-xs text-gray-400 font-bold">4.8</div>
                      <div className="text-sm text-gray-300">Dr. Sara Mahmoud</div>
                      <div className="text-sm text-gray-400 ml-auto">350 EGP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-6 hover:border-[#2DD4BF]/20 transition-all group">
              <div className="flex items-center gap-8">
                <div className="text-[#2DD4BF] text-4xl font-bold">03</div>
                <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] group-hover:bg-[#2DD4BF]/20 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Book & Confirm</h3>
                  <p className="text-gray-400 text-sm">Choose a time slot and book instantly. Get SMS confirmation.</p>
                </div>
                <div className="hidden sm:block bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 rounded-xl px-4 py-2 text-[#2DD4BF] text-sm font-semibold">Instant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors - Horizontal scroll with cards */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Top Rated</span>
              <h2 className="text-3xl font-bold text-white">Featured Specialists</h2>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#1E293B] transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <button className="w-10 h-10 rounded-full border border-[#334155] flex items-center justify-center text-gray-400 hover:bg-[#1E293B] transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex-shrink-0 w-72 snap-start bg-[#1E293B]/40 border border-[#334155] rounded-2xl overflow-hidden hover:border-[#2DD4BF]/30 hover:shadow-[0_0_30px_rgba(45,212,191,0.08)] transition-all">
                <div className="relative h-32 bg-[#0B0F19]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,191,0.1)_0%,_transparent_60%)]"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_top,_#1E293B,_transparent)]"></div>
                  <div className="absolute top-3 right-3 bg-[#2DD4BF] rounded-full px-3 py-1 text-xs font-bold text-[#0B0F19]">{doctor.fee} EGP</div>
                  <div className="absolute bottom-3 left-5 z-10">
                    <div className="w-18 h-18 rounded-2xl border-4 border-[#1E293B] shadow-lg overflow-hidden bg-[#1E293B]">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="pt-8 px-5 pb-5">
                  <h3 className="text-lg font-bold text-white mb-1">{doctor.name}</h3>
                  <p className="text-[#2DD4BF] font-medium text-sm flex items-center gap-1.5 mb-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-xs font-bold text-gray-300">{doctor.rating}</span>
                    <span className="text-xs text-gray-500">({doctor.reviews})</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full h-10 bg-[#2DD4BF] text-[#0B0F19] rounded-xl font-medium text-sm hover:bg-[#14B8A6] transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)]">Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Logo strip */}
      <section className="py-16 bg-[#0B0F19] border-y border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8 font-medium uppercase tracking-wider">Trusted Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-40">
            {partners.map((name, i) => (
              <div key={i} className="text-lg font-bold text-gray-500 tracking-wide">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-3xl font-bold text-white">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-[#1E293B]/40 rounded-2xl p-6 border border-[#334155] hover:border-[#2DD4BF]/20 transition-all">
                <div className="flex gap-0.5 mb-4">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2DD4BF] flex items-center justify-center text-[#0B0F19] font-bold text-sm">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="font-semibold text-white text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-[#1E293B]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2DD4BF]/10 rounded-full blur-[100px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Doctor?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">Join thousands of patients who trust EGY Doctors for their healthcare needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#2DD4BF] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#14B8A6] transition-colors shadow-[0_0_30px_rgba(45,212,191,0.3)]">Search Doctors Now</button>
            <button className="px-8 py-4 bg-white/5 border border-[#334155] text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0F19] text-white py-16 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0B0F19]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-lg font-bold">EGY Doctors</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Egypt's leading platform for connecting patients with top-rated medical professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#2DD4BF] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Doctors</h4>
              <ul className="space-y-3">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#2DD4BF] cursor-pointer transition-colors">{item}</span></li>
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
              <span className="hover:text-[#2DD4BF] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#2DD4BF] cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-[#2DD4BF] cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
