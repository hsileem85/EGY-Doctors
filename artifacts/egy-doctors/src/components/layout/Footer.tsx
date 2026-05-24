import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t bg-gray-50 py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-start">
          <p className="text-sm font-medium text-gray-900 font-brand">{lang === "ar" ? "إجي دكتورز" : "EGY Doctors"}</p>
          <p className="text-xs text-gray-500 mt-1">
            &copy; {new Date().getFullYear()} {lang === "ar" ? "إجي دكتورز" : "EGY Doctors"}. {t.footer.rights}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">
            {t.footer.privacy}
          </a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-terms">
            {t.footer.terms}
          </a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-contact">
            {t.footer.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}
