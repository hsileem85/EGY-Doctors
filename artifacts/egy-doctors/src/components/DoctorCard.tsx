import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Stethoscope, Star, Calendar, Phone, Building2 } from "lucide-react";
import { type ApiDoctor } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

interface DoctorCardProps {
  doctor: ApiDoctor;
  showSlots?: boolean;
}

function mapsUrl(clinic: ApiDoctor["clinics"][number]): string {
  if (clinic.lat && clinic.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
  }
  if (clinic.mapUrl) return clinic.mapUrl;
  const q = encodeURIComponent([clinic.address, clinic.location].filter(Boolean).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function getPricingInfo(doctor: ApiDoctor, isRTL: boolean): { label: string; multipleClinicPrices: boolean } {
  const fees = doctor.clinics.map(c => c.fee).filter((f): f is number => f != null && f > 0);
  if (fees.length === 0) {
    const fallback = doctor.fee ?? 0;
    return { label: fallback > 0 ? `${fallback} EGP` : "", multipleClinicPrices: false };
  }
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (min === max) {
    return { label: `${min} EGP`, multipleClinicPrices: false };
  }
  return {
    label: isRTL ? `يبدأ من ${min} جنيه` : `From ${min} EGP`,
    multipleClinicPrices: true,
  };
}

export function DoctorCard({ doctor, showSlots = false }: DoctorCardProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [shownPhones, setShownPhones] = useState<Set<number>>(new Set());

  const specialty = t.specialties[doctor.specialty] ?? doctor.specialty;
  const pricing = getPricingInfo(doctor, isRTL);

  function togglePhone(i: number) {
    setShownPhones(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      {/* Header: Avatar + Details */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shrink-0"
        />
        <div className="flex-1 min-w-0 pl-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/profile/${doctor.id}`}>
              <h3 className="font-bold text-gray-900 text-base leading-tight hover:text-primary transition-colors cursor-pointer">
                {doctor.name}
              </h3>
            </Link>
            {pricing.label && (
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 shrink-0 font-semibold border-0 ${
                  pricing.multipleClinicPrices
                    ? "bg-amber-50 text-amber-700"
                    : "bg-primary/5 text-primary hover:bg-primary/10"
                }`}
              >
                {pricing.label}
              </Badge>
            )}
          </div>
          <p className="text-primary text-sm flex items-center gap-1 mt-0.5">
            <Stethoscope className="h-3.5 w-3.5" />
            {specialty}
          </p>

          {/* Poly clinic affiliation badge */}
          {doctor.polyClinic && (
            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-[18px] text-violet-600 border-violet-200 bg-violet-50 gap-0.5 font-medium"
              >
                <Building2 className="h-2.5 w-2.5 shrink-0" />
                {isRTL
                  ? (doctor.polyClinic.nameAr ?? doctor.polyClinic.name)
                  : doctor.polyClinic.name}
              </Badge>
            </div>
          )}

          {/* Clinic pills — one per clinic */}
          {doctor.clinics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {doctor.clinics.map((clinic, i) => {
                const phoneVisible = shownPhones.has(i);
                const hasPhone = Boolean(clinic.phone);
                return (
                  <div key={i} className="flex items-center gap-0.5">
                    <a
                      href={mapsUrl(clinic)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11px] bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {clinic.location || doctor.location}
                    </a>

                    {hasPhone && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); togglePhone(i); }}
                        className={`inline-flex items-center gap-0.5 text-[11px] rounded-md px-1.5 py-0.5 font-medium transition-colors ${
                          phoneVisible
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-500"
                        }`}
                        title={isRTL ? "اعرض رقم الهاتف" : "Show phone"}
                      >
                        <Phone className="h-2.5 w-2.5 shrink-0" />
                        {phoneVisible && (
                          <a
                            href={`tel:${clinic.phone}`}
                            className="ml-0.5 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            {clinic.phone}
                          </a>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
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

      {/* Bottom Action Area */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        {showSlots ? (
          <div className="flex items-center justify-end gap-2">
            <Link href={`/doctor/${doctor.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10 hover:border-[#D4A853]"
                data-testid={`link-doctor-book-${doctor.id}`}
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                {isRTL ? "الحجز" : "Book"}
              </Button>
            </Link>
            <Link href={`/profile/${doctor.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-gray-200 hover:border-[#D4A853] hover:text-[#D4A853]"
                data-testid={`link-doctor-profile-${doctor.id}`}
              >
                {t.card.viewProfile}
              </Button>
            </Link>
          </div>
        ) : (
          <Link href={`/doctor/${doctor.id}`}>
            <Button className="w-full" data-testid={`link-doctor-profile-${doctor.id}`}>
              {t.card.bookAppointment}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
