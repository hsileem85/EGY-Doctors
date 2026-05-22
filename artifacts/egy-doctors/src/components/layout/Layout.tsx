import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useLanguage } from "@/context/LanguageContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { lang } = useLanguage();

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-50/50"
      style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : undefined }}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
