import { Link } from "wouter";
import { MapPin, Stethoscope, Star } from "lucide-react";
import { Doctor } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DoctorCardProps {
  doctor: Doctor;
  showSlots?: boolean;
}

export function DoctorCard({ doctor, showSlots = false }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row gap-6 p-6">
      <div className="flex-shrink-0 flex flex-col items-center">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm mb-4"
        />
        <div className="flex items-center gap-1 text-amber-500 mb-1">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
        </div>
        <span className="text-xs text-gray-500 font-medium">120+ Reviews</span>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
            <p className="text-primary font-medium flex items-center gap-1.5 mb-2">
              <Stethoscope className="h-4 w-4" />
              {doctor.specialty}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-0 text-xs px-2.5 py-1">
            {doctor.fee} EGP
          </Badge>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-6">
          <MapPin className="h-4 w-4" />
          <span>{doctor.location}</span>
          <span className="mx-2 text-gray-300">&bull;</span>
          <span className="truncate">{doctor.clinicAddress}</span>
        </div>

        {showSlots ? (
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              {doctor.slots.slice(0, 3).map((slot, i) => (
                <Link key={i} href={`/doctor/${doctor.id}?slot=${encodeURIComponent(slot)}`}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8" data-testid={`button-book-slot-${doctor.id}-${i}`}>
                    {slot}
                  </Button>
                </Link>
              ))}
            </div>
            <Link href={`/doctor/${doctor.id}`}>
              <Button size="sm" className="ml-4" data-testid={`link-doctor-profile-${doctor.id}`}>
                View Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-4 flex justify-end">
            <Link href={`/doctor/${doctor.id}`}>
              <Button data-testid={`link-doctor-profile-${doctor.id}`}>Book Appointment</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
