import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-16 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-start">
          <p className="text-sm font-medium text-white font-brand">{lang === "ar" ? "إجي دكتورز" : "EGY Doctors"}</p>
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
          <a href="#" className="hover:text-[#D4A853] transition-colors" data-testid="link-footer-contact">
            {t.footer.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}
