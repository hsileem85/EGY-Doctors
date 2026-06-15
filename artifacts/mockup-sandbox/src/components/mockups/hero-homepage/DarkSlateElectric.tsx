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
  { name: "Saudi German Hospital", abbr: "SGH", color: "bg-[#2DD4BF]" },
  { name: "Dar Al Fouad", abbr: "DAF", color: "bg-[#0EA5E9]" },
  { name: "Alfa Lab", abbr: "AL", color: "bg-[#F59E0B]" },
  { name: "Alfa Scan", abbr: "AS", color: "bg-[#6366F1]" },
  { name: "Cleopatra Hospital", abbr: "CH", color: "bg-[#EC4899]" },
  { name: "Al-Mokhtabar", abbr: "AM", color: "bg-[#10B981]" },
  { name: "Nile Scan", abbr: "NS", color: "bg-[#8B5CF6]" },
  { name: "Elite Medical", abbr: "EM", color: "bg-[#06B6D4]" },
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
    <div className="min-h-screen bg-[#0F172A] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#2DD4BF]/20">
              <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            <span className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">EGY <span className="text-[#2DD4BF]">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-400 font-medium">Search</span>
            <span className="hidden md:block text-sm text-gray-400 font-medium">For Doctors</span>
            <span className="hidden md:block text-sm text-gray-400 font-medium">Medical Centers</span>
            <button className="text-sm text-gray-400 px-2 py-1 rounded-lg hover:bg-[#1E293B]">🇪🇬 عربي</button>
            <button className="text-sm px-4 py-2 rounded-lg border border-[#1E293B] text-gray-300 hover:bg-[#1E293B]">Sign In</button>
            <button className="text-sm px-4 py-2 rounded-lg bg-[#2DD4BF] text-[#0F172A] hover:bg-[#14B8A6] font-medium shadow-md shadow-[#2DD4BF]/20">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Dark with Neon Accents */}
      <section className="relative pt-16 min-h-[90vh] flex items-center bg-[#0F172A]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#2DD4BF]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#0EA5E9]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2DD4BF]/3 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 w-full">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#2DD4BF]/30 text-[#2DD4BF] text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
              Egypt's #1 Medical Booking Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-['Plus_Jakarta_Sans'] mb-6">
              Find & Book the <span className="text-[#2DD4BF]">Best Doctors</span> in Egypt
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Connect with 2,500+ verified medical professionals. Read patient reviews, compare fees, and book your appointment in seconds.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1E293B]/60 backdrop-blur-2xl border border-[#334155] rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(45,212,191,0.08)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">Doctor Name</label>
                  <div className="flex items-center gap-2 h-12 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search by name" className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">Specialty</label>
                  <div className="flex items-center gap-2 h-12 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer"><option value="">Choose specialty</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block px-1">Location</label>
                  <div className="flex items-center gap-2 h-12 px-3 border border-[#334155] rounded-xl bg-[#0F172A]/50">
                    <svg className="h-4 w-4 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer"><option value="">Choose city</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button className="w-full h-12 bg-[#2DD4BF] text-[#0F172A] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#14B8A6] transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] active:scale-[0.98]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    Search Doctors
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {specialties.slice(0,5).map(s=> (
                <button key={s} className="px-4 py-2 rounded-full bg-[#1E293B]/80 border border-[#334155] text-gray-400 text-sm font-medium hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Dark Card */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat,i)=>(
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#2DD4BF] font-['Plus_Jakarta_Sans'] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-4">Book Your Appointment in 3 Easy Steps</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">No more waiting on hold or long queues. Find your doctor, compare, and book in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title:"Search", desc:"Find doctors by specialty, location, or insurance coverage.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> },
              { title:"Compare", desc:"Read reviews, compare fees, and view doctor profiles.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg> },
              { title:"Book", desc:"Choose a time slot and book your appointment instantly.", icon:<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg> },
            ].map((step,i)=>(
              <div key={i} className="relative text-center p-8 rounded-2xl border border-[#334155] hover:border-[#2DD4BF]/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.08)] transition-all group bg-[#1E293B]/50">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2DD4BF] text-[#0F172A] text-sm font-bold flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.4)]">{i+1}</div>
                <div className="w-16 h-16 rounded-2xl bg-[#2DD4BF]/10 flex items-center justify-center mx-auto mb-5 text-[#2DD4BF] group-hover:bg-[#2DD4BF]/20 transition-colors">{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Top Rated</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Plus_Jakarta_Sans']">Featured Specialists</h2>
              <p className="text-gray-400 mt-2">Hand-picked doctors with the highest patient ratings and verified credentials.</p>
            </div>
            <button className="text-[#2DD4BF] hover:text-[#14B8A6] font-medium text-sm flex items-center gap-1.5 transition-colors">View All Doctors <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor)=>(
              <div key={doctor.id} className="bg-[#1E293B] rounded-2xl border border-[#334155] hover:border-[#2DD4BF]/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <div className="relative h-32 bg-[#0F172A] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,191,0.08)_0%,_transparent_60%)]"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_top,_#1E293B,_transparent)]"></div>
                  <div className="absolute bottom-3 left-6 z-10">
                    <div className="w-20 h-20 rounded-2xl border-4 border-[#1E293B] shadow-lg overflow-hidden bg-[#1E293B]">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#2DD4BF] rounded-full px-3 py-1 text-xs font-bold text-[#0F172A] shadow-sm shadow-[#2DD4BF]/30">{doctor.fee} EGP</div>
                </div>
                <div className="pt-6 px-6 pb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{doctor.name}</h3>
                  <p className="text-[#2DD4BF] font-medium text-sm flex items-center gap-1.5 mb-3">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-xs font-bold text-gray-300">{doctor.rating}</span>
                    <span className="text-xs text-gray-500">({doctor.reviews} reviews)</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">{doctor.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                    <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full h-11 bg-[#2DD4BF] text-[#0F172A] rounded-xl font-medium text-sm hover:bg-[#14B8A6] transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] active:scale-[0.98]">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Trusted Partners</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-4">Egypt's Top Medical Partners</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Partnered with the country's leading hospitals, labs, and imaging centers.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partners.map((p,i)=>(
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[#334155] hover:border-[#2DD4BF]/40 hover:shadow-[0_0_20px_rgba(45,212,191,0.08)] transition-all cursor-pointer bg-[#1E293B]">
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-[#0F172A] font-bold text-sm shrink-0 shadow-md`}>{p.abbr}</div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-200 text-sm truncate">{p.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 block">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Plus_Jakarta_Sans']">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r,i)=>(
              <div key={i} className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155] hover:border-[#2DD4BF]/30 hover:shadow-[0_0_20px_rgba(45,212,191,0.06)] transition-all">
                <div className="flex gap-0.5 mb-4">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2DD4BF] flex items-center justify-center text-[#0F172A] font-bold text-sm">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                    <div>
                      <div className="font-semibold text-white text-sm">{r.name}</div>
                      <div className="text-xs text-gray-500">Verified Patient</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1E293B] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2DD4BF]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#0EA5E9]/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-6 leading-tight">Ready to Find Your Doctor?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">Join 150,000+ patients who have already found their perfect healthcare match through EGY Doctors.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#2DD4BF] text-[#0F172A] rounded-xl font-semibold text-base hover:bg-[#14B8A6] transition-colors shadow-[0_0_30px_rgba(45,212,191,0.3)] active:scale-[0.98]">Search Doctors Now</button>
            <button className="px-8 py-4 bg-white/5 border border-[#334155] text-white rounded-xl font-semibold text-base hover:bg-white/10 transition-colors active:scale-[0.98]">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-lg font-bold font-['Plus_Jakarta_Sans']">EGY Doctors</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Egypt's leading platform for connecting patients with top-rated medical professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=>(
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#2DD4BF] cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white">For Doctors</h4>
              <ul className="space-y-3">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=>(
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
