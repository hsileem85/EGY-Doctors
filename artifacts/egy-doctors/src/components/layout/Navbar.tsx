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
    { href: "/vet", icon: null, labelEn: "EGY Vet", labelAr: "إيجي بيطري" },
    { href: "/magazine", icon: Newspaper, labelEn: "Magazine", labelAr: "المجلة" },
    { href: "/about", icon: Info, labelEn: "About", labelAr: "من نحن" },
    { href: "/contact", icon: PhoneCall, labelEn: "Contact Us", labelAr: "تواصل معنا" },
  ];

  return (
    <nav className="bg-[#0F172A] border-b border-[#1E293B] z-50 w-full">
      {/* ── Main row ── */}
      <div className="max-w-5xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo + hotline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5" data-testid="link-home">
            {lang === "ar" ? (
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight font-brand">
                إيجي <span className="text-[#D4A853]">دكتورز</span>
              </span>
            ) : (
              <span className="flex items-center gap-0 text-lg sm:text-xl font-bold tracking-tight font-brand">
                <span className="text-white">EG</span>
                <span className="text-[#D4A853]">Y Doctors</span>
              </span>
            )}
          </Link>
          <div className="hidden sm:flex items-center gap-1 bg-[#1E293B] rounded-full px-2.5 py-1">
            <PhoneCall className="w-3 h-3 text-[#D4A853]" />
            <span className="text-xs font-bold text-white tracking-wide">15992</span>
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
                  className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {href === "/vet" ? (
                    lang === "ar" ? (
                      <><span className="text-white">إيجي</span><span className="text-emerald-400"> بيطري 🐾</span></>
                    ) : (
                      <span className="inline-flex gap-0"><span className="text-white">EG</span><span className="text-emerald-400">Y Vet 🐾</span></span>
                    )
                  ) : (lang === "ar" ? labelAr : labelEn)}
                </Button>
              </Link>
            ))}
          </div>

          <div className="w-px h-6 bg-[#334155] hidden md:block" />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-1 shrink-0"
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
                      <div className="w-full h-full bg-[#D4A853] text-[#0F172A] flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-300 group-hover:text-white transition-colors max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#1E293B] border-[#334155] text-white">
                <div className="px-3 py-3 border-b border-[#334155] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#D4A853] text-[#0F172A] flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role === "medical_center" ? "Medical Center" : user.role === "patient" ? "User" : user.role}</p>
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
                {user.role === "medical_center" && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer hover:bg-[#D4A853]/10 focus:bg-[#D4A853]/10 focus:text-[#D4A853] mt-1"
                    onClick={() => setLocation("/medical-center/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#D4A853]" />
                    {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </DropdownMenuItem>
                )}
                {user.role === "medical_center" && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer hover:bg-[#D4A853]/10 focus:bg-[#D4A853]/10 focus:text-[#D4A853]"
                    onClick={() => setLocation("/medical-center/profile-setup")}
                  >
                    <UserCog className="h-4 w-4 text-[#D4A853]" />
                    {lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
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
                <DropdownMenuSeparator className="bg-[#334155]" />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
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
                  className="text-sm font-normal h-8 px-3 text-gray-300 hover:text-white hover:bg-transparent"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Button>
              </Link>
              <Link href="/auth?tab=signup" data-testid="link-sign-up">
                <Button className="text-sm font-normal h-8 px-3 bg-[#D4A853] text-[#0F172A] hover:bg-[#C49A48] border-none">
                  {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
                </Button>
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1E293B] bg-[#0A1120] px-4 py-3 space-y-0.5">
          {navLinks.map(({ href, icon: Icon, labelEn, labelAr }) => (
            <Link key={href} href={href}>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-[#D4A853] hover:bg-[#1E293B] transition-colors text-left"
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {href === "/vet" ? (
                  lang === "ar" ? (
                    <><span className="text-white">إيجي</span><span className="text-emerald-400"> بيطري 🐾</span></>
                  ) : (
                    <span className="inline-flex gap-0"><span className="text-white">EG</span><span className="text-emerald-400">Y Vet 🐾</span></span>
                  )
                ) : (lang === "ar" ? labelAr : labelEn)}
              </button>
            </Link>
          ))}

          {!user && (
            <Link href="/auth">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#D4A853] border border-[#D4A853]/30 hover:bg-[#D4A853]/10 transition-colors"
              >
                {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              </button>
            </Link>
          )}

          {user && (
            <button
              onClick={() => { signOut(); setLocation("/"); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-2"
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
