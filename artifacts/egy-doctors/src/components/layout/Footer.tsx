export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-gray-900">EGY Doctors</p>
          <p className="text-xs text-gray-500 mt-1">
            &copy; {new Date().getFullYear()} EGY Doctors. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-terms">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-contact">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
