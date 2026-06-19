import { MapPin, Phone, Star, Zap } from "lucide-react";

const doctors = [
  { name: "Dr. Ahmed Youssef", specialty: "Cardiology", rating: 4.9, reviews: 128, fee: 400, initials: "AY", clinics: [{ id: 1, location: "Maadi", phone: "01012345678" }, { id: 2, location: "Heliopolis", phone: "" }] },
  { name: "Dr. Sara Nasser", specialty: "Dermatology", rating: 4.8, reviews: 94, fee: 350, initials: "SN", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] },
];

const specialtyColors: Record<string, { bg: string; text: string; gradient: string }> = {
  Cardiology:   { bg: "#FFF1F0", text: "#E03B3B", gradient: "linear-gradient(135deg, #E03B3B, #9B1515)" },
  Dermatology:  { bg: "#FFF4ED", text: "#D4660D", gradient: "linear-gradient(135deg, #D4660D, #8B3E00)" },
};
const fallback = { bg: "#F0F4FF", text: "#4C63D2", gradient: "linear-gradient(135deg, #4C63D2, #2D3A9E)" };

export function VariantCPlayful() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#F7F7FB" }}>
      <div className="w-full max-w-2xl space-y-3">
        {doctors.map((d, i) => {
          const colors = specialtyColors[d.specialty] ?? fallback;
          return (
            <div key={i} className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #EBEBF5", boxShadow: "0 4px 20px rgba(80,60,160,0.09)" }}>

              {/* Top row */}
              <div className="flex items-center gap-4 px-5 pt-5 pb-3">

                {/* Avatar with gradient ring */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base" style={{ background: colors.gradient, boxShadow: `0 4px 14px ${colors.text}44` }}>
                    {d.initials}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 flex items-center gap-0.5 whitespace-nowrap" style={{ background: "#FFD700", boxShadow: "0 2px 6px #FFD70066" }}>
                    <Star className="w-2.5 h-2.5 fill-white text-white" />
                    <span className="text-[9px] font-black" style={{ color: "#7A5C00" }}>{d.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-extrabold truncate" style={{ color: "#18182A" }}>{d.name}</p>
                    <Zap className="w-3 h-3 shrink-0" style={{ color: colors.text }} />
                  </div>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#6B6B8A" }}>{d.specialty} · {d.reviews} reviews</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {d.clinics.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold" style={{ background: colors.bg, color: colors.text }}>
                        <MapPin className="w-2 h-2 shrink-0" />{c.location}
                        {c.phone && <Phone className="w-2 h-2 ml-0.5" />}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fee */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#ABABC4" }}>Fee</p>
                  <p className="text-2xl font-black leading-tight" style={{ color: "#18182A" }}>{d.fee}</p>
                  <p className="text-[10px] -mt-0.5 font-semibold" style={{ color: "#ABABC4" }}>EGP</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex mx-4 mb-4 gap-2 mt-1">
                <button className="flex-1 py-2 text-xs font-bold rounded-xl transition-all hover:opacity-80" style={{ background: "#F0EFF8", color: "#4C4C72" }}>
                  View Profile
                </button>
                <button className="flex-[2] py-2 text-xs font-black text-white rounded-xl transition-all hover:opacity-90" style={{ background: colors.gradient, boxShadow: `0 4px 12px ${colors.text}44` }}>
                  Book Appointment
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
