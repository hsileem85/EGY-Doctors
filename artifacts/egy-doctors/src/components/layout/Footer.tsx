import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-16 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-start">
          {lang === "ar" ? (
            <p className="text-lg font-bold text-white font-brand tracking-tight">إي جي <span className="text-[#D4A853]">دكتورز</span></p>
          ) : (
            <p className="text-lg font-bold text-white font-brand tracking-tight">
              EG<span className="text-[#D4A853]">Y Doctors</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            &copy; {new Date().getFullYear()} {lang === "ar" ? "إي جي دكتورز" : "EGY Doctors"}. {t.footer.rights}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-[#D4A853] transition-colors" data-testid="link-footer-privacy">
            {t.footer.privacy}
          </a>
          <a href="#" className="hover:text-[#D4A853] transition-colors" data-testid="link-footer-terms">
            {t.footer.terms}
          </a>
          <Link href="/contact" className="hover:text-[#D4A853] transition-colors" data-testid="link-footer-contact">
            {t.footer.contact}
          </Link>
          <Link href="/admin" className="hover:text-[#D4A853] transition-colors flex items-center gap-1" data-testid="link-footer-admin">
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === "ar" ? "الإدارة" : "Admin"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
