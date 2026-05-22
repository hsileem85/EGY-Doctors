import { useState } from "react";
import { useParams, useSearch } from "wouter";
import { Calendar, MapPin, Star, Stethoscope, Clock, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { doctors } from "@/lib/data";

export default function DoctorProfile() {
  const { id } = useParams();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const preselectedSlot = searchParams.get("slot");

  const doctor = doctors.find(d => d.id === id);
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlot || null);
  const [bookingStep, setBookingStep] = useState<"slots" | "form" | "success">(preselectedSlot ? "form" : "slots");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doctor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor not found</h1>
        </div>
      </Layout>
    );
  }

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    setBookingStep("form");
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingStep("success");
    }, 1000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Doctor Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border shadow-sm p-8 flex flex-col md:flex-row gap-8">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover shadow-sm mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                    <p className="text-primary font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                      <Stethoscope className="h-5 w-5" />
                      {doctor.specialty}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-semibold">
                    <Star className="h-4 w-4 fill-current" />
                    <span>4.9</span>
                    <span className="text-amber-600/60 font-normal text-sm">(120)</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {doctor.bio}
                </p>

                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{doctor.clinicAddress}</span>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Fee</span>
                    <span>{doctor.fee} EGP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">About Doctor</h2>
              <p className="text-gray-600 leading-relaxed">
                {doctor.name} is a highly respected specialist in {doctor.specialty} located in {doctor.location}. 
                With extensive experience in treating various conditions, the clinic provides state-of-the-art 
                facilities and a patient-centric approach to healthcare.
              </p>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-primary/20 shadow-md">
              <div className="bg-primary text-primary-foreground p-4 rounded-t-xl">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </h3>
              </div>
              <CardContent className="p-6">
                {bookingStep === "slots" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Available Slots
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {doctor.slots.map((slot, i) => (
                        <Button 
                          key={i} 
                          variant="outline" 
                          className="h-12 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-sm font-medium"
                          onClick={() => handleSlotClick(slot)}
                          data-testid={`button-select-slot-${i}`}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {bookingStep === "form" && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Selected Slot</p>
                        <p className="font-bold text-gray-900">{selectedSlot}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setBookingStep("slots")} className="text-primary h-8 px-2">
                        Change
                      </Button>
                    </div>

                    <form onSubmit={handleConfirmBooking} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Patient Name</Label>
                        <Input 
                          id="name" 
                          placeholder="Full Name" 
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          required
                          data-testid="input-patient-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="01xxxxxxxxx" 
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          required
                          data-testid="input-patient-phone"
                        />
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Consultation Fee</span>
                          <span className="font-semibold">{doctor.fee} EGP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Booking Fee</span>
                          <span className="text-green-600 font-semibold">Free</span>
                        </div>
                        <div className="w-full h-px bg-gray-100 my-2"></div>
                        <div className="flex justify-between text-base font-bold">
                          <span>Pay at Clinic</span>
                          <span>{doctor.fee} EGP</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full mt-4 h-12 text-base font-semibold" 
                        disabled={isSubmitting || !patientName || !patientPhone}
                        data-testid="button-confirm-booking"
                      >
                        {isSubmitting ? "Confirming..." : "Confirm Booking"}
                      </Button>
                    </form>
                  </div>
                )}

                {bookingStep === "success" && (
                  <div className="text-center py-6 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600 mb-6">
                      Your appointment is scheduled for <br/>
                      <span className="font-bold text-gray-900">{selectedSlot}</span>
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => setBookingStep("slots")}>
                      Book Another
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
