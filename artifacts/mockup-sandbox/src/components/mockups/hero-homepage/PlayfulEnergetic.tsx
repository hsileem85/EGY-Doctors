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
    <svg className="w-5 h-5 fill-orange-400 text-orange-400" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function PlayfulEnergetic() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3 hover:rotate-0 transition-transform">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-2xl font-black text-blue-900 tracking-tight">EGY <span className="text-orange-500">Doctors</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-slate-600 font-bold hover:text-blue-600 cursor-pointer transition-colors px-2">Search</span>
            <span className="hidden md:block text-sm text-slate-600 font-bold hover:text-blue-600 cursor-pointer transition-colors px-2">For Doctors</span>
            <span className="hidden md:block text-sm text-slate-600 font-bold hover:text-blue-600 cursor-pointer transition-colors px-2">Medical Centers</span>
            <button className="text-sm font-bold text-slate-600 px-3 py-2 rounded-xl hover:bg-sky-50 transition-colors">AR</button>
            <button className="text-sm px-5 py-2.5 rounded-xl border-2 border-slate-100 text-slate-700 font-bold hover:border-blue-100 hover:bg-blue-50 transition-all">Sign In</button>
            <button className="text-sm px-6 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 font-bold shadow-lg shadow-orange-500/30 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Two Column Split */}
      <section className="relative pt-20 min-h-[92vh] bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 overflow-hidden">
        {/* Playful background shapes */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text + Search */}
            <div className="space-y-8 lg:pr-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                Egypt's #1 Medical Booking Platform
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-black text-white leading-[1.1] tracking-tight">
                Feel better. <br />
                <span className="text-orange-300 inline-block -rotate-1 origin-left">Find your doctor</span> <br />
                in seconds.
              </h1>
              <p className="text-xl text-blue-50 leading-relaxed font-medium max-w-lg">
                Connect with 2,500+ verified medical professionals. Read reviews, compare fees, and book with a smile.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-2xl shadow-blue-900/20 border-4 border-white/50 backdrop-blur-sm relative z-20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-3 h-14 px-4 border-2 border-sky-100 focus-within:border-orange-400 rounded-2xl bg-sky-50/50 transition-colors">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search by name" className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none w-0" />
                  </div>
                  <div className="flex items-center gap-3 h-14 px-4 border-2 border-sky-100 focus-within:border-orange-400 rounded-2xl bg-sky-50/50 transition-colors">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer w-0 appearance-none"><option value="">Specialty</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                  </div>
                  <div className="flex items-center gap-3 h-14 px-4 border-2 border-sky-100 focus-within:border-orange-400 rounded-2xl bg-sky-50/50 transition-colors">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer w-0 appearance-none"><option value="">Location</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                  </div>
                </div>
                <button className="w-full h-14 bg-orange-500 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search Doctors
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {specialties.slice(0,5).map(s=> (
                  <button key={s} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm font-semibold hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 transition-all shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Stats Panel */}
            <div className="relative">
              <div className="relative grid grid-cols-2 gap-5 z-10">
                {stats.map((stat,i)=> (
                  <div key={i} className="bg-white rounded-3xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-white/50 shadow-md transform rotate-1 hover:rotate-0">
                    <div className="text-4xl font-black text-blue-600 mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-orange-400 rounded-3xl p-6 flex items-center gap-5 shadow-xl border-4 border-orange-300 transform -rotate-1 hover:rotate-0 transition-all duration-300">
                  <div className="flex -space-x-3">
                    {doctors.map(d => (
                      <div key={d.id} className="w-12 h-12 rounded-full border-4 border-orange-400 overflow-hidden shadow-sm"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-orange-400 bg-white flex items-center justify-center text-sm text-orange-500 font-black shadow-sm">+2K</div>
                  </div>
                  <div className="text-base text-orange-50 font-medium leading-snug">
                    <span className="text-white font-black text-lg block">2,500+ doctors</span> registered across Egypt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wavy bottom divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[50px] sm:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.8,188.94,103.5Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* How It Works - Horizontal Scroll Cards */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-sm tracking-widest uppercase mb-4">Simple Process</span>
            <h2 className="text-4xl sm:text-5xl font-black text-blue-950 mb-4 tracking-tight">How It Works</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 sm:px-0 -mx-4 sm:mx-0">
            {[
              { title:"Search", desc:"Find doctors by specialty, location, or insurance easily.", icon:<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, step:"1", color:"bg-blue-100 text-blue-600" },
              { title:"Compare", desc:"Read real reviews, compare fees, and view deep profiles.", icon:<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>, step:"2", color:"bg-sky-100 text-sky-600" },
              { title:"Book", desc:"Choose a time slot and book your visit instantly.", icon:<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>, step:"3", color:"bg-teal-100 text-teal-600" },
              { title:"Visit", desc:"Get a friendly reminder and visit your doctor on time.", icon:<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>, step:"4", color:"bg-orange-100 text-orange-600" },
            ].map((step,i)=> (
              <div key={i} className="flex-shrink-0 w-72 snap-center p-8 rounded-[2.5rem] border-2 border-transparent hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all duration-300 bg-white group">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 ${step.color}`}>{step.icon}</div>
                  <span className="text-5xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">{step.step}</span>
                </div>
                <h3 className="text-2xl font-black text-blue-950 mb-3">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors - Masonry Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-16">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky-100 text-sky-600 font-bold text-sm tracking-widest uppercase mb-4">Top Rated</span>
              <h2 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight">Featured Specialists</h2>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-bold text-base flex items-center gap-2 hover:bg-blue-50 px-5 py-2.5 rounded-full transition-colors w-fit">
              View All Doctors <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor, i)=> (
              <div key={doctor.id} className={`bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden group ${i === 1 ? 'md:translate-y-12' : ''}`}>
                <div className="relative h-36 bg-gradient-to-br from-blue-100 to-sky-50 overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  <div className="absolute bottom-4 left-6 z-10 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                    <div className="w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-lg overflow-hidden bg-white">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-white rounded-full px-4 py-1.5 text-sm font-black text-orange-500 shadow-sm">
                    {doctor.fee} EGP
                  </div>
                </div>
                <div className="pt-6 px-6 pb-6">
                  <h3 className="text-xl font-black text-blue-950 mb-1.5">{doctor.name}</h3>
                  <p className="text-sky-600 font-bold text-sm flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    </span>
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2.5 mb-4 bg-orange-50 w-fit px-3 py-1.5 rounded-full">
                    <div className="flex gap-0.5">{Array.from({length:1}).map((_,i)=><Star key={i} />)}</div>
                    <span className="text-sm font-black text-slate-800">{doctor.rating}</span>
                    <span className="text-sm font-semibold text-slate-500">({doctor.reviews} reviews)</span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2 leading-relaxed">{doctor.bio}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 mb-6">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full h-12 bg-blue-50 text-blue-600 rounded-[1rem] font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors active:scale-[0.98]">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Marquee */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="white"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circles)"></rect>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white tracking-tight">Trusted by top medical centers</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p,i)=> (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">{p.abbr}</div>
                <span className="text-base text-white font-bold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Side by Side */}
      <section className="py-24 bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 font-bold text-sm tracking-widest uppercase mb-4">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight">Happy Patients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-6 bg-orange-50 w-fit px-3 py-1.5 rounded-full">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-slate-600 font-medium text-base leading-relaxed mb-8">"{r.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1rem] bg-sky-100 flex items-center justify-center text-sky-600 font-black text-lg">{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div className="font-black text-blue-950 text-base">{r.name}</div>
                    <div className="text-sm font-semibold text-slate-400">{r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-tr from-orange-400 to-orange-500 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-2xl"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">Ready to feel better?</h2>
          <p className="text-xl font-medium text-orange-50 mb-12 max-w-2xl mx-auto">Join 150,000+ patients who have already found their perfect healthcare match. It only takes a minute!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-orange-500 rounded-2xl font-black text-lg hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all">Search Doctors Now</button>
            <button className="px-8 py-4 bg-orange-600/30 border-2 border-orange-300 text-white rounded-2xl font-bold text-lg hover:bg-orange-600/50 transition-colors">Are you a Doctor?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 text-slate-600 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:pr-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <span className="text-2xl font-black text-blue-950">EGY <span className="text-orange-500">Doctors</span></span>
              </div>
              <p className="text-base font-medium text-slate-500 leading-relaxed">Making healthcare accessible, friendly, and transparent for everyone in Egypt.</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6 text-blue-950 tracking-tight">For Patients</h4>
              <ul className="space-y-4">
                {["Search Doctors","Book Appointment","Specialties","Insurance","Patient Reviews"].map(item=> (
                  <li key={item}><span className="text-base font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6 text-blue-950 tracking-tight">For Doctors</h4>
              <ul className="space-y-4">
                {["Join Network","Doctor Dashboard","Patient Management","Analytics","Pricing"].map(item=> (
                  <li key={item}><span className="text-base font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6 text-blue-950 tracking-tight">Contact</h4>
              <ul className="space-y-4 text-base font-semibold text-slate-500">
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> +20 1 234 5678</li>
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span> hello@egydoctors.com</li>
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span> Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold text-slate-400">&copy; 2025 EGY Doctors. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-bold text-slate-400">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
