import {
  Brain, Heart, Eye, Smile, Bone, Sparkles, Baby, Microscope,
  Stethoscope, Wind, FlaskConical, Pill, Flower2, Droplets, Activity, Scan,
  type LucideIcon,
} from "lucide-react";

const SPECIALTIES: { name: string; icon: LucideIcon; count: number }[] = [
  { name: "Cardiology",      icon: Heart,        count: 38 },
  { name: "Neurology",       icon: Brain,        count: 24 },
  { name: "Dermatology",     icon: Sparkles,     count: 31 },
  { name: "Orthopedics",     icon: Bone,         count: 19 },
  { name: "Ophthalmology",   icon: Eye,          count: 15 },
  { name: "Pediatrics",      icon: Baby,         count: 27 },
  { name: "Gynecology",      icon: Flower2,      count: 22 },
  { name: "Psychiatry",      icon: Pill,         count: 14 },
  { name: "Urology",         icon: Droplets,     count: 11 },
  { name: "Gastroenterology",icon: Activity,     count: 18 },
  { name: "Pulmonology",     icon: Wind,         count: 9  },
  { name: "Endocrinology",   icon: FlaskConical, count: 13 },
  { name: "Oncology",        icon: Microscope,   count: 8  },
  { name: "Radiology",       icon: Scan,         count: 16 },
  { name: "Dentistry",       icon: Smile,        count: 41 },
  { name: "General Medicine",icon: Stethoscope,  count: 55 },
];

export function VariantA() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6">
      {/* Section */}
      <div className="w-full max-w-5xl bg-[#0F172A] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-end justify-between px-8 pt-8 pb-6 border-b border-white/10">
          <div>
            <p className="text-[#D4A853] text-xs font-bold uppercase tracking-widest mb-1">Medical Specialties</p>
            <h2 className="text-2xl font-black text-white leading-tight">Browse by Specialty</h2>
            <p className="text-slate-400 text-sm mt-1">Find the right expert for your health needs</p>
          </div>
          <button className="text-sm font-semibold text-[#D4A853] hover:text-white transition-colors border border-[#D4A853]/40 hover:border-[#D4A853] rounded-full px-4 py-1.5">
            View all →
          </button>
        </div>

        {/* Scrollable grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-3">
            {SPECIALTIES.slice(0, 8).map((sp) => {
              const Icon = sp.icon;
              return (
                <button
                  key={sp.name}
                  className="group relative rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-300 border border-white/5 bg-white/5 hover:bg-[#D4A853]/10 hover:border-[#D4A853]/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4A853]/10"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4A853]/25">
                    <Icon className="w-5 h-5 text-[#D4A853]" />
                  </div>
                  {/* Name */}
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">{sp.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sp.count} doctors</p>
                  </div>
                  {/* Accent line */}
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-[#D4A853]/0 group-hover:bg-[#D4A853]/40 transition-all duration-300" />
                </button>
              );
            })}
          </div>

          {/* Second row — slightly muted */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            {SPECIALTIES.slice(8, 16).map((sp) => {
              const Icon = sp.icon;
              return (
                <button
                  key={sp.name}
                  className="group relative rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-300 border border-white/5 bg-white/[0.03] hover:bg-[#D4A853]/10 hover:border-[#D4A853]/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4A853]/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4A853]/20">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#D4A853] transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors duration-300 leading-snug">{sp.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sp.count} doctors</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer strip */}
        <div className="px-8 pb-6 flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
            <span>Available specialists</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <span>More coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
