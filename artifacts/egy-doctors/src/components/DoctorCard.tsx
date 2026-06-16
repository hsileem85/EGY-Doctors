import { Link } from "wouter";
import { MapPin, Stethoscope, Star, Navigation, Calendar } from "lucide-react";
import { Doctor } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

interface DoctorCardProps {
  doctor: Doctor;
  showSlots?: boolean;
}

export function DoctorCard({ doctor, showSlots = false }: DoctorCardProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const specialty = t.specialties[doctor.specialty] ?? doctor.specialty;
  const location = t.locations[doctor.location] ?? doctor.location;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      {/* Header: Avatar + Name + Fee */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {doctor.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/5 text-primary hover:bg-primary/10 border-0 text-xs px-2 py-0.5 shrink-0 font-semibold"
            >
              {doctor.fee} {t.dashboard.egp}
            </Badge>
          </div>
          <p className="text-primary text-sm flex items-center gap-1 mt-0.5">
            <Stethoscope className="h-3.5 w-3.5" />
            {specialty}
          </p>
        </div>
      </div>

      {/* Rating — clickable, opens public profile */}
      <Link href={`/profile/${doctor.id}`}>
        <div className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#D4A853]">
            {doctor.rating}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            ({doctor.reviews} {t.card.reviews})
          </span>
        </div>
      </Link>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
        {doctor.bio}
      </p>

      {/* Location — clickable address that opens Maps */}
      <a
        href={doctor.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-1.5 text-sm text-[#D4A853] hover:text-[#c49a4a] underline underline-offset-2 decoration-[#D4A853]/40 hover:decoration-[#D4A853] transition-colors mb-4 group"
      >
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span className="line-clamp-1">
          {location} {isRTL ? "\u00b7" : "\u00b7"} {doctor.clinicAddress}
        </span>
        <svg className="h-3 w-3 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* ── Bottom Action Area ── */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        {showSlots ? (
          <div className="flex items-center justify-between gap-3">
            {/* Clickable distance link — opens Google Maps */}
            <a
              href={doctor.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium bg-[#D4A853]/5 hover:bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 hover:border-[#D4A853]/40 rounded-lg px-3 py-2 transition-colors"
              title={isRTL ? "افتح في خرائط Google" : "Open in Google Maps"}
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{doctor.distance}</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#D4A853]/70">
                {isRTL ? "افتح الخريطة" : "Map"}
              </span>
              <svg className="h-3 w-3 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <Link href={`/doctor/${doctor.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10 hover:border-[#D4A853]"
                  data-testid={`link-doctor-book-${doctor.id}`}
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {isRTL ? "الحجز" : "Book"}
                </Button>
              </Link>

              <Link href={`/profile/${doctor.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 px-4 border-gray-200 hover:border-[#D4A853] hover:text-[#D4A853]"
                  data-testid={`link-doctor-profile-${doctor.id}`}
                >
                  {t.card.viewProfile}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Link href={`/doctor/${doctor.id}`}>
            <Button
              className="w-full"
              data-testid={`link-doctor-profile-${doctor.id}`}
            >
              {t.card.bookAppointment}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
