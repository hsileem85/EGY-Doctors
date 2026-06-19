import { useState } from "react";
import {
  Brain, Heart, Eye, Smile, Bone, Sparkles, Baby, Microscope,
  Stethoscope, Wind, FlaskConical, Pill, Flower2, Droplets, Activity, Scan,
  type LucideIcon,
} from "lucide-react";

const PRIMARY: { name: string; icon: LucideIcon; count: number }[] = [
  { name: "Cardiology",    icon: Heart,    count: 38 },
  { name: "Neurology",     icon: Brain,    count: 24 },
  { name: "Dermatology",   icon: Sparkles, count: 31 },
  { name: "Orthopedics",   icon: Bone,     count: 19 },
  { name: "Pediatrics",    icon: Baby,     count: 27 },
  { name: "Gynecology",    icon: Flower2,  count: 22 },
  { name: "Ophthalmology", icon: Eye,      count: 15 },
  { name: "Dentistry",     icon: Smile,    count: 41 },
];

const SECONDARY: { name: string; icon: LucideIcon; count: number }[] = [
  { name: "General Medicine", icon: Stethoscope,  count: 55 },
  { name: "Gastroenterology", icon: Activity,     count: 18 },
  { name: "Psychiatry",       icon: Pill,         count: 14 },
  { name: "Urology",          icon: Droplets,     count: 11 },
  { name: "Pulmonology",      icon: Wind,         count: 9  },
  { name: "Endocrinology",    icon: FlaskConical, count: 13 },
  { name: "Radiology",        icon: Scan,         count: 16 },
  { name: "Oncology",         icon: Microscope,   count: 8  },
];

function PrimaryCard({ sp }: { sp: typeof PRIMARY[number] }) {
  const Icon = sp.icon;
  return (
    <button className="group relative rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-250 border border-white/8 bg-[#1A2744] hover:bg-[#1E2F56] hover:border-[#D4A853]/45 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4A853]/10 overflow-hidden">
      {/* Subtle corner glow on hover */}
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-[#D4A853]/0 group-hover:bg-[#D4A853]/8 transition-all duration-400 blur-xl" />

      {/* Icon — square with slight rounding, gold gradient bg */}
      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#D4A853]/25 to-[#D4A853]/10 flex items-center justify-center transition-all duration-250 group-hover:from-[#D4A853]/35 group-hover:to-[#D4A853]/15 border border-[#D4A853]/15">
        <Icon className="w-5 h-5 text-[#D4A853]" />
      </div>

      <div>
        <p className="text-sm font-bold text-white leading-snug">{sp.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
          <span className="text-[11px] font-semibold text-[#D4A853]/80">{sp.count} doctors</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/0 group-hover:via-[#D4A853]/50 to-transparent transition-all duration-400" />
    </button>
  );
}

function SecondaryCard({ sp }: { sp: typeof SECONDARY[number] }) {
  const Icon = sp.icon;
  return (
    <button className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.025] hover:bg-[#D4A853]/7 hover:border-[#D4A853]/30 transition-all duration-200 text-left">
      <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0 group-hover:bg-[#D4A853]/15 transition-colors duration-200">
        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D4A853] transition-colors duration-200" />
      </div>
      <span className="text-[13px] font-semibold text-slate-300 group-hover:text-white transition-colors duration-200 flex-1">{sp.name}</span>
      <span className="text-[11px] text-slate-600 group-hover:text-[#D4A853]/60 transition-colors duration-200 shrink-0">{sp.count}</span>
    </button>
  );
}

export function PolishB() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5">
          <div>
            <p className="text-[#D4A853] text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Medical Specialties</p>
            <h2 className="text-[22px] font-black text-white leading-tight tracking-tight">Browse by Specialty</h2>
            <p className="text-slate-500 text-xs mt-1">Find the right expert for your health needs</p>
          </div>
          <button className="text-xs font-bold text-[#D4A853] border border-[#D4A853]/35 hover:border-[#D4A853] rounded-full px-4 py-2 transition-all duration-200 hover:bg-[#D4A853]/5">
            View all →
          </button>
        </div>

        <div className="px-8 pb-7 flex flex-col gap-4">

          {/* Primary row — explicitly labeled */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A853]">Most Searched</p>
              <div className="h-px flex-1 bg-[#D4A853]/15" />
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {PRIMARY.map(sp => <PrimaryCard key={sp.name} sp={sp} />)}
            </div>
          </div>

          {/* Secondary block — explicitly labeled */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">More Specialties</p>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SECONDARY.map(sp => <SecondaryCard key={sp.name} sp={sp} />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
