import { MapPin, Phone, Star, HeartPulse } from "lucide-react";

const doc = {
  name: "Dr. Ahmed Youssef",
  specialty: "Cardiology",
  rating: 4.9,
  fee: 400,
  initials: "AY",
  clinics: [
    { id: 1, location: "Maadi", phone: "01012345678" },
    { id: 2, location: "Heliopolis", phone: "" },
  ],
};

export function VariantA() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-3">
        {[doc, { ...doc, name: "Dr. Sara Nasser", specialty: "Dermatology", fee: 350, rating: 4.8, initials: "SN", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] }].map((d, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all px-5 py-4 flex items-center gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white font-bold text-base shadow-md">
                {d.initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full px-1.5 py-0.5 shadow border border-slate-100 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-slate-800">{d.rating}</span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex flex-col justify-between min-w-0 flex-1 gap-1.5">
              <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
              <span className="inline-flex items-center gap-1 self-start bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                <HeartPulse className="w-2.5 h-2.5 shrink-0" />
                {d.specialty}
              </span>
            </div>

            {/* Clinics */}
            <div className="flex flex-col gap-1 shrink-0">
              {d.clinics.map((c) => (
                <div key={c.id} className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-500 rounded-full px-1.5 py-px text-[9px] font-medium">
                    <MapPin className="w-2 h-2 shrink-0" />{c.location}
                  </span>
                  {c.phone && (
                    <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-400 rounded-full px-1.5 py-px text-[9px] font-medium">
                      <Phone className="w-2 h-2 shrink-0" />
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Price + Actions */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 ml-2">
              <div className="text-center">
                <span className="text-base font-bold text-slate-900">{d.fee}</span>
                <span className="text-[10px] text-slate-400 ml-0.5">EGP</span>
              </div>
              <button className="w-24 bg-[#0F172A] text-white rounded-xl text-xs font-semibold py-1.5 hover:bg-slate-700 transition-all">
                Book
              </button>
              <button className="w-24 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold py-1.5 hover:bg-slate-50 transition-all">
                Profile
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
