import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-16 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-start">
          {lang === "ar" ? (
            <p className="text-sm font-medium text-white font-brand">إجي <span className="text-[#10B981]">دكتورز</span></p>
          ) : (
            <p className="text-sm font-medium text-white font-brand flex items-center gap-0">
              EG
              <svg viewBox="0 0 24 36" className="inline-block w-[18px] h-[22px] ml-[1px] mr-[1px]" fill="none">
                <path d="M12 16 C10 13, 7 9, 4 4" stroke="#10B981" strokeWidth="4" strokeLinecap="round"/>
                <path d="M12 16 C14 13, 17 9, 20 4" stroke="#10B981" strokeWidth="4" strokeLinecap="round"/>
                <path d="M12 16 L12 25" stroke="#10B981" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="12" cy="29" r="6" fill="#10B981"/>
                <circle cx="12" cy="29" r="3.5" fill="white"/>
                <circle cx="4" cy="3" r="4" fill="#10B981"/>
                <circle cx="4" cy="3" r="2" fill="white"/>
                <circle cx="20" cy="3" r="4" fill="#10B981"/>
                <circle cx="20" cy="3" r="2" fill="white"/>
                <circle cx="12" cy="16" r="3.5" fill="#10B981"/>
                <circle cx="12" cy="16" r="1.5" fill="white"/>
                <path d="M12 16 C10 13, 7 9, 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M12 16 C14 13, 17 9, 20 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M12 16 L12 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              </svg>
              <span className="text-[#10B981]"> Doctors</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            &copy; {new Date().getFullYear()} {lang === "ar" ? "إجي دكتورز" : "EGY Doctors"}. {t.footer.rights}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-[#10B981] transition-colors" data-testid="link-footer-privacy">
            {t.footer.privacy}
          </a>
          <a href="#" className="hover:text-[#10B981] transition-colors" data-testid="link-footer-terms">
            {t.footer.terms}
          </a>
          <Link href="/contact" className="hover:text-[#10B981] transition-colors" data-testid="link-footer-contact">
            {t.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
