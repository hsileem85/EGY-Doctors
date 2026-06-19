import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";

export interface Country {
  name: string;
  flag: string;
  code: string;
}

export const ALL_COUNTRIES: Country[] = [
  { name: "Afghanistan", flag: "🇦🇫", code: "+93" },
  { name: "Albania", flag: "🇦🇱", code: "+355" },
  { name: "Algeria", flag: "🇩🇿", code: "+213" },
  { name: "Andorra", flag: "🇦🇩", code: "+376" },
  { name: "Angola", flag: "🇦🇴", code: "+244" },
  { name: "Argentina", flag: "🇦🇷", code: "+54" },
  { name: "Armenia", flag: "🇦🇲", code: "+374" },
  { name: "Australia", flag: "🇦🇺", code: "+61" },
  { name: "Austria", flag: "🇦🇹", code: "+43" },
  { name: "Azerbaijan", flag: "🇦🇿", code: "+994" },
  { name: "Bahrain", flag: "🇧🇭", code: "+973" },
  { name: "Bangladesh", flag: "🇧🇩", code: "+880" },
  { name: "Belarus", flag: "🇧🇾", code: "+375" },
  { name: "Belgium", flag: "🇧🇪", code: "+32" },
  { name: "Belize", flag: "🇧🇿", code: "+501" },
  { name: "Benin", flag: "🇧🇯", code: "+229" },
  { name: "Bhutan", flag: "🇧🇹", code: "+975" },
  { name: "Bolivia", flag: "🇧🇴", code: "+591" },
  { name: "Bosnia & Herzegovina", flag: "🇧🇦", code: "+387" },
  { name: "Botswana", flag: "🇧🇼", code: "+267" },
  { name: "Brazil", flag: "🇧🇷", code: "+55" },
  { name: "Brunei", flag: "🇧🇳", code: "+673" },
  { name: "Bulgaria", flag: "🇧🇬", code: "+359" },
  { name: "Burkina Faso", flag: "🇧🇫", code: "+226" },
  { name: "Burundi", flag: "🇧🇮", code: "+257" },
  { name: "Cambodia", flag: "🇰🇭", code: "+855" },
  { name: "Cameroon", flag: "🇨🇲", code: "+237" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "Cape Verde", flag: "🇨🇻", code: "+238" },
  { name: "Central African Republic", flag: "🇨🇫", code: "+236" },
  { name: "Chad", flag: "🇹🇩", code: "+235" },
  { name: "Chile", flag: "🇨🇱", code: "+56" },
  { name: "China", flag: "🇨🇳", code: "+86" },
  { name: "Colombia", flag: "🇨🇴", code: "+57" },
  { name: "Comoros", flag: "🇰🇲", code: "+269" },
  { name: "Congo", flag: "🇨🇬", code: "+242" },
  { name: "Costa Rica", flag: "🇨🇷", code: "+506" },
  { name: "Croatia", flag: "🇭🇷", code: "+385" },
  { name: "Cuba", flag: "🇨🇺", code: "+53" },
  { name: "Cyprus", flag: "🇨🇾", code: "+357" },
  { name: "Czech Republic", flag: "🇨🇿", code: "+420" },
  { name: "Denmark", flag: "🇩🇰", code: "+45" },
  { name: "Djibouti", flag: "🇩🇯", code: "+253" },
  { name: "Dominican Republic", flag: "🇩🇴", code: "+1" },
  { name: "DR Congo", flag: "🇨🇩", code: "+243" },
  { name: "Ecuador", flag: "🇪🇨", code: "+593" },
  { name: "Egypt", flag: "🇪🇬", code: "+20" },
  { name: "El Salvador", flag: "🇸🇻", code: "+503" },
  { name: "Equatorial Guinea", flag: "🇬🇶", code: "+240" },
  { name: "Eritrea", flag: "🇪🇷", code: "+291" },
  { name: "Estonia", flag: "🇪🇪", code: "+372" },
  { name: "Eswatini", flag: "🇸🇿", code: "+268" },
  { name: "Ethiopia", flag: "🇪🇹", code: "+251" },
  { name: "Fiji", flag: "🇫🇯", code: "+679" },
  { name: "Finland", flag: "🇫🇮", code: "+358" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Gabon", flag: "🇬🇦", code: "+241" },
  { name: "Gambia", flag: "🇬🇲", code: "+220" },
  { name: "Georgia", flag: "🇬🇪", code: "+995" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "Ghana", flag: "🇬🇭", code: "+233" },
  { name: "Greece", flag: "🇬🇷", code: "+30" },
  { name: "Guatemala", flag: "🇬🇹", code: "+502" },
  { name: "Guinea", flag: "🇬🇳", code: "+224" },
  { name: "Guinea-Bissau", flag: "🇬🇼", code: "+245" },
  { name: "Guyana", flag: "🇬🇾", code: "+592" },
  { name: "Haiti", flag: "🇭🇹", code: "+509" },
  { name: "Honduras", flag: "🇭🇳", code: "+504" },
  { name: "Hungary", flag: "🇭🇺", code: "+36" },
  { name: "Iceland", flag: "🇮🇸", code: "+354" },
  { name: "India", flag: "🇮🇳", code: "+91" },
  { name: "Indonesia", flag: "🇮🇩", code: "+62" },
  { name: "Iran", flag: "🇮🇷", code: "+98" },
  { name: "Iraq", flag: "🇮🇶", code: "+964" },
  { name: "Ireland", flag: "🇮🇪", code: "+353" },
  { name: "Israel", flag: "🇮🇱", code: "+972" },
  { name: "Italy", flag: "🇮🇹", code: "+39" },
  { name: "Ivory Coast", flag: "🇨🇮", code: "+225" },
  { name: "Jamaica", flag: "🇯🇲", code: "+1" },
  { name: "Japan", flag: "🇯🇵", code: "+81" },
  { name: "Jordan", flag: "🇯🇴", code: "+962" },
  { name: "Kazakhstan", flag: "🇰🇿", code: "+7" },
  { name: "Kenya", flag: "🇰🇪", code: "+254" },
  { name: "Kuwait", flag: "🇰🇼", code: "+965" },
  { name: "Kyrgyzstan", flag: "🇰🇬", code: "+996" },
  { name: "Laos", flag: "🇱🇦", code: "+856" },
  { name: "Latvia", flag: "🇱🇻", code: "+371" },
  { name: "Lebanon", flag: "🇱🇧", code: "+961" },
  { name: "Lesotho", flag: "🇱🇸", code: "+266" },
  { name: "Liberia", flag: "🇱🇷", code: "+231" },
  { name: "Libya", flag: "🇱🇾", code: "+218" },
  { name: "Liechtenstein", flag: "🇱🇮", code: "+423" },
  { name: "Lithuania", flag: "🇱🇹", code: "+370" },
  { name: "Luxembourg", flag: "🇱🇺", code: "+352" },
  { name: "Madagascar", flag: "🇲🇬", code: "+261" },
  { name: "Malawi", flag: "🇲🇼", code: "+265" },
  { name: "Malaysia", flag: "🇲🇾", code: "+60" },
  { name: "Maldives", flag: "🇲🇻", code: "+960" },
  { name: "Mali", flag: "🇲🇱", code: "+223" },
  { name: "Malta", flag: "🇲🇹", code: "+356" },
  { name: "Mauritania", flag: "🇲🇷", code: "+222" },
  { name: "Mauritius", flag: "🇲🇺", code: "+230" },
  { name: "Mexico", flag: "🇲🇽", code: "+52" },
  { name: "Moldova", flag: "🇲🇩", code: "+373" },
  { name: "Monaco", flag: "🇲🇨", code: "+377" },
  { name: "Mongolia", flag: "🇲🇳", code: "+976" },
  { name: "Montenegro", flag: "🇲🇪", code: "+382" },
  { name: "Morocco", flag: "🇲🇦", code: "+212" },
  { name: "Mozambique", flag: "🇲🇿", code: "+258" },
  { name: "Myanmar", flag: "🇲🇲", code: "+95" },
  { name: "Namibia", flag: "🇳🇦", code: "+264" },
  { name: "Nepal", flag: "🇳🇵", code: "+977" },
  { name: "Netherlands", flag: "🇳🇱", code: "+31" },
  { name: "New Zealand", flag: "🇳🇿", code: "+64" },
  { name: "Nicaragua", flag: "🇳🇮", code: "+505" },
  { name: "Niger", flag: "🇳🇪", code: "+227" },
  { name: "Nigeria", flag: "🇳🇬", code: "+234" },
  { name: "North Korea", flag: "🇰🇵", code: "+850" },
  { name: "North Macedonia", flag: "🇲🇰", code: "+389" },
  { name: "Norway", flag: "🇳🇴", code: "+47" },
  { name: "Oman", flag: "🇴🇲", code: "+968" },
  { name: "Pakistan", flag: "🇵🇰", code: "+92" },
  { name: "Palestine", flag: "🇵🇸", code: "+970" },
  { name: "Panama", flag: "🇵🇦", code: "+507" },
  { name: "Papua New Guinea", flag: "🇵🇬", code: "+675" },
  { name: "Paraguay", flag: "🇵🇾", code: "+595" },
  { name: "Peru", flag: "🇵🇪", code: "+51" },
  { name: "Philippines", flag: "🇵🇭", code: "+63" },
  { name: "Poland", flag: "🇵🇱", code: "+48" },
  { name: "Portugal", flag: "🇵🇹", code: "+351" },
  { name: "Qatar", flag: "🇶🇦", code: "+974" },
  { name: "Romania", flag: "🇷🇴", code: "+40" },
  { name: "Russia", flag: "🇷🇺", code: "+7" },
  { name: "Rwanda", flag: "🇷🇼", code: "+250" },
  { name: "San Marino", flag: "🇸🇲", code: "+378" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "+966" },
  { name: "Senegal", flag: "🇸🇳", code: "+221" },
  { name: "Serbia", flag: "🇷🇸", code: "+381" },
  { name: "Sierra Leone", flag: "🇸🇱", code: "+232" },
  { name: "Singapore", flag: "🇸🇬", code: "+65" },
  { name: "Slovakia", flag: "🇸🇰", code: "+421" },
  { name: "Slovenia", flag: "🇸🇮", code: "+386" },
  { name: "Somalia", flag: "🇸🇴", code: "+252" },
  { name: "South Africa", flag: "🇿🇦", code: "+27" },
  { name: "South Korea", flag: "🇰🇷", code: "+82" },
  { name: "South Sudan", flag: "🇸🇸", code: "+211" },
  { name: "Spain", flag: "🇪🇸", code: "+34" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "+94" },
  { name: "Sudan", flag: "🇸🇩", code: "+249" },
  { name: "Suriname", flag: "🇸🇷", code: "+597" },
  { name: "Sweden", flag: "🇸🇪", code: "+46" },
  { name: "Switzerland", flag: "🇨🇭", code: "+41" },
  { name: "Syria", flag: "🇸🇾", code: "+963" },
  { name: "Taiwan", flag: "🇹🇼", code: "+886" },
  { name: "Tajikistan", flag: "🇹🇯", code: "+992" },
  { name: "Tanzania", flag: "🇹🇿", code: "+255" },
  { name: "Thailand", flag: "🇹🇭", code: "+66" },
  { name: "Timor-Leste", flag: "🇹🇱", code: "+670" },
  { name: "Togo", flag: "🇹🇬", code: "+228" },
  { name: "Trinidad & Tobago", flag: "🇹🇹", code: "+1" },
  { name: "Tunisia", flag: "🇹🇳", code: "+216" },
  { name: "Turkey", flag: "🇹🇷", code: "+90" },
  { name: "Turkmenistan", flag: "🇹🇲", code: "+993" },
  { name: "Uganda", flag: "🇺🇬", code: "+256" },
  { name: "Ukraine", flag: "🇺🇦", code: "+380" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "+971" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { name: "United States", flag: "🇺🇸", code: "+1" },
  { name: "Uruguay", flag: "🇺🇾", code: "+598" },
  { name: "Uzbekistan", flag: "🇺🇿", code: "+998" },
  { name: "Venezuela", flag: "🇻🇪", code: "+58" },
  { name: "Vietnam", flag: "🇻🇳", code: "+84" },
  { name: "Yemen", flag: "🇾🇪", code: "+967" },
  { name: "Zambia", flag: "🇿🇲", code: "+260" },
  { name: "Zimbabwe", flag: "🇿🇼", code: "+263" },
];

interface PhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
}

export function PhoneInput({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  placeholder = "1234567890",
  id,
  "data-testid": testId,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = ALL_COUNTRIES.find((c) => c.code === countryCode) ?? ALL_COUNTRIES.find((c) => c.name === "Egypt")!;

  const filtered = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="shrink-0 flex items-center gap-1 bg-[#0F172A]/80 border border-[#334155] border-r-0 rounded-l-md px-2.5 text-white text-sm hover:border-[#D4A853]/50 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30"
        style={{ minWidth: "80px" }}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-xs text-gray-300">{selected.code}</span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-[#1E293B] border border-[#334155] rounded-lg shadow-2xl shadow-black/60 overflow-hidden">
          <div className="p-2 border-b border-[#334155]">
            <div className="flex items-center gap-2 bg-[#0F172A]/60 border border-[#334155] rounded-md px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="bg-transparent text-white text-xs placeholder:text-gray-500 focus:outline-none w-full"
              />
            </div>
          </div>
          <ul className="overflow-y-auto max-h-52 py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-500">No results</li>
            )}
            {filtered.map((c) => (
              <li key={`${c.name}-${c.code}`}>
                <button
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#D4A853]/10 hover:text-[#D4A853] transition-colors text-left ${
                    c.code === countryCode && c.name === selected.name
                      ? "text-[#D4A853] bg-[#D4A853]/5"
                      : "text-gray-200"
                  }`}
                >
                  <span className="text-base w-6 text-center">{c.flag}</span>
                  <span className="flex-1 truncate text-xs">{c.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{c.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => onPhoneChange(normalizePhoneInput(e.target.value, countryCode))}
        placeholder={placeholder}
        maxLength={(MAX_LOCAL_DIGITS[countryCode] ?? 15)}
        data-testid={testId}
        className="rounded-l-none bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
      />
    </div>
  );
}

/** Max local-number length by dial code (digits only, no leading zero, no country code).
 *  Covers all countries in the list. Falls back to 15 (ITU max) for unknowns. */
const MAX_LOCAL_DIGITS: Record<string, number> = {
  "+20": 10,  // Egypt  01XXXXXXXXX → 10 digits without leading 0
  "+966": 9,  // Saudi Arabia
  "+971": 9,  // UAE
  "+965": 8,  // Kuwait
  "+974": 8,  // Qatar
  "+973": 8,  // Bahrain
  "+968": 8,  // Oman
  "+962": 9,  // Jordan
  "+961": 8,  // Lebanon
  "+970": 9,  // Palestine
  "+1":   10, // US/Canada
  "+44":  10, // UK
  "+49":  11, // Germany
  "+33":  9,  // France
  "+39":  10, // Italy
  "+34":  9,  // Spain
  "+90":  10, // Turkey
  "+91":  10, // India
  "+86":  11, // China
  "+55":  11, // Brazil
  "+7":   10, // Russia
};

/** Normalize a phone input value:
 *  1. Keep digits only (strip spaces, dashes, letters, +, parens).
 *  2. Strip all leading zeros (country code prefix already in dropdown).
 *  3. Clamp to the max local-number length for the selected country.
 */
export function normalizePhoneInput(raw: string, countryCode: string): string {
  const digits = raw.replace(/\D/g, "");               // digits only
  const stripped = digits.replace(/^0+/, "");          // strip leading zeros
  const max = MAX_LOCAL_DIGITS[countryCode] ?? 15;
  return stripped.slice(0, max);
}

export function buildPhone(countryCode: string, localNumber: string): string {
  const n = localNumber.trim();
  if (!n) return "";
  if (n.startsWith("+")) return n;
  return `${countryCode}${n}`;
}
