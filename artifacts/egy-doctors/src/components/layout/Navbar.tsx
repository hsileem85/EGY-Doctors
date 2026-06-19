import { useState } from "react";
import { Newspaper, Info, ShieldCheck, LogOut, UserCog, LayoutDashboard, CalendarDays, Home, PhoneCall, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const navLinks = [
    { href: "/", icon: Home, labelEn: "Home", labelAr: "الرئيسية" },
    { href: "/magazine", icon: Newspaper, labelEn: "Magazine", labelAr: "المجلة" },
    { href: "/about", icon: Info, labelEn: "About", labelAr: "من نحن" },
    { href: "/contact", icon: PhoneCall, labelEn: "Contact Us", labelAr: "تواصل معنا" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 z-50 w-full shadow-sm">
      {/* ── Main row ── */}
      <div className="max-w-5xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo + hotline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5" data-testid="link-home">
            {lang === "ar" ? (
              <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight font-brand">
                إي جي <span className="text-[#D4A853]">دكتورز</span>
              </span>
            ) : (
              <span className="flex items-center gap-0 text-lg sm:text-xl font-bold tracking-tight font-brand">
                <span className="text-gray-900">EG</span>
                <span className="text-[#D4A853]">Y Doctors</span>
              </span>
            )}
          </Link>
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
            <PhoneCall className="w-3 h-3 text-[#D4A853]" />
            <span className="text-xs font-bold text-gray-700 tracking-wide">15992</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, labelEn, labelAr }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className="text-sm font-normal h-8 px-3 text-gray-600 hover:text-[#D4A853] hover:bg-gray-50"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {lang === "ar" ? labelAr : labelEn}
                </Button>
              </Link>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden md:block" />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 shrink-0"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>

          {/* Auth: logged-in dropdown or guest buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none group">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4A853]/30 group-hover:ring-[#D4A853]/60 transition-all select-none flex-shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#D4A853] text-white flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 group-hover:text-gray-900 transition-colors max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-white border-gray-200 text-gray-900">
                <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#D4A853] text-white flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role === "medical_center" ? "Medical Center" : user.role}</p>
                  </div>
                </div>
                {user.role === "patient" && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer hover:bg-[#D4A853]/10 focus:bg-[#D4A853]/10 focus:text-[#D4A853] mt-1"
                    onClick={() => setLocation("/patient/dashboard")}
                  >
                    <CalendarDays className="h-4 w-4 text-[#D4A853]" />
                    {lang === "ar" ? "مواعيدي" : "My Appointments"}
                  </DropdownMenuItem>
                )}
                {user.role === "doctor" && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer hover:bg-[#D4A853]/10 focus:bg-[#D4A853]/10 focus:text-[#D4A853] mt-1"
                    onClick={() => setLocation("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#D4A853]" />
                    {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </DropdownMenuItem>
                )}
                {user.role === "doctor" && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer hover:bg-[#D4A853]/10 focus:bg-[#D4A853]/10 focus:text-[#D4A853]"
                    onClick={() => setLocation("/edit-profile")}
                  >
                    <UserCog className="h-4 w-4 text-[#D4A853]" />
                    {lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-500"
                  onClick={() => { signOut(); setLocation("/"); }}
                >
                  <LogOut className="h-4 w-4" />
                  {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth" data-testid="link-sign-in" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-sm font-normal h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Button>
              </Link>
              <Link href="/auth?tab=signup" data-testid="link-sign-up">
                <Button className="text-sm font-normal h-8 px-3 bg-[#D4A853] text-white hover:bg-[#C49A48] border-none">
                  {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
                </Button>
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-0.5">
          {navLinks.map(({ href, icon: Icon, labelEn, labelAr }) => (
            <Link key={href} href={href}>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-[#D4A853] hover:bg-gray-50 transition-colors text-left"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {lang === "ar" ? labelAr : labelEn}
              </button>
            </Link>
          ))}

          {!user && (
            <Link href="/auth">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#D4A853] border border-[#D4A853]/40 hover:bg-[#D4A853]/10 transition-colors"
              >
                {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              </button>
            </Link>
          )}

          {user && (
            <button
              onClick={() => { signOut(); setLocation("/"); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors mt-2"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
