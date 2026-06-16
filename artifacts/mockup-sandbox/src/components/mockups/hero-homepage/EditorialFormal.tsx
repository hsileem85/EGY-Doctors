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
    <svg className="w-4 h-4 fill-[#C8C8D4] text-[#C8C8D4]" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function EditorialFormal() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A2E] flex items-center justify-center border border-[#C8C8D4]/30">
              <svg className="w-5 h-5 text-[#C8C8D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-xl font-serif font-bold text-[#1A1A2E] tracking-wide uppercase">EGY <span className="text-gray-500">Doctors</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-gray-600 font-medium hover:text-[#1A1A2E] transition-colors">Search</span>
            <span className="hidden md:block text-sm text-gray-600 font-medium hover:text-[#1A1A2E] transition-colors">For Doctors</span>
            <span className="hidden md:block text-sm text-gray-600 font-medium hover:text-[#1A1A2E] transition-colors">Medical Centers</span>
            <div className="w-px h-4 bg-gray-300 mx-2 hidden md:block"></div>
            <button className="text-sm text-gray-600 px-2 py-1 hover:text-[#1A1A2E] transition-colors">EN</button>
            <button className="text-sm px-5 py-2 text-[#1A1A2E] font-medium border-b border-transparent hover:border-[#1A1A2E] transition-all">Sign In</button>
            <button className="text-sm px-6 py-2.5 bg-[#1A1A2E] text-[#C8C8D4] hover:bg-black font-medium transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero - Two Column Split */}
      <section className="relative pt-16 min-h-[92vh] bg-[#1A1A2E] border-b border-[#C8C8D4]/20">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text + Search */}
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 pb-2 border-b border-[#C8C8D4]/30 text-[#C8C8D4] text-xs font-semibold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8C8D4]"></span>
                Egypt's Premier Medical Directory
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-serif text-white leading-[1.1] tracking-tight">
                Excellence in <br />
                <span className="text-[#C8C8D4] font-light italic">Healthcare</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg font-light">
                Connect with distinguished medical professionals. Curated expertise, transparent reviews, and seamless scheduling.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white/5 backdrop-blur-md border border-[#C8C8D4]/20 p-6 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 h-12 px-4 border border-[#C8C8D4]/30 bg-black/20 focus-within:border-[#C8C8D4] transition-colors">
                    <svg className="h-4 w-4 text-[#C8C8D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Physician name" className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-0" />
                  </div>
                  <div className="flex items-center gap-3 h-12 px-4 border border-[#C8C8D4]/30 bg-black/20 focus-within:border-[#C8C8D4] transition-colors">
                    <svg className="h-4 w-4 text-[#C8C8D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer w-0 appearance-none"><option value="">Discipline</option>{specialties.map(s=><option key={s}>{s}</option>)}</select>
                  </div>
                  <div className="flex items-center gap-3 h-12 px-4 border border-[#C8C8D4]/30 bg-black/20 focus-within:border-[#C8C8D4] transition-colors">
                    <svg className="h-4 w-4 text-[#C8C8D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select className="flex-1 bg-transparent text-sm text-white outline-none [&>option]:text-gray-900 cursor-pointer w-0 appearance-none"><option value="">Location</option>{locations.map(l=><option key={l}>{l}</option>)}</select>
                  </div>
                </div>
                <button className="w-full h-14 bg-[#C8C8D4] text-[#1A1A2E] font-bold text-sm tracking-wide uppercase hover:bg-white transition-all flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Search Directory
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {specialties.slice(0,5).map(s=> (
                  <button key={s} className="px-4 py-2 border border-[#C8C8D4]/20 text-gray-400 text-xs uppercase tracking-wider hover:bg-[#C8C8D4] hover:text-[#1A1A2E] transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Stats Panel */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative grid grid-cols-2 gap-1 border-t border-l border-[#C8C8D4]/20 bg-[#C8C8D4]/20">
                {stats.map((stat,i)=> (
                  <div key={i} className="bg-[#1A1A2E] p-8 text-center flex flex-col justify-center border-r border-b border-[#C8C8D4]/20 hover:bg-[#1A1A2E]/80 transition-colors">
                    <div className="text-3xl font-serif text-[#C8C8D4] mb-2">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">{stat.label}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-[#1A1A2E] border-r border-b border-[#C8C8D4]/20 p-8 flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {doctors.map(d => (
                      <div key={d.id} className="w-12 h-12 rounded-full border-2 border-[#1A1A2E] overflow-hidden grayscale contrast-125"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-[#1A1A2E] bg-[#C8C8D4] flex items-center justify-center text-xs text-[#1A1A2E] font-bold">+2K</div>
                  </div>
                  <div className="text-sm text-gray-400 font-light leading-relaxed">
                    <span className="text-white font-medium">2,500+</span> professionals<br/> across Egypt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Scroll Cards */}
      <section className="py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 block">The Process</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A2E]">Methodology</h2>
            <div className="w-12 h-px bg-[#C8C8D4] mx-auto mt-8"></div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {[
              { title:"Consult Directory", desc:"Browse specialists by discipline and region.", icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, step:"I" },
              { title:"Evaluate Credentials", desc:"Review qualifications and patient testimonials.", icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>, step:"II" },
              { title:"Schedule Visit", desc:"Secure an appointment through our system.", icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>, step:"III" },
              { title:"Receive Care", desc:"Attend your scheduled consultation.", icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>, step:"IV" },
            ].map((step,i)=> (
              <div key={i} className="flex-shrink-0 w-80 snap-start p-8 border border-gray-200 hover:border-[#1A1A2E] transition-colors bg-white group">
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 border border-gray-200 flex items-center justify-center text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-colors">{step.icon}</div>
                  <span className="text-xl font-serif text-gray-400 group-hover:text-[#1A1A2E] transition-colors">{step.step}</span>
                </div>
                <h3 className="text-xl font-serif text-[#1A1A2E] mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors - Masonry Grid */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 block">Eminent Practitioners</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A2E]">Featured Specialists</h2>
            </div>
            <button className="text-[#1A1A2E] border-b border-[#1A1A2E] pb-1 text-sm uppercase tracking-wider hover:text-gray-500 hover:border-gray-500 transition-colors">Explore Directory</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor, i)=> (
              <div key={doctor.id} className={`bg-white border border-gray-200 hover:shadow-xl transition-all duration-500 ${i === 1 ? 'md:translate-y-12' : ''}`}>
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-20 h-20 border border-gray-200 p-1 grayscale contrast-125">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-serif text-[#1A1A2E]">{doctor.fee} EGP</div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest">Consultation</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif text-[#1A1A2E] mb-2">{doctor.name}</h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
                    {doctor.specialty}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 font-light border-l-2 border-[#C8C8D4] pl-4">{doctor.bio}</p>
                </div>
                
                <div className="px-8 py-6 border-t border-gray-100 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider">
                    <span>{doctor.experience} Exp.</span>
                    <span>{doctor.location}</span>
                  </div>
                  <button className="w-full h-12 bg-transparent border border-[#1A1A2E] text-[#1A1A2E] text-sm tracking-widest uppercase hover:bg-[#1A1A2E] hover:text-white transition-colors">Schedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - Marquee */}
      <section className="py-24 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-serif text-gray-400 italic">In affiliation with esteemed institutions</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {partners.map((p,i)=> (
              <div key={i} className="px-6 py-4 border border-gray-200 flex items-center gap-4 grayscale opacity-60 hover:opacity-100 hover:border-gray-400 transition-all">
                <span className="text-xs font-bold tracking-widest text-[#1A1A2E] border-r border-gray-200 pr-4">{p.abbr}</span>
                <span className="text-sm text-gray-500 uppercase tracking-wider">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Side by Side */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 block">Patient Perspectives</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A2E]">Testimonials</h2>
            <div className="w-12 h-px bg-[#C8C8D4] mx-auto mt-8"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r,i)=> (
              <div key={i} className="bg-white p-8 border border-gray-200">
                <div className="flex gap-1 mb-6">{Array.from({length:r.rating}).map((_,j)=><Star key={j} />)}</div>
                <p className="text-gray-600 text-base leading-relaxed font-serif italic mb-8">"{r.text}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="font-medium text-[#1A1A2E] text-sm uppercase tracking-wider">{r.name}</div>
                  <div className="w-1 h-1 bg-[#C8C8D4] rounded-full"></div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">{r.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#1A1A2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250px_250px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Require a Consultation?</h2>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light">Access our network of distinguished specialists and secure your appointment with confidence.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-4 bg-[#C8C8D4] text-[#1A1A2E] text-sm tracking-widest uppercase font-bold hover:bg-white transition-colors">Access Directory</button>
            <button className="px-10 py-4 border border-[#C8C8D4]/30 text-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors">Physician Portal</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-4">
              <span className="text-2xl font-serif font-bold text-[#1A1A2E] tracking-wide uppercase mb-6 block">EGY <span className="text-gray-400">Doctors</span></span>
              <p className="text-sm text-gray-500 leading-relaxed font-light mb-8 max-w-sm">
                Curating excellence in Egyptian healthcare through meticulous verification and a seamless patient experience.
              </p>
            </div>
            <div className="md:col-span-2 md:col-start-7">
              <h4 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-widest mb-6">Patients</h4>
              <ul className="space-y-4">
                {["Directory","Appointments","Specialties","Insurance"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#1A1A2E] cursor-pointer transition-colors font-light">{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-widest mb-6">Physicians</h4>
              <ul className="space-y-4">
                {["Partnership","Portal","Guidelines","Contact"].map(item=> (
                  <li key={item}><span className="text-sm text-gray-500 hover:text-[#1A1A2E] cursor-pointer transition-colors font-light">{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-widest mb-6">Institution</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-light">
                <li>+20 1 234 5678</li>
                <li>contact@egydoctors.com</li>
                <li>Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest">&copy; 2025 EGY Doctors. All rights reserved.</p>
            <div className="flex gap-8 text-xs text-gray-400 uppercase tracking-widest">
              <span className="hover:text-[#1A1A2E] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#1A1A2E] cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
