import { Link, useLocation } from "react-router-dom";
import { Eye, Menu, X, Phone, Mail, Facebook, Instagram, MessageCircle, Clock, MapPin, ChevronDown, Contact, Baby, Glasses, Activity, Monitor, Stethoscope, Shield, Microscope, Search, HeartPulse, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/satome/logo.png";
import { useAuth } from "@/hooks/useAuth";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const { user, isStaff } = useAuth();
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  const serviceDropdownItems = [
    { name: "Comprehensive Eye Exams", path: "/services#eye-exams", icon: Eye },
    { name: "Contact Lens Fitting", path: "/services#contact-lenses", icon: Contact },
    { name: "Pediatric & Myopia Control", path: "/services#pediatric", icon: Baby },
    { name: "Designer Eyewear", path: "/services#glasses", icon: Glasses },
    { name: "Glaucoma & Cataract Screening", path: "/services#screening", icon: Activity },
    { name: "Digital Eye Strain Therapy", path: "/services#primary-services", icon: Monitor },
    { name: "Diabetic Retinopathy Check", path: "/services#primary-services", icon: Stethoscope },
    { name: "Emergency Eye Care", path: "/services#primary-services", icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Info Bar */}
      <div className="bg-primary text-primary-foreground text-xs md:text-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-10 gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Mon–Fri: 8AM–6PM &nbsp;|&nbsp; Sat: 9AM–2PM
              </span>
            </div>
            <a
              href="https://wa.me/2348059070153"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full font-semibold text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
        <nav className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="relative w-12 h-12 rounded-lg bg-white shadow-sm overflow-hidden flex items-center justify-center border border-border">
                  <img src={logo} alt="Satome Eye Clinic" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground tracking-tight">SATOME</h1>
                <p className="text-sm font-semibold text-primary">EYE CLINIC</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 6).map((link) => {
                if (link.name === "Services") {
                  return (
                    <div
                      key={link.path}
                      className="relative group/services"
                      ref={servicesDropdownRef}
                    >
                      <Link
                        to={link.path}
                        className={`text-sm font-semibold transition-all relative inline-flex items-center gap-1 ${isActive(link.path) ? "text-primary" : "text-foreground hover:text-primary"}`}
                      >
                        {link.name}
                        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/services:rotate-180" />
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isActive(link.path) ? "w-full" : "w-0 group-hover/services:w-full"}`}></span>
                      </Link>

                      {/* Dropdown */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/services:opacity-100 group-hover/services:visible transition-all duration-300 z-50">
                        <div className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl p-4 min-w-[650px] ring-1 ring-black/5">
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-1 pb-3 border-b border-border/40 mb-3 text-center">
                            Our Core & Specialized Services
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {serviceDropdownItems.map((service) => {
                              const Icon = service.icon;
                              return (
                                <Link
                                  key={service.path + service.name}
                                  to={service.path}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-200 group/item border border-transparent hover:border-primary/20"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:scale-110 transition-all duration-300">
                                    <Icon className="w-5 h-5 text-primary group-hover/item:text-primary-foreground transition-colors" />
                                  </div>
                                  <span className="leading-tight">{service.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                          <div className="border-t border-border/40 mt-3 pt-3 px-3 pb-1">
                            <Link
                              to="/services"
                              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-all duration-200"
                            >
                              Explore All Services
                              <ChevronDown className="w-4 h-4 -rotate-90 flex-shrink-0 mt-0.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold transition-all relative group ${isActive(link.path) ? "text-primary" : "text-foreground hover:text-primary"
                      }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Link to={isStaff ? "/admin" : "/patient/dashboard"}>Dashboard</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Link to="/login">Login</Link>
                </Button>
              )}
              <Button asChild size="default" className="shadow-lg">
                <Link to="/book">Book Appointment</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-primary-light rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-border mt-2 pt-4 animate-in slide-in-from-top">
              {navLinks.map((link) => {
                if (link.name === "Services") {
                  return (
                    <div key={link.path}>
                      <button
                        className={`flex items-center justify-between w-full py-3 px-4 text-sm font-semibold rounded-xl transition-colors ${
                          isActive(link.path) ? "text-primary bg-primary-light" : "text-foreground hover:bg-primary-light hover:text-primary"
                        }`}
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileServicesOpen && (
                        <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-1 py-2 animate-in slide-in-from-top-2">
                          {serviceDropdownItems.map((service) => {
                            const Icon = service.icon;
                            return (
                              <Link
                                key={service.path + service.name}
                                to={service.path}
                                className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileServicesOpen(false);
                                }}
                              >
                                <Icon className="w-4 h-4 text-primary" />
                                <span>{service.name}</span>
                              </Link>
                            );
                          })}
                          <Link
                            to="/services"
                            className="flex items-center gap-2 py-2.5 px-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileServicesOpen(false);
                            }}
                          >
                            View All Services
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-3 px-4 text-sm font-semibold rounded-xl transition-colors ${isActive(link.path) ? "text-primary bg-primary-light" : "text-foreground hover:bg-primary-light hover:text-primary"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="mt-3 pt-3 border-t border-border space-y-2 px-4">
                <Button asChild size="default" className="w-full shadow-lg">
                  <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>Book Appointment</Link>
                </Button>
                {user ? (
                  <Button asChild variant="outline" size="default" className="w-full">
                    <Link to={isStaff ? "/admin" : "/patient/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="default" className="w-full">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-auto">
        <div className="relative container mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-lg bg-white shadow-sm overflow-hidden flex items-center justify-center border border-border">
                    <img src={logo} alt="Satome Eye Clinic" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">SATOME</h3>
                  <p className="text-sm font-semibold text-primary">EYE CLINIC</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
                Benin City's most trusted optometry clinic — delivering comprehensive eye care, designer eyewear, and advanced diagnostics for the whole family since 2009.
              </p>
              <div className="flex items-start gap-2 text-xs text-muted-foreground mb-8">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City 300271, Edo</span>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </a>
                <a
                  href="https://wa.me/2348059070153"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-base mb-6 text-foreground">Quick Links</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/book"
                    className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                  >
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-base mb-6 text-foreground">Contact</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all">
                    <Phone className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <a href="tel:+2348059070153" className="hover:text-primary transition-colors">
                    0805 907 0153
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all">
                    <Mail className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <a href="mailto:info@satomeeyeclinic.com" className="hover:text-primary transition-colors">
                    info@satomeeyeclinic.com
                  </a>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all">
                    <Eye className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span>32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City 300271, Edo</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Satome Eye Clinic. All rights reserved.
              </p>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Mon-Fri:</span> 8:00 AM - 6:00 PM | <span className="font-semibold text-foreground">Sat:</span> 9:00 AM - 2:00 PM
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
