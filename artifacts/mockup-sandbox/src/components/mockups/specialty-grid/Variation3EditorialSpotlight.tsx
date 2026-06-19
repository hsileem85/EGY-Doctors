import {
  Heart, Brain, Microscope, Stethoscope, Bone, Sparkles, Flower2, Eye,
  Droplets, Activity, Baby, Smile, Pill, FlaskConical, Wind, Scan,
  ArrowRight, TrendingUp, type LucideIcon,
} from "lucide-react";

const HERO: { name: string; icon: LucideIcon; count: number; tag: string; desc: string; color: string; glow: string }[] = [
  {
    name: "General Medicine", icon: Stethoscope, count: 55, tag: "Most Popular",
    desc: "Your first stop for any health concern — from fever to chronic conditions.",
    color: "from-[#D4A853]/20 to-[#D4A853]/5", glow: "shadow-[#D4A853]/15",
  },
  {
    name: "Cardiology", icon: Heart, count: 38, tag: "High Demand",
    desc: "Egypt's leading heart specialists, available for urgent and routine consultations.",
    color: "from-rose-500/15 to-rose-500/5", glow: "shadow-rose-500/10",
  },
  {
    name: "Dentistry", icon: Smile, count: 41, tag: "Top Rated",
    desc: "From routine cleanings to complex procedures — verified dental surgeons.",
    color: "from-sky-500/15 to-sky-500/5", glow: "shadow-sky-500/10",
  },
];

const REST: { name: string; icon: LucideIcon; count: number }[] = [
  { name: "Dermatology",      icon: Sparkles,     count: 31 },
  { name: "Pediatrics",       icon: Baby,         count: 27 },
  { name: "Neurology",        icon: Brain,        count: 24 },
  { name: "Gynecology",       icon: Flower2,      count: 22 },
  { name: "Orthopedics",      icon: Bone,         count: 19 },
  { name: "Gastroenterology", icon: Activity,     count: 18 },
  { name: "Radiology",        icon: Scan,         count: 16 },
  { name: "Ophthalmology",    icon: Eye,          count: 15 },
  { name: "Psychiatry",       icon: Pill,         count: 14 },
  { name: "Endocrinology",    icon: FlaskConical, count: 13 },
  { name: "Urology",          icon: Droplets,     count: 11 },
  { name: "Pulmonology",      icon: Wind,         count: 9  },
  { name: "Oncology",         icon: Microscope,   count: 8  },
];

export function Variation3EditorialSpotlight() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#D4A853]" />
              <p className="text-[#D4A853] text-[10px] font-black uppercase tracking-widest">Most Sought-After</p>
            </div>
            <h2 className="text-xl font-black text-white">Browse by Specialty</h2>
          </div>
          <button className="text-xs font-semibold text-slate-400 hover:text-[#D4A853] transition-colors">
            All 16 specialties →
          </button>
        </div>

        {/* Hero trio */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {HERO.map((sp) => {
            const Icon = sp.icon;
            return (
              <button
                key={sp.name}
                className={`group relative rounded-2xl p-5 flex flex-col gap-3 text-left bg-gradient-to-br ${sp.color} border border-white/8 hover:border-[#D4A853]/40 shadow-xl ${sp.glow} hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                {/* Background number watermark */}
                <div className="absolute -right-2 -bottom-4 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                  {sp.count}
                </div>

                {/* Tag */}
                <span className="self-start text-[9px] font-black uppercase tracking-widest text-[#D4A853] bg-[#D4A853]/10 px-2 py-0.5 rounded-full border border-[#D4A853]/20">
                  {sp.tag}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#D4A853]" />
                </div>

                {/* Name + count */}
                <div>
                  <p className="text-base font-black text-white leading-tight">{sp.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sp.desc}</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-[#D4A853]">{sp.count} doctors</span>
                  <div className="w-6 h-6 rounded-full bg-[#D4A853]/15 flex items-center justify-center group-hover:bg-[#D4A853]/30 transition-colors">
                    <ArrowRight className="w-3 h-3 text-[#D4A853]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact list — rest of specialties */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">More Specialties</p>
            <p className="text-[10px] text-slate-600">{REST.length} available</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[0, 1, 2].map((col) => (
              <div key={col} className="divide-y divide-white/5">
                {REST.filter((_, i) => i % 3 === col).map((sp) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={sp.name}
                      className="group w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#D4A853]/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D4A853] transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors flex-1">{sp.name}</span>
                      <span className="text-[10px] text-slate-600 shrink-0">{sp.count}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
