import { Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">EGY Doctors</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors hidden sm:block"
            data-testid="link-search"
          >
            {t.nav.search}
          </Link>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
          >
            <span className="text-base leading-none">{lang === "en" ? "🇪🇬" : "🇬🇧"}</span>
            <span>{lang === "en" ? "عربي" : "EN"}</span>
          </button>

          <Link href="/dashboard" data-testid="link-dashboard">
            <Button variant="outline" className="font-medium text-sm">
              {t.nav.doctorLogin}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
