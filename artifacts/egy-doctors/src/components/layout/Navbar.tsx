import { Newspaper, Search, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="bg-[#0F172A] border-b border-[#1E293B] z-50 w-full">
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5" data-testid="link-home">
          {lang === "ar" ? (
            <span className="text-xl font-bold text-white tracking-tight font-brand">
              إجي <span className="text-[#D4A853]">دكتورز</span>
            </span>
          ) : (
            <span className="flex items-center gap-0 text-xl font-bold tracking-tight font-brand">
              <span className="text-white">EG</span>
              {/* Stethoscope Y */}
              <svg viewBox="0 0 18 24" className="inline-block w-[20px] h-[26px] ml-[1px]" fill="none">
                {/* Thick Y arms + bottom tube */}
                <path d="M9 12 C7 9, 5 6, 4 4" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M9 12 C11 9, 13 6, 14 4" stroke="#D4A853" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M9 12 L9 18" stroke="#D4A853" strokeWidth="3" strokeLinecap="round"/>
                {/* Chest piece at bottom */}
                <circle cx="9" cy="21" r="4.5" fill="#D4A853"/>
                <circle cx="9" cy="21" r="2" fill="white"/>
                {/* Ear tips at top */}
                <circle cx="4" cy="3" r="3" fill="#D4A853"/>
                <circle cx="14" cy="3" r="3" fill="#D4A853"/>
                {/* Center joint */}
                <circle cx="9" cy="12" r="2.5" fill="#D4A853"/>
              </svg>
              <span className="text-[#D4A853]"> Doctors</span>
            </span>
          )}
        </Link>
        <div className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/search">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Search className="h-4 w-4 mr-1" />
                {lang === "ar" ? "البحث" : "Search"}
              </Button>
            </Link>
            <Link href="/magazine">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Newspaper className="h-4 w-4 mr-1" />
                {lang === "ar" ? "المجلة" : "Magazine"}
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Info className="h-4 w-4 mr-1" />
                {lang === "ar" ? "من نحن" : "About"}
              </Button>
            </Link>
          </div>

          <div className="w-px h-6 bg-[#334155] hidden md:block" />

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-1"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>

          <Link href="/auth" data-testid="link-sign-in">
            <Button
              variant="ghost"
              className="text-sm font-normal hidden sm:inline-flex h-8 px-3 text-gray-300 hover:text-white hover:bg-transparent"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </Button>
          </Link>

          <Link href="/auth?tab=signup" data-testid="link-sign-up">
            <Button className="text-sm font-normal h-8 px-3 bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] border-none">
              {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
