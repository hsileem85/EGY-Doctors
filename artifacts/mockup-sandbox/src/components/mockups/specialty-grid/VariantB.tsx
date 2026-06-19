import {
  Brain, Heart, Eye, Smile, Bone, Sparkles, Baby, Microscope,
  Stethoscope, Wind, FlaskConical, Pill, Flower2, Droplets, Activity, Scan,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const SPECIALTIES: { name: string; icon: LucideIcon; count: number; color: string; bg: string }[] = [
  { name: "Cardiology",       icon: Heart,        count: 38, color: "text-rose-500",    bg: "bg-rose-50"    },
  { name: "Neurology",        icon: Brain,        count: 24, color: "text-violet-500",  bg: "bg-violet-50"  },
  { name: "Dermatology",      icon: Sparkles,     count: 31, color: "text-amber-500",   bg: "bg-amber-50"   },
  { name: "Orthopedics",      icon: Bone,         count: 19, color: "text-sky-500",     bg: "bg-sky-50"     },
  { name: "Ophthalmology",    icon: Eye,          count: 15, color: "text-teal-500",    bg: "bg-teal-50"    },
  { name: "Pediatrics",       icon: Baby,         count: 27, color: "text-pink-500",    bg: "bg-pink-50"    },
  { name: "Gynecology",       icon: Flower2,      count: 22, color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
  { name: "Psychiatry",       icon: Pill,         count: 14, color: "text-indigo-500",  bg: "bg-indigo-50"  },
  { name: "Urology",          icon: Droplets,     count: 11, color: "text-blue-500",    bg: "bg-blue-50"    },
  { name: "Gastroenterology", icon: Activity,     count: 18, color: "text-green-500",   bg: "bg-green-50"   },
  { name: "Pulmonology",      icon: Wind,         count: 9,  color: "text-cyan-500",    bg: "bg-cyan-50"    },
  { name: "Endocrinology",    icon: FlaskConical, count: 13, color: "text-orange-500",  bg: "bg-orange-50"  },
  { name: "Oncology",         icon: Microscope,   count: 8,  color: "text-red-500",     bg: "bg-red-50"     },
  { name: "Radiology",        icon: Scan,         count: 16, color: "text-slate-500",   bg: "bg-slate-100"  },
  { name: "Dentistry",        icon: Smile,        count: 41, color: "text-yellow-600",  bg: "bg-yellow-50"  },
  { name: "General Medicine", icon: Stethoscope,  count: 55, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export function VariantB() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 rounded-full bg-[#D4A853]" />
              <p className="text-xs font-bold text-[#D4A853] uppercase tracking-widest">Specialists</p>
            </div>
            <h2 className="text-2xl font-black text-[#0F172A]">Browse by Specialty</h2>
            <p className="text-sm text-slate-500 mt-0.5">2,500+ verified doctors across 16 specialties</p>
          </div>
          <button className="group flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] bg-white border border-slate-200 hover:border-[#D4A853] hover:text-[#D4A853] rounded-full px-4 py-1.5 transition-all duration-200 shadow-sm">
            View all
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-4 gap-3">
          {SPECIALTIES.slice(0, 16).map((sp, idx) => {
            const Icon = sp.icon;
            const maxCount = 55;
            const pct = Math.round((sp.count / maxCount) * 100);
            return (
              <button
                key={sp.name}
                className="group bg-white rounded-2xl p-4 flex flex-col gap-3 text-left border border-slate-100 shadow-sm hover:shadow-md hover:border-[#D4A853]/50 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Top row: icon + badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${sp.bg} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${sp.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-[#8B6914] bg-[#D4A853]/10 px-2 py-0.5 rounded-full">
                    {sp.count}
                  </span>
                </div>

                {/* Name */}
                <p className="text-sm font-bold text-[#0F172A] leading-snug group-hover:text-[#D4A853] transition-colors duration-200">
                  {sp.name}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${idx < 8 ? "bg-[#D4A853]" : "bg-slate-300"} group-hover:bg-[#D4A853]`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom stat strip */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Total Specialists", value: "2,500+" },
            { label: "Specialties Covered", value: "16" },
            { label: "Avg. Wait Time", value: "< 24h" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0F172A] rounded-2xl px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-base font-black text-[#D4A853]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
