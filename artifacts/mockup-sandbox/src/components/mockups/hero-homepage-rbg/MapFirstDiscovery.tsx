import { useState } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Filter,
  Star,
  Clock,
  ChevronRight,
  Stethoscope,
  Heart,
  Activity,
} from "lucide-react";
import "./_group.css";

const NAVY = "#0F172A";
const GOLD = "#D4A853";
const LIGHT_BG = "#F8FAFC";
const SECONDARY = "#1E293B";
const BORDER = "#334155";

const doctors = [
  {
    id: "1",
    name: "Dr. Ahmed Youssef",
    specialty: "Cardiology",
    location: "New Cairo",
    distance: "1.2 km",
    fee: 450,
    bio: "Senior Consultant Cardiologist specializing in heart failure.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "2",
    name: "Dr. Sara Mahmoud",
    specialty: "Dermatology",
    location: "Zamalek",
    distance: "3.5 km",
    fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.8,
    reviews: 96,
  },
  {
    id: "3",
    name: "Dr. Kareem Hassan",
    specialty: "Orthopedics",
    location: "Maadi",
    distance: "4.8 km",
    fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    rating: 4.9,
    reviews: 154,
  },
  {
    id: "4",
    name: "Dr. Mona El-Sayed",
    specialty: "Pediatrics",
    location: "Heliopolis",
    distance: "5.1 km",
    fee: 300,
    bio: "Pediatric consultant with a focus on child development.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4.7,
    reviews: 210,
  },
];

const neighborhoods = [
  { name: "New Cairo", count: 450, popular: ["Cardiology", "Dentistry"] },
  { name: "Maadi", count: 320, popular: ["Pediatrics", "Orthopedics"] },
  { name: "Zamalek", count: 180, popular: ["Dermatology", "Psychiatry"] },
  {
    name: "Heliopolis",
    count: 510,
    popular: ["Internal Medicine", "Ophthalmology"],
  },
];

function StarIcon() {
  return (
    <svg
      className="w-4 h-4 fill-current"
      style={{ color: GOLD }}
      viewBox="0 0 24 24"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function MapFirstDiscovery() {
  const [activePin, setActivePin] = useState<string | null>("1");

  return (
    <div
      className="min-h-screen bg-white font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: NAVY }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              EGY<span style={{ color: GOLD }}>Doctors</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium" style={{ color: NAVY }}>
              Map View
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Specialties
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Hospitals
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
              EN / AR
            </button>
            <button
              className="text-sm font-semibold text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors shadow-sm"
              style={{ backgroundColor: NAVY }}
            >
              Log In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - Map Dominant */}
      <section
        className="relative h-[65vh] min-h-[500px] overflow-hidden flex flex-col justify-end"
        style={{ backgroundColor: "#E2E8F0" }}
      >
        {/* Abstract Map Background */}
        <div className="absolute inset-0 z-0">
          <svg
            className="absolute w-full h-full opacity-[0.12]"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={NAVY}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
              d="M -100 200 Q 300 400 600 100 T 1200 300"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="12"
            />
            <path
              d="M 200 -100 Q 400 300 300 600 T 500 1000"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="8"
            />
          </svg>
        </div>

        {/* Map Pins */}
        <div className="absolute z-10 top-1/3 left-1/4 animate-bounce">
          <div className="relative">
            <MapPin className="w-8 h-8 fill-current" style={{ color: GOLD }} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full blur-[2px]"></div>
          </div>
        </div>
        <div className="absolute z-10 top-1/2 left-2/3">
          <div
            className="relative cursor-pointer group"
            onClick={() => setActivePin("1")}
          >
            <MapPin
              className={`w-10 h-10 transition-transform drop-shadow-md ${activePin === "1" ? "text-[#0F172A] fill-[#0F172A] scale-110" : "fill-white"}`}
              style={{ color: activePin === "1" ? NAVY : GOLD }}
            />
            {activePin === "1" && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl p-3 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={doctors[0].image}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">
                      {doctors[0].name}
                    </h4>
                    <p className="text-xs font-medium" style={{ color: GOLD }}>
                      {doctors[0].specialty}
                    </p>
                  </div>
                </div>
                <button
                  className="w-full py-1.5 text-white text-xs font-semibold rounded-lg"
                  style={{ backgroundColor: NAVY }}
                >
                  Book - {doctors[0].distance}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute z-10 top-1/4 right-1/4">
          <MapPin className="w-6 h-6 text-slate-400 fill-white drop-shadow-sm" />
        </div>

        {/* Gradient Fade to Content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>

        {/* Floating Search Container */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 w-full pb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100 backdrop-blur-xl bg-white/95">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-6 text-center tracking-tight"
              style={{ color: NAVY }}
            >
              Find doctors <span style={{ color: GOLD }}>near you</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Current Location (e.g. New Cairo)"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D4A853]/30 transition-all outline-none"
                  style={{ borderColor: GOLD }}
                  defaultValue="New Cairo, Egypt"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Specialty, Doctor Name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D4A853]/30 transition-all outline-none"
                />
              </div>
              <button
                className="text-white px-8 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-colors shadow-lg flex items-center justify-center gap-2 shrink-0"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide text-sm">
              <span className="text-gray-500 font-medium shrink-0">
                Popular nearby:
              </span>
              <button className="shrink-0 px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors bg-white font-medium">
                Cardiology
              </button>
              <button className="shrink-0 px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors bg-white font-medium">
                Dentistry
              </button>
              <button className="shrink-0 px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors bg-white font-medium">
                Dermatology
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Nearby Doctors */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: NAVY }}>
                Available Near You
              </h2>
              <p className="text-gray-500 mt-1">
                Found 124 doctors within 5km of New Cairo
              </p>
            </div>
            <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group"
              >
                <div className="relative shrink-0">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <div
                      className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                      style={{ backgroundColor: "#FEF3C7", color: NAVY }}
                    >
                      <StarIcon />
                      {doc.rating}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3
                        className="text-lg font-bold text-gray-900 leading-tight group-hover:transition-colors"
                        style={{ color: NAVY }}
                      >
                        {doc.name}
                      </h3>
                      <p
                        className="font-medium text-sm"
                        style={{ color: GOLD }}
                      >
                        {doc.specialty}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {doc.fee} EGP
                      </div>
                      <div className="text-xs text-gray-500">Consultation</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {doc.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {doc.distance} away{" "}
                      <span className="text-gray-400 font-normal">
                        in {doc.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Available Today
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col justify-end">
                  <button
                    className="w-full sm:w-auto text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: NAVY }}
                  >
                    Book Visit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-600 font-semibold hover:border-gray-300 hover:bg-white transition-colors">
            Load More Doctors
          </button>
        </div>

        {/* Right Column - Neighborhood Clusters */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3
              className="text-lg font-bold mb-6 flex items-center gap-2"
              style={{ color: NAVY }}
            >
              <Navigation className="w-5 h-5" style={{ color: GOLD }} />
              Explore Areas
            </h3>

            <div className="space-y-4">
              {neighborhoods.map((n, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-bold text-gray-800 group-hover:transition-colors"
                      style={{ color: NAVY }}
                    >
                      {n.name}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: "#FEF3C7", color: NAVY }}
                    >
                      {n.count} doctors
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {n.popular.map((p) => (
                      <span
                        key={p}
                        className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  {i < neighborhoods.length - 1 && (
                    <div className="h-px bg-gray-100 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Map Promo Box */}
          <div
            className="rounded-3xl p-6 relative overflow-hidden text-white shadow-xl"
            style={{ backgroundColor: NAVY }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"
              style={{ backgroundColor: GOLD }}
            ></div>
            <MapPin className="w-8 h-8 mb-4" style={{ color: GOLD }} />
            <h3 className="text-xl font-bold mb-2">Use the Interactive Map</h3>
            <p className="text-gray-400 text-sm mb-6">
              Draw a search area on the map to find doctors exactly where you
              want them.
            </p>
            <button
              className="w-full bg-white py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              style={{ color: NAVY }}
            >
              Open Full Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
