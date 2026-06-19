import { MapPin, Phone, Star, HeartPulse, CalendarCheck } from "lucide-react";

const doctors = [
  { name: "Dr. Ahmed Youssef", specialty: "Cardiology", rating: 4.9, reviews: 128, fee: 400, initials: "AY", color: "bg-indigo-600", clinics: [{ id: 1, location: "Maadi", phone: "01012345678" }, { id: 2, location: "Heliopolis", phone: "" }] },
  { name: "Dr. Sara Nasser", specialty: "Dermatology", rating: 4.8, reviews: 94, fee: 350, initials: "SN", color: "bg-rose-500", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] },
];

export function VariantB() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-3">
        {doctors.map((d, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex">

            {/* Accent strip */}
            <div className={`w-1.5 shrink-0 ${d.color}`} />

            {/* Card body */}
            <div className="flex items-center gap-4 px-5 py-4 flex-1 min-w-0">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center text-white font-bold text-sm shadow`}>
                  {d.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1 py-0.5 shadow border border-slate-100 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-800">{d.rating}</span>
                </div>
              </div>

              {/* Info block */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        <HeartPulse className="w-2.5 h-2.5" />{d.specialty}
                      </span>
                      <span className="text-[10px] text-slate-400">{d.reviews} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Clinic row */}
                <div className="flex flex-wrap gap-1">
                  {d.clinics.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-500 rounded-full px-1.5 py-px text-[9px] font-medium">
                      <MapPin className="w-2 h-2 shrink-0" />{c.location}
                      {c.phone && <Phone className="w-2 h-2 ml-0.5 text-slate-400" />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{d.fee}</span>
                  <span className="text-[10px] text-slate-400 ml-0.5">EGP</span>
                </div>
                <button className={`inline-flex items-center gap-1.5 ${d.color} text-white rounded-xl text-xs font-bold px-4 py-1.5 hover:opacity-90 transition-all shadow-sm`}>
                  <CalendarCheck className="w-3 h-3" />Book
                </button>
                <button className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors underline-offset-2 hover:underline">
                  View Profile →
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
