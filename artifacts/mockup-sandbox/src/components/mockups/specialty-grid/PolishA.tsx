import {
  Brain, Heart, Eye, Smile, Bone, Sparkles, Baby, Microscope,
  Stethoscope, Wind, FlaskConical, Pill, Flower2, Droplets, Activity, Scan,
  ChevronRight, type LucideIcon,
} from "lucide-react";

const SPECIALTIES: { name: string; icon: LucideIcon; count: number }[] = [
  { name: "Cardiology",       icon: Heart,        count: 38 },
  { name: "Neurology",        icon: Brain,        count: 24 },
  { name: "Dermatology",      icon: Sparkles,     count: 31 },
  { name: "Orthopedics",      icon: Bone,         count: 19 },
  { name: "Ophthalmology",    icon: Eye,          count: 15 },
  { name: "Pediatrics",       icon: Baby,         count: 27 },
  { name: "Gynecology",       icon: Flower2,      count: 22 },
  { name: "Psychiatry",       icon: Pill,         count: 14 },
  { name: "Urology",          icon: Droplets,     count: 11 },
  { name: "Gastroenterology", icon: Activity,     count: 18 },
  { name: "Pulmonology",      icon: Wind,         count: 9  },
  { name: "Endocrinology",    icon: FlaskConical, count: 13 },
  { name: "Oncology",         icon: Microscope,   count: 8  },
  { name: "Radiology",        icon: Scan,         count: 16 },
  { name: "Dentistry",        icon: Smile,        count: 41 },
  { name: "General Medicine", icon: Stethoscope,  count: 55 },
];

export function PolishA() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden">

        {/* Header — tighter, more confident */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-px w-5 bg-[#D4A853]" />
              <p className="text-[#D4A853] text-[10px] font-black uppercase tracking-[0.2em]">Medical Specialties</p>
            </div>
            <h2 className="text-[22px] font-black text-white leading-tight tracking-tight">Browse by Specialty</h2>
            <p className="text-slate-500 text-xs mt-1">Find the right expert for your health needs</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-[#D4A853] border border-[#D4A853]/30 hover:border-[#D4A853] rounded-full px-4 py-2 transition-all duration-200 hover:bg-[#D4A853]/5">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thin gold rule */}
        <div className="mx-8 h-px bg-gradient-to-r from-[#D4A853]/40 via-[#D4A853]/10 to-transparent mb-5" />

        {/* Unified 4-column grid — no arbitrary split, all consistent */}
        <div className="px-8 pb-7">
          <div className="grid grid-cols-4 gap-2.5">
            {SPECIALTIES.map((sp, i) => {
              const Icon = sp.icon;
              return (
                <button
                  key={sp.name}
                  className="group relative rounded-xl p-3.5 flex items-start gap-3 text-left transition-all duration-200 border border-white/[0.06] bg-white/[0.04] hover:bg-[#D4A853]/8 hover:border-[#D4A853]/35 hover:-translate-y-px hover:shadow-lg hover:shadow-[#D4A853]/8"
                >
                  {/* Circular icon — feels more refined than square */}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-[#D4A853]/12 flex items-center justify-center transition-all duration-200 group-hover:bg-[#D4A853]/22 mt-0.5">
                    <Icon className="w-4 h-4 text-[#D4A853]" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white leading-snug truncate">{sp.name}</p>
                    {/* Count as a more readable small badge */}
                    <span className="inline-block mt-1 text-[10px] font-semibold text-[#D4A853]/70 bg-[#D4A853]/8 rounded-full px-1.5 py-px">
                      {sp.count} doctors
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
