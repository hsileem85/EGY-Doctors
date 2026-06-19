import { useState } from "react";
import {
  Heart, Brain, Microscope, Stethoscope, Bone, Sparkles, Flower2, Eye,
  Droplets, Activity, Baby, Smile, Pill, FlaskConical, Wind, Scan,
  type LucideIcon,
} from "lucide-react";

const SYMPTOMS: { label: string; emoji: string; specialties: string[] }[] = [
  { label: "Chest & Heart",   emoji: "❤️", specialties: ["Cardiology", "Pulmonology", "General Medicine"] },
  { label: "Skin Issues",     emoji: "✨", specialties: ["Dermatology"] },
  { label: "Child Health",    emoji: "🍼", specialties: ["Pediatrics", "General Medicine"] },
  { label: "Vision",          emoji: "👁️", specialties: ["Ophthalmology"] },
  { label: "Joints & Bones",  emoji: "🦴", specialties: ["Orthopedics"] },
  { label: "Mental Health",   emoji: "🧠", specialties: ["Psychiatry", "Neurology"] },
  { label: "Digestive",       emoji: "🫃", specialties: ["Gastroenterology"] },
  { label: "Women's Health",  emoji: "🌸", specialties: ["Gynecology"] },
  { label: "Hormones",        emoji: "⚗️", specialties: ["Endocrinology"] },
  { label: "Cancer",          emoji: "🔬", specialties: ["Oncology", "Radiology"] },
];

const ALL_SPECIALTIES: { name: string; icon: LucideIcon; count: number }[] = [
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

export function Variation2SymptomBridge() {
  const [selected, setSelected] = useState<string | null>("Chest & Heart");

  const active = SYMPTOMS.find(s => s.label === selected);
  const highlighted = active ? new Set(active.specialties) : null;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[#D4A853] text-[10px] font-black uppercase tracking-widest mb-1">Find Your Specialist</p>
            <h2 className="text-xl font-black text-white">What's your concern?</h2>
            <p className="text-slate-500 text-xs mt-0.5">Pick a symptom — we'll show you the right specialist</p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className={`text-xs font-semibold border rounded-full px-3 py-1.5 transition-colors ${selected ? "text-slate-400 border-white/10 hover:border-white/20" : "text-[#D4A853] border-[#D4A853]/30"}`}
          >
            {selected ? "Clear filter" : "View all →"}
          </button>
        </div>

        {/* Symptom chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SYMPTOMS.map((s) => (
            <button
              key={s.label}
              onClick={() => setSelected(selected === s.label ? null : s.label)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border",
                selected === s.label
                  ? "bg-[#D4A853] text-[#0F172A] border-[#D4A853] shadow-lg shadow-[#D4A853]/20"
                  : "bg-white/5 text-slate-300 border-white/10 hover:border-[#D4A853]/40 hover:text-[#D4A853]",
              ].join(" ")}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Specialty grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {ALL_SPECIALTIES.map((sp) => {
            const Icon = sp.icon;
            const isMatch = highlighted ? highlighted.has(sp.name) : true;
            return (
              <button
                key={sp.name}
                className={[
                  "group rounded-xl p-3 flex flex-col gap-2 text-left border transition-all duration-300",
                  isMatch
                    ? "bg-white/8 border-[#D4A853]/30 shadow-md shadow-[#D4A853]/5 scale-100"
                    : "bg-white/[0.02] border-white/5 opacity-30 scale-95",
                ].join(" ")}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isMatch ? "bg-[#D4A853]/15" : "bg-white/5"}`}>
                  <Icon className={`w-4 h-4 transition-colors ${isMatch ? "text-[#D4A853]" : "text-slate-600"}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold leading-snug transition-colors ${isMatch ? "text-white" : "text-slate-600"}`}>{sp.name}</p>
                  <p className={`text-[10px] mt-0.5 transition-colors ${isMatch ? "text-slate-400" : "text-slate-700"}`}>{sp.count} doctors</p>
                </div>
                {isMatch && (
                  <div className="h-0.5 w-full bg-[#D4A853]/30 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
