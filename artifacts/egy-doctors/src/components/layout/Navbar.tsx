import { Newspaper, Info, ShieldCheck, LogOut, UserCog, LayoutDashboard, CalendarDays, Home, PhoneCall } from "lucide-react";
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

  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  return (
    <nav className="bg-[#0F172A] border-b border-[#1E293B] z-50 w-full">
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5" data-testid="link-home">
            {lang === "ar" ? (
              <span className="text-xl font-bold text-white tracking-tight font-brand">
                إجي <span className="text-[#D4A853]">دكتورز</span>
              </span>
            ) : (
              <span className="flex items-center gap-0 text-xl font-bold tracking-tight font-brand">
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
        <div className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Home className="h-4 w-4 mr-1" />
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Button>
            </Link>
            <Link href="/magazine">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Newspaper className="h-4 w-4 mr-1" />
                {lang === "ar" ? "المجلة" : "Magazine"}
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <Info className="h-4 w-4 mr-1" />
                {lang === "ar" ? "من نحن" : "About"}
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <PhoneCall className="h-4 w-4 mr-1" />
                {lang === "ar" ? "تواصل معنا" : "Contact Us"}
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                className="text-sm font-normal h-8 px-3 text-gray-400 hover:text-[#D4A853] hover:bg-transparent"
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                {lang === "ar" ? "الإدارة" : "Admin"}
              </Button>
            </Link>
          </div>

          <div className="w-px h-6 bg-[#334155] hidden md:block" />

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            data-testid="button-toggle-language"
            className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-1"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>

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
                    <p className="text-xs text-gray-400 capitalize">{user.role === "medical_center" ? "Medical Center" : user.role}</p>
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
              <Link href="/auth" data-testid="link-sign-in">
                <Button
                  variant="ghost"
                  className="text-sm font-normal hidden sm:inline-flex h-8 px-3 text-gray-300 hover:text-white hover:bg-transparent"
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
        </div>
      </div>
    </nav>
  );
}
