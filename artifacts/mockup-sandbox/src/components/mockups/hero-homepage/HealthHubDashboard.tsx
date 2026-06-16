import React from "react";
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

const specialties = ["Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics", "Ophthalmology"];
const locations = ["New Cairo", "Zamalek", "Maadi", "Heliopolis", "Dokki", "Nasr City"];

const articles = [
  {
    id: 1,
    title: "10 Essential Screenings Every Adult Should Consider",
    category: "Preventive Care",
    date: "Oct 24, 2024",
    readTime: "6 min read",
    image: "/__mockup/images/health-article-1.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "The Impact of Sleep on Heart Health",
    category: "Cardiology",
    date: "Oct 22, 2024",
    readTime: "4 min read",
    image: "/__mockup/images/health-article-2.jpg",
  },
  {
    id: 3,
    title: "Managing Seasonal Allergies in Cairo",
    category: "Wellness",
    date: "Oct 20, 2024",
    readTime: "5 min read",
    image: "/__mockup/images/health-article-3.jpg",
  }
];

function Star() {
  return (
    <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function HealthHubDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar - Editorial Style */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">HealthHub</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <span className="text-sm font-semibold text-slate-900 border-b-2 border-blue-600 py-5">Magazine</span>
              <span className="text-sm font-medium text-slate-600 hover:text-slate-900 py-5 cursor-pointer">Find a Doctor</span>
              <span className="text-sm font-medium text-slate-600 hover:text-slate-900 py-5 cursor-pointer">Medical Guides</span>
              <span className="text-sm font-medium text-slate-600 hover:text-slate-900 py-5 cursor-pointer">Hospitals</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">EN / AR</button>
            <div className="h-4 w-px bg-slate-200"></div>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        
        {/* Top Section: Magazine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left: Featured Article */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer bg-slate-200">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200&h=900" alt="Featured health article" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded mb-3">Preventive Care</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors">
                  {articles[0].title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span>{articles[0].date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>{articles[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Secondary Articles */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex-1 flex flex-col gap-4 group cursor-pointer">
              <div className="aspect-[3/2] rounded-xl overflow-hidden bg-slate-200">
                <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600&h=400" alt="Article 2" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 block">Cardiology</span>
                <h3 className="text-lg font-bold leading-snug mb-1 group-hover:text-blue-600 transition-colors">{articles[1].title}</h3>
                <span className="text-xs text-slate-500">{articles[1].readTime}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 group cursor-pointer">
              <div className="aspect-[3/2] rounded-xl overflow-hidden bg-slate-200">
                <img src="https://images.unsplash.com/photo-1584308666744-24d5e4b9a3dc?auto=format&fit=crop&q=80&w=600&h=400" alt="Article 3" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1 block">Wellness</span>
                <h3 className="text-lg font-bold leading-snug mb-1 group-hover:text-blue-600 transition-colors">{articles[2].title}</h3>
                <span className="text-xs text-slate-500">{articles[2].readTime}</span>
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Book a Doctor</h2>
                <p className="text-sm text-slate-500">Find the right specialist and book instantly.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Search Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input type="text" placeholder="e.g. Dr. Ahmed" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Specialty</label>
                  <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                    <option value="">Select Specialty</option>
                    {specialties.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</label>
                  <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                    <option value="">Choose Area</option>
                    {locations.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors mt-2">
                  Find Doctors
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-12"></div>

        {/* Trending Topics / Specialties */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Trending Health Topics</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Topics &rarr;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Heart Health", count: "124 Articles", color: "bg-rose-50 text-rose-700" },
              { name: "Mental Wellness", count: "86 Articles", color: "bg-indigo-50 text-indigo-700" },
              { name: "Skin Care", count: "64 Articles", color: "bg-amber-50 text-amber-700" },
              { name: "Pediatrics", count: "92 Articles", color: "bg-emerald-50 text-emerald-700" },
              { name: "Nutrition", count: "156 Articles", color: "bg-orange-50 text-orange-700" },
              { name: "Fitness", count: "108 Articles", color: "bg-cyan-50 text-cyan-700" },
            ].map((topic, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 rounded-lg ${topic.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{topic.name}</h3>
                <p className="text-xs text-slate-500">{topic.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Experts Directory */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect with Top Experts</h2>
              <p className="text-slate-500 text-sm">Highly rated specialists available for booking today.</p>
            </div>
            <button className="text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50">
              Browse Directory
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex gap-4 hover:shadow-md transition-shadow">
                <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-full object-cover border border-slate-100" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{doctor.fee} EGP</span>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-2">{doctor.specialty}</p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star />
                    <span className="text-sm font-bold text-slate-700">{doctor.rating}</span>
                    <span className="text-xs text-slate-400">({doctor.reviews})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{doctor.location}</span>
                  </div>
                  <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors">
                    View Profile & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      
      {/* Editorial Footer */}
      <footer className="bg-slate-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">HealthHub</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">Egypt's premier destination for health insights, medical guides, and expert doctor bookings.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer">
                <span className="text-xs font-bold">FB</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer">
                <span className="text-xs font-bold">IG</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer">
                <span className="text-xs font-bold">X</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-blue-400">Health Articles</a></li>
              <li><a href="#" className="hover:text-blue-400">Find a Doctor</a></li>
              <li><a href="#" className="hover:text-blue-400">Medical Centers</a></li>
              <li><a href="#" className="hover:text-blue-400">Patient Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get the latest health tips delivered weekly.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 flex-1 w-0" />
              <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-500">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
