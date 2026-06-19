import { MapPin, Phone, Star, Award } from "lucide-react";

const doctors = [
  { name: "Dr. Ahmed Youssef", specialty: "Cardiology", rating: 4.9, reviews: 128, fee: 400, initials: "AY", clinics: [{ id: 1, location: "Maadi", phone: "01012345678" }, { id: 2, location: "Heliopolis", phone: "" }] },
  { name: "Dr. Sara Nasser", specialty: "Dermatology", rating: 4.8, reviews: 94, fee: 350, initials: "SN", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] },
];

export function VariantCWarm() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#FDF6EE" }}>
      <div className="w-full max-w-2xl space-y-3">
        {doctors.map((d, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #F0E4D4", boxShadow: "0 2px 12px rgba(180,120,60,0.08)" }}>
            {/* Top row */}
            <div className="flex items-center gap-4 px-5 pt-4 pb-3">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow" style={{ background: "linear-gradient(135deg, #C2703A, #7A3F1E)" }}>
                  {d.initials}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 flex items-center gap-0.5 shadow whitespace-nowrap" style={{ background: "#E8913A" }}>
                  <Star className="w-2.5 h-2.5 fill-white text-white" />
                  <span className="text-[9px] font-black text-white">{d.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold truncate" style={{ color: "#2D1A0E" }}>{d.name}</p>
                  <Award className="w-3.5 h-3.5 shrink-0" style={{ color: "#E8913A" }} />
                </div>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "#9B7355" }}>{d.specialty} · {d.reviews} reviews</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {d.clinics.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium" style={{ background: "#FDF0E4", color: "#9B7355" }}>
                      <MapPin className="w-2 h-2 shrink-0" />{c.location}
                      {c.phone && <Phone className="w-2 h-2 ml-0.5" style={{ color: "#C2703A" }} />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium" style={{ color: "#B8956A" }}>Consultation</p>
                <p className="text-xl font-black leading-tight" style={{ color: "#2D1A0E" }}>{d.fee}</p>
                <p className="text-[10px] -mt-0.5" style={{ color: "#B8956A" }}>EGP</p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex border-t" style={{ borderColor: "#F0E4D4" }}>
              <button className="flex-1 py-2.5 text-xs font-semibold transition-colors hover:opacity-80" style={{ color: "#9B7355" }}>
                View Profile
              </button>
              <div className="w-px" style={{ background: "#F0E4D4" }} />
              <button className="flex-1 py-2.5 text-xs font-bold text-white transition-colors hover:opacity-90" style={{ background: "linear-gradient(135deg, #C2703A, #7A3F1E)" }}>
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
