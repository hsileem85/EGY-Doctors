import { Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">EGY Doctors</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" data-testid="link-search">
            Search Doctors
          </Link>
          <Link href="/dashboard" data-testid="link-dashboard">
            <Button variant="outline" className="font-medium">
              Doctor Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
