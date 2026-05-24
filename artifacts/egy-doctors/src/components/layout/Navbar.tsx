import { Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold text-gray-900 tracking-tight">EGY Doctors</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:block"
            data-testid="link-about"
          >
            {t.nav.about}
          </Link>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="text-sm text-gray-600 hover:text-primary transition-colors px-2 py-1"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>

          <Link href="/register" data-testid="link-register">
            <Button variant="ghost" className="text-sm font-normal hidden sm:inline-flex h-8 px-3">
              {t.nav.register}
            </Button>
          </Link>

          <Link href="/dashboard" data-testid="link-dashboard">
            <Button variant="outline" className="text-sm font-normal h-8 px-3">
              {t.nav.doctorLogin}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
