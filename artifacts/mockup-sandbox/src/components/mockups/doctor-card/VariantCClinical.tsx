import { MapPin, Phone, Star, ShieldCheck } from "lucide-react";

const doctors = [
  { name: "Dr. Ahmed Youssef", specialty: "Cardiology", rating: 4.9, reviews: 128, fee: 400, initials: "AY", clinics: [{ id: 1, location: "Maadi", phone: "01012345678" }, { id: 2, location: "Heliopolis", phone: "" }] },
  { name: "Dr. Sara Nasser", specialty: "Dermatology", rating: 4.8, reviews: 94, fee: 350, initials: "SN", clinics: [{ id: 3, location: "Zamalek", phone: "01098765432" }] },
];

export function VariantCClinical() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#F0F5FF" }}>
      <div className="w-full max-w-2xl space-y-3">
        {doctors.map((d, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #D6E4F7", boxShadow: "0 1px 8px rgba(30,80,180,0.07)" }}>

            {/* Top row */}
            <div className="flex items-center gap-4 px-5 pt-4 pb-3">

              {/* Avatar — circular, medical blue */}
              <div className="relative shrink-0">
                <div className="w-13 h-13 rounded-full flex items-center justify-center text-white font-bold text-sm shadow" style={{ width: 52, height: 52, background: "#1A56DB" }}>
                  {d.initials}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 whitespace-nowrap" style={{ background: "#1A56DB" }}>
                  <Star className="w-2 h-2 fill-white text-white" />
                  <span className="text-[9px] font-black text-white">{d.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold truncate" style={{ color: "#111827" }}>{d.name}</p>
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#1A56DB" }} />
                </div>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "#6B7280" }}>{d.specialty} · {d.reviews} verified reviews</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {d.clinics.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-px text-[9px] font-medium" style={{ background: "#EFF6FF", color: "#1E4DB7" }}>
                      <MapPin className="w-2 h-2 shrink-0" />{c.location}
                      {c.phone && <Phone className="w-2 h-2 ml-0.5" style={{ color: "#1A56DB" }} />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="text-right shrink-0">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Fee</p>
                <p className="text-xl font-black leading-tight" style={{ color: "#111827" }}>{d.fee}</p>
                <p className="text-[10px] -mt-0.5" style={{ color: "#9CA3AF" }}>EGP</p>
              </div>
            </div>

            {/* Action bar — clean divider, blue CTA */}
            <div className="flex border-t" style={{ borderColor: "#E5EEFF" }}>
              <button className="flex-1 py-2.5 text-xs font-semibold transition-colors hover:opacity-70" style={{ color: "#6B7280" }}>
                View Profile
              </button>
              <div className="w-px" style={{ background: "#E5EEFF" }} />
              <button className="flex-1 py-2.5 text-xs font-bold text-white transition-colors hover:opacity-90" style={{ background: "#1A56DB" }}>
                Book Appointment
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
