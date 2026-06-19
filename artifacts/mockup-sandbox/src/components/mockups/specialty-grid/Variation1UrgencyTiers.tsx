import { useState } from "react";
import {
  Heart, Brain, Microscope, Stethoscope, Bone, Sparkles, Flower2, Eye,
  Droplets, Activity, Baby, Smile, Pill, FlaskConical, Wind, Scan,
  Zap, Clock, Shield, type LucideIcon,
} from "lucide-react";

type Tier = "emergency" | "routine" | "preventive";

const TIERS: { id: Tier; label: string; sub: string; icon: LucideIcon; accent: string; bg: string; border: string; badge: string; specialties: { name: string; icon: LucideIcon; count: number }[] }[] = [
  {
    id: "emergency",
    label: "Urgent Care",
    sub: "When you need immediate specialist attention",
    icon: Zap,
    accent: "text-rose-400",
    bg: "bg-rose-500/8",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-300",
    specialties: [
      { name: "Cardiology",      icon: Heart,       count: 38 },
      { name: "Neurology",       icon: Brain,       count: 24 },
      { name: "Oncology",        icon: Microscope,  count: 8  },
      { name: "General Medicine",icon: Stethoscope, count: 55 },
    ],
  },
  {
    id: "routine",
    label: "Routine Consultations",
    sub: "Scheduled appointments & ongoing care",
    icon: Clock,
    accent: "text-[#D4A853]",
    bg: "bg-[#D4A853]/5",
    border: "border-[#D4A853]/20",
    badge: "bg-[#D4A853]/15 text-[#D4A853]",
    specialties: [
      { name: "Orthopedics",      icon: Bone,    count: 19 },
      { name: "Dermatology",      icon: Sparkles, count: 31 },
      { name: "Gynecology",       icon: Flower2,  count: 22 },
      { name: "Ophthalmology",    icon: Eye,      count: 15 },
      { name: "Urology",          icon: Droplets, count: 11 },
      { name: "Gastroenterology", icon: Activity, count: 18 },
    ],
  },
  {
    id: "preventive",
    label: "Preventive & Wellness",
    sub: "Checkups, mental health & long-term wellbeing",
    icon: Shield,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/15",
    badge: "bg-emerald-500/10 text-emerald-400",
    specialties: [
      { name: "Pediatrics",    icon: Baby,        count: 27 },
      { name: "Dentistry",     icon: Smile,       count: 41 },
      { name: "Psychiatry",    icon: Pill,        count: 14 },
      { name: "Endocrinology", icon: FlaskConical,count: 13 },
      { name: "Pulmonology",   icon: Wind,        count: 9  },
      { name: "Radiology",     icon: Scan,        count: 16 },
    ],
  },
];

export function Variation1UrgencyTiers() {
  const [activeTier, setActiveTier] = useState<Tier | null>(null);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[#D4A853] text-[10px] font-black uppercase tracking-widest mb-1">Medical Specialties</p>
            <h2 className="text-xl font-black text-white">Browse by Specialty</h2>
            <p className="text-slate-500 text-xs mt-0.5">Organized by how soon you need care</p>
          </div>
          <button className="text-xs font-semibold text-[#D4A853] border border-[#D4A853]/30 rounded-full px-3 py-1.5 hover:border-[#D4A853] transition-colors">
            View all →
          </button>
        </div>

        {/* Tiers */}
        <div className="flex flex-col gap-3">
          {TIERS.map((tier) => {
            const TierIcon = tier.icon;
            const isOpen = activeTier === tier.id || activeTier === null;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl border ${tier.bg} ${tier.border} overflow-hidden transition-all duration-300`}
              >
                {/* Tier header */}
                <button
                  onClick={() => setActiveTier(activeTier === tier.id ? null : tier.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center`}>
                    <TierIcon className={`w-3.5 h-3.5 ${tier.accent}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${tier.accent}`}>{tier.label}</p>
                    <p className="text-[10px] text-slate-500">{tier.sub}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>
                    {tier.specialties.length} specialties
                  </span>
                </button>

                {/* Specialty pills */}
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {tier.specialties.map((sp) => {
                    const Icon = sp.icon;
                    return (
                      <button
                        key={sp.name}
                        className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-xl px-3 py-2 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <Icon className={`w-3.5 h-3.5 ${tier.accent}`} />
                        <span className="text-xs font-semibold text-slate-200">{sp.name}</span>
                        <span className="text-[10px] text-slate-500 ml-0.5">{sp.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
