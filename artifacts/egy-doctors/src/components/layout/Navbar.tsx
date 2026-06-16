import { HeartPulse } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="bg-[#0F172A] border-b border-[#1E293B] z-50 w-full">
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-[#0F172A]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight font-brand">
            {lang === "ar" ? "إجي دكتورز" : "EGY"}
            <span className="text-[#D4A853]">
              {lang === "ar" ? "" : " Doctors"}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
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
