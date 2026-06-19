import { Input } from "@/components/ui/input";

export const COUNTRY_CODES = [
  { code: "+20",  flag: "🇪🇬", name: "Egypt" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+1",   flag: "🇺🇸", name: "US / Canada" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
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
  return (
    <div className="flex">
      <select
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        className="shrink-0 bg-[#0F172A]/80 border border-[#334155] border-r-0 rounded-l-md text-white text-xs px-2 py-0 focus:border-[#D4A853] focus:outline-none focus:ring-1 focus:ring-[#D4A853]/20 cursor-pointer"
        style={{ minWidth: "82px" }}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code} className="bg-[#1E293B]">
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        className="rounded-l-none bg-[#0F172A]/60 border-[#334155] text-white placeholder:text-gray-500 focus:border-[#D4A853] focus:ring-[#D4A853]/20"
      />
    </div>
  );
}

export function buildPhone(countryCode: string, localNumber: string): string {
  const n = localNumber.trim();
  if (!n) return "";
  if (n.startsWith("+")) return n;
  return `${countryCode}${n}`;
}
