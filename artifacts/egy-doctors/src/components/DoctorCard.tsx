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

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          120+ {t.card.reviews}
        </span>
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
        {doctor.bio}
      </p>

      {/* Location */}
      <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4">
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span className="line-clamp-1">
          {location} {isRTL ? "\u00b7" : "\u00b7"} {doctor.clinicAddress}
        </span>
      </div>

      {/* ── Bottom Action Area ── */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        {showSlots ? (
          <div className="flex items-center justify-between gap-3">
            {/* Clickable distance link — opens Google Maps */}
            <a
              href={doctor.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-[#D4A853] hover:text-[#c49a4a] hover:underline transition-colors"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{doctor.distance}</span>
              <span className="text-xs text-gray-400 font-normal uppercase">
                {isRTL ? "متباعد" : "Away"}
              </span>
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

              <Link href={`/doctor/${doctor.id}`}>
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
