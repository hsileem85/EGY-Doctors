import { MapPin, Phone, Star, Award } from "lucide-react";

const doctors = [
  { name: "Dr. Ahmed Youssef", specialty: "Cardiology", rating: 4.9, reviews: 128, fee: 400, initials: "AY", clinics: [{ id: 1, location: "Maadi", phone: "01012345678" }, { id: 2, location: "Heliopolis", phone: "" }] },
  { name: "Dr. Sara Nasser", specialty: "Dermatology", rating: 4.8, reviews: 94, fee: 350, initials: "SN", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] },
];

export function VariantC() {
  return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-3">
        {doctors.map((d, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">

            {/* Top row */}
            <div className="flex items-center gap-4 px-5 pt-4 pb-3">

              {/* Avatar with specialty overlay */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-base shadow-lg">
                  {d.initials}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#D4A853] rounded-full px-2 py-0.5 flex items-center gap-0.5 shadow whitespace-nowrap">
                  <Star className="w-2.5 h-2.5 fill-white text-white" />
                  <span className="text-[9px] font-black text-white">{d.rating}</span>
                </div>
              </div>

              {/* Name + specialty */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
                  <Award className="w-3.5 h-3.5 text-[#D4A853] shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{d.specialty} · {d.reviews} reviews</p>

                {/* Clinic pills inline */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {d.clinics.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-500 rounded-full px-1.5 py-px text-[9px] font-medium">
                      <MapPin className="w-2 h-2 shrink-0" />{c.location}
                      {c.phone && <Phone className="w-2 h-2 ml-0.5 text-green-500" />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 font-medium">Consultation</p>
                <p className="text-xl font-black text-slate-900 leading-tight">{d.fee}</p>
                <p className="text-[10px] text-slate-400 -mt-0.5">EGP</p>
              </div>

            </div>

            {/* Divider + action row */}
            <div className="border-t border-slate-50 flex">
              <button className="flex-1 py-2.5 text-xs text-slate-500 font-semibold hover:bg-slate-50 transition-colors">
                View Profile
              </button>
              <div className="w-px bg-slate-100" />
              <button className="flex-1 py-2.5 text-xs text-white font-bold bg-[#0F172A] hover:bg-slate-700 transition-colors">
                Book Appointment
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
