import { useState, useRef, useEffect } from "react";
import "./_group.css";

const NAVY = "#0F172A";
const GOLD = "#D4A853";

const doctors = [
  { id: "1", name: "Dr. Ahmed Youssef", specialty: "Cardiology", location: "New Cairo", fee: 450,
    bio: "Senior Consultant Cardiologist with 15 years of experience specializing in heart failure and preventive cardiology.",
    image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9, reviews: 128, experience: "15+ years" },
  { id: "2", name: "Dr. Sara Mahmoud", specialty: "Dermatology", location: "Zamalek", fee: 350,
    bio: "Expert dermatologist specializing in cosmetic dermatology, laser treatments, and skin conditions.",
    image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.8, reviews: 96, experience: "12+ years" },
  { id: "3", name: "Dr. Kareem Hassan", specialty: "Orthopedics", location: "Maadi", fee: 400,
    bio: "Consultant Orthopedic Surgeon focusing on sports injuries and joint replacement surgeries.",
    image: "https://randomuser.me/api/portraits/men/65.jpg", rating: 4.9, reviews: 154, experience: "18+ years" },
];
const specialties = ["Cardiology","Dermatology","Orthopedics","Neurology","Pediatrics","Ophthalmology"];
const locations = ["New Cairo","Zamalek","Maadi","Heliopolis","Dokki","Nasr City"];
const times = ["Today", "Tomorrow", "This Week", "Anytime"];

function Star() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" style={{ color: GOLD }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function ConversationalOnboarding() {
  const [step, setStep] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: NAVY }}>
              <svg className="w-5 h-5" style={{ color: GOLD }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: NAVY }}>
              EGY <span style={{ color: GOLD }}>Doctors</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-lg" style={{ color: NAVY }}>Sign In</button>
            <button className="text-sm font-medium text-white px-4 py-2 rounded-lg" style={{ backgroundColor: NAVY }}>For Doctors</button>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 pt-24 pb-32 max-w-3xl mx-auto w-full px-4">
        <div className="space-y-8">
          
          {/* Intro Message */}
          <div className="flex flex-col items-start max-w-xl">
             <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md" style={{ backgroundColor: GOLD }}>
                <svg className="w-5 h-5" style={{ color: NAVY }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100" style={{ color: NAVY }}>
               <h1 className="text-xl font-bold mb-2">Hello! I'm your medical assistant.</h1>
               <p className="text-gray-600">Let's find the right doctor for you. What specialty are you looking for?</p>
             </div>
             
             {/* Specialty Options */}
             {step === 0 && (
               <div className="mt-4 flex flex-wrap gap-2">
                 {specialties.map(s => (
                   <button 
                     key={s}
                     onClick={() => { setSelectedSpecialty(s); setStep(1); }}
                     className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors shadow-sm"
                   >
                     {s}
                   </button>
                 ))}
                 <button className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm" style={{ backgroundColor: NAVY }}>
                   Type specialty...
                 </button>
               </div>
             )}
          </div>

          {/* User Reply: Specialty */}
          {step > 0 && (
            <div className="flex flex-col items-end w-full">
              <div className="text-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-sm" style={{ backgroundColor: NAVY }}>
                <p>I need a {selectedSpecialty} doctor.</p>
              </div>
            </div>
          )}

          {/* Bot: Location */}
          {step > 0 && (
            <div className="flex flex-col items-start max-w-xl animate-in slide-in-from-bottom-2 fade-in duration-300">
               <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md" style={{ backgroundColor: GOLD }}>
                  <svg className="w-5 h-5" style={{ color: NAVY }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100" style={{ color: NAVY }}>
                 <p className="text-gray-600">Got it. A {selectedSpecialty} specialist. Which area is most convenient for you?</p>
               </div>
               
               {step === 1 && (
                 <div className="mt-4 flex flex-wrap gap-2">
                   {locations.map(l => (
                     <button 
                       key={l}
                       onClick={() => { setSelectedLocation(l); setStep(2); }}
                       className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors shadow-sm"
                     >
                       {l}
                     </button>
                   ))}
                   <button className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm" style={{ backgroundColor: NAVY }}>
                     Use my location
                   </button>
                 </div>
               )}
            </div>
          )}

          {/* User Reply: Location */}
          {step > 1 && (
            <div className="flex flex-col items-end w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="text-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-sm" style={{ backgroundColor: NAVY }}>
                <p>Preferably around {selectedLocation}.</p>
              </div>
            </div>
          )}

          {/* Bot: Time */}
          {step > 1 && (
            <div className="flex flex-col items-start max-w-xl animate-in slide-in-from-bottom-2 fade-in duration-300">
               <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md" style={{ backgroundColor: GOLD }}>
                  <svg className="w-5 h-5" style={{ color: NAVY }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100" style={{ color: NAVY }}>
                 <p className="text-gray-600">Great! When would you like to schedule the appointment?</p>
               </div>
               
               {step === 2 && (
                 <div className="mt-4 flex flex-wrap gap-2">
                   {times.map(t => (
                     <button 
                       key={t}
                       onClick={() => { setSelectedTime(t); setStep(3); }}
                       className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors shadow-sm"
                     >
                       {t}
                     </button>
                   ))}
                   <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors shadow-sm">
                     Specific date...
                   </button>
                 </div>
               )}
            </div>
          )}

          {/* User Reply: Time */}
          {step > 2 && (
            <div className="flex flex-col items-end w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="text-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-sm" style={{ backgroundColor: NAVY }}>
                <p>I am looking for an appointment {selectedTime}.</p>
              </div>
            </div>
          )}

          {/* Bot: Results */}
          {step > 2 && (
            <div className="flex flex-col items-start w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
               <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md" style={{ backgroundColor: GOLD }}>
                  <svg className="w-5 h-5" style={{ color: NAVY }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 w-full mb-6" style={{ color: NAVY }}>
                 <p className="font-medium text-lg mb-1">Here are the best {selectedSpecialty} doctors in {selectedLocation} available {selectedTime}:</p>
                 <p className="text-gray-500 text-sm">Found {doctors.length} matches based on your preferences.</p>
               </div>

               {/* Results Grid Inline */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {doctors.map(doctor => (
                     <div key={doctor.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-[#D4A853]/50 hover:shadow-md transition-all">
                       <div className="flex gap-4">
                         <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                           <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                           <h3 className="font-bold leading-tight" style={{ color: NAVY }}>{doctor.name}</h3>
                           <p className="text-sm font-medium mb-1" style={{ color: GOLD }}>{doctor.specialty}</p>
                           <div className="flex items-center gap-1.5 mb-2">
                             <div className="flex"><Star /></div>
                             <span className="text-xs font-bold text-gray-700">{doctor.rating}</span>
                             <span className="text-xs text-gray-400">({doctor.reviews} reviews)</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                         <span className="bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{doctor.experience}</span>
                         <span className="bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{doctor.location}</span>
                         <span className="bg-gray-50 px-2 py-1 rounded-md font-semibold" style={{ color: NAVY }}>{doctor.fee} EGP</span>
                       </div>

                       <button className="w-full py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: NAVY }}>
                         Book Appointment
                       </button>
                     </div>
                  ))}
               </div>

               <div className="mt-8 flex justify-center w-full">
                 <button onClick={() => {setStep(0); setSelectedSpecialty(null); setSelectedLocation(null); setSelectedTime(null);}} className="text-sm text-gray-500 hover:underline underline-offset-4" style={{ color: NAVY }}>
                   Start a new search
                 </button>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      
      {/* Fixed bottom input for illusion of chat */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <div className="max-w-3xl mx-auto relative">
           <input 
             type="text" 
             placeholder={step < 3 ? "Select an option above to continue..." : "Type here to refine search..."}
             className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A853]/50 focus:border-[#D4A853]" 
             disabled={step < 3}
           />
           <button className="absolute right-2 top-2 p-2 rounded-full text-white hover:opacity-90 transition-colors disabled:opacity-50" disabled={step < 3} style={{ backgroundColor: NAVY }}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
           </button>
         </div>
      </div>
    </div>
  );
}
