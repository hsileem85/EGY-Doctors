import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-16 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-start">
          {lang === "ar" ? (
            <p className="text-sm font-medium text-white font-brand">إجي <span className="text-[#D4A853]">دكتورز</span></p>
          ) : (
            <p className="text-sm font-medium text-white font-brand flex items-center gap-0">
              EG
              <svg viewBox="0 0 28 36" className="inline-block w-[14px] h-[18px] ml-[1px] mr-[1px]" fill="none">
                <path d="M14 19 C10 15, 6 11, 3 6" stroke="#D4A853" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <path d="M14 19 C18 15, 22 11, 25 6" stroke="#D4A853" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <path d="M14 19 L14 27" stroke="#D4A853" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="14" cy="31" r="5.5" fill="#D4A853"/>
                <circle cx="14" cy="31" r="3.2" fill="white"/>
                <circle cx="3" cy="4" r="3.5" fill="white"/>
                <circle cx="3" cy="4" r="2" fill="#D4A853"/>
                <circle cx="25" cy="4" r="3.5" fill="white"/>
                <circle cx="25" cy="4" r="2" fill="#D4A853"/>
                <circle cx="14" cy="19" r="3" fill="#D4A853" filter="url(#stethoscopeGlow)"/>
                <circle cx="14" cy="19" r="1.5" fill="white"/>
              </svg>
              <span className="text-[#D4A853]"> Doctors</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            &copy; {new Date().getFullYear()} {lang === "ar" ? "إجي دكتورز" : "EGY Doctors"}. {t.footer.rights}
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
        </div>
      </div>
    </footer>
  );
}
