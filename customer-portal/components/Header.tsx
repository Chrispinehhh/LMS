// components/Header.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogIn, Menu, X, Home, User, LogOut, Package, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { backendUser, logout } = useAuth();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Theme-aware styles
  const isTransparent = !isScrolled && !isDashboard;
  const textColor = 'text-foreground';
  const logoGradient = 'from-primary to-emerald-600';
  const hoverBg = 'hover:bg-accent';
  const borderColor = isTransparent ? 'border-transparent hover:border-border' : 'border-transparent hover:border-border';

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${!isTransparent
        ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
        : 'bg-transparent'
        }`}>
        <nav className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={`flex items-center gap-3 text-xl font-black text-foreground hover:text-primary transition-all duration-300 group`}
                onClick={closeMobileMenu}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:from-emerald-600 group-hover:to-cyan-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-white font-bold text-lg">S&S</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}>
                    S&S Logistics
                  </span>
                  <span className={`text-xs text-muted-foreground font-normal opacity-80`}>
                    Premium Logistics
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {[
                { href: '/', icon: Home, label: 'Home' },
                { href: '/services', icon: Package, label: 'Our Services' },
                { href: '/track', icon: MapPin, label: 'Track Delivery' },
                { href: '/contact', icon: Phone, label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 ${textColor} hover:text-primary transition-all duration-300 font-semibold text-sm px-5 py-3 rounded-xl ${hoverBg} backdrop-blur-sm border ${borderColor} group`}
                >
                  <link.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop User Section */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              <ModeToggle />

              {backendUser ? (
                <div className="flex items-center space-x-3">
                  {/* Welcome Message */}
                  <div className={`text-sm bg-muted border-border backdrop-blur-sm border rounded-xl px-4 py-2.5 shadow-sm`}>
                    <span className="text-muted-foreground">Welcome, </span>
                    <span className={`font-semibold text-foreground`}>
                      {backendUser.first_name}
                    </span>
                  </div>

                  {/* User Menu Dropdown */}
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 ${textColor} ${hoverBg} backdrop-blur-sm border border-transparent hover:border-border rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm hover:shadow-md`}>
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Account</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-border mb-2">
                          <p className="text-foreground font-semibold text-sm">
                            {backendUser.first_name} {backendUser.last_name}
                          </p>
                          <p className="text-muted-foreground text-xs">{backendUser.email}</p>
                        </div>
                        <Link
                          href="/my-jobs"
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors group"
                        >
                          <Package className="h-4 w-4" />
                          My Shipments
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors group"
                        >
                          <User className="h-4 w-4" />
                          Profile Settings
                        </Link>
                        <div className="border-t border-border mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group"
                          >
                            <LogOut className="h-4 w-4" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg group border-0"
                >
                  <LogIn className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Log In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <ModeToggle />

              {backendUser ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-lg ${hoverBg} backdrop-blur-sm border border-transparent hover:border-border text-foreground transition-all duration-300`}
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg border-0"
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg ${hoverBg} backdrop-blur-sm border border-transparent hover:border-border text-foreground transition-all duration-300`}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 pb-4 border-t border-border pt-4 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl">
              <div className="flex flex-col space-y-2 p-4">
                {backendUser && (
                  <div className="text-center mb-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-sm text-primary">Welcome back,</p>
                    <p className="font-semibold text-lg text-foreground">
                      {backendUser.first_name} {backendUser.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{backendUser.email}</p>
                  </div>
                )}

                {[
                  { href: '/', icon: Home, label: 'Home' },
                  { href: '/services', icon: Package, label: 'Our Services' },
                  { href: '/track', icon: MapPin, label: 'Track Delivery' },
                  { href: '/contact', icon: Phone, label: 'Contact Us' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-accent backdrop-blur-sm border border-transparent hover:border-border group"
                    onClick={closeMobileMenu}
                  >
                    <link.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {link.label}
                  </Link>
                ))}

                {backendUser && (
                  <>
                    <Link
                      href="/my-jobs"
                      className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-accent backdrop-blur-sm border border-transparent hover:border-border group"
                      onClick={closeMobileMenu}
                    >
                      <Package className="h-4 w-4 transition-transform group-hover:scale-110" />
                      My Shipments
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-accent backdrop-blur-sm border border-transparent hover:border-border group"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-3 text-red-500 hover:text-red-600 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 backdrop-blur-sm border border-transparent hover:border-red-500/20 group mt-2"
                    >
                      <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header >
    </>
  );
}