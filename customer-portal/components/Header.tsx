// components/Header.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogIn, Menu, X, Home, User, LogOut, Package, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-3 text-xl font-black text-white hover:text-emerald-200 transition-all duration-300 group"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:from-emerald-600 group-hover:to-cyan-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-white font-bold text-lg">S&S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                    S&S Logistics
                  </span>
                  <span className="text-xs text-emerald-300 font-normal opacity-80">
                    Premium Logistics
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-white hover:text-emerald-300 transition-all duration-300 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
              >
                <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                Home
              </Link>
              <Link 
                href="/services" 
                className="flex items-center gap-2 text-white hover:text-emerald-300 transition-all duration-300 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
              >
                <Package className="h-4 w-4 transition-transform group-hover:scale-110" />
                Our Services
              </Link>
              <Link 
                href="/track" 
                className="flex items-center gap-2 text-white hover:text-emerald-300 transition-all duration-300 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
              >
                <MapPin className="h-4 w-4 transition-transform group-hover:scale-110" />
                Track Delivery
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center gap-2 text-white hover:text-emerald-300 transition-all duration-300 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
              >
                <Phone className="h-4 w-4 transition-transform group-hover:scale-110" />
                Contact
              </Link>
            </div>
            
            {/* Desktop User Section */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              {backendUser ? (
                <div className="flex items-center space-x-3">
                  {/* Welcome Message */}
                  <div className="text-white text-sm bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 shadow-lg">
                    <span className="text-emerald-200">Welcome, </span>
                    <span className="font-semibold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                      {backendUser.first_name}
                    </span>
                  </div>
                  
                  {/* User Menu Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Account</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                          <p className="text-white font-semibold text-sm">
                            {backendUser.first_name} {backendUser.last_name}
                          </p>
                          <p className="text-gray-400 text-xs">{backendUser.email}</p>
                        </div>
                        <Link 
                          href="/my-jobs" 
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <Package className="h-4 w-4" />
                          My Shipments
                        </Link>
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <User className="h-4 w-4" />
                          Profile Settings
                        </Link>
                        <div className="border-t border-white/10 mt-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
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
                /* Desktop Login Button */
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25 group border-0"
                >
                  <LogIn className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Log In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              {backendUser ? (
                /* Mobile User Info */
                <div className="flex items-center space-x-2">
                  <div className="text-white text-xs bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5">
                    <span className="text-emerald-200">Hi, </span>
                    <span className="font-semibold">
                      {backendUser.first_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Mobile Login Button */
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg border-0"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="ml-1 text-xs">Login</span>
                </Button>
              )}
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 pb-4 border-t border-white/20 pt-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
              <div className="flex flex-col space-y-2 p-4">
                {backendUser && (
                  <div className="text-center text-white mb-4 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border border-white/20">
                    <p className="text-sm text-emerald-200">Welcome back,</p>
                    <p className="font-semibold text-lg">
                      {backendUser.first_name} {backendUser.last_name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">{backendUser.email}</p>
                  </div>
                )}
                
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  onClick={closeMobileMenu}
                >
                  <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Home
                </Link>
                <Link 
                  href="/services" 
                  className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  onClick={closeMobileMenu}
                >
                  <Package className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Our Services
                </Link>
                <Link 
                  href="/track" 
                  className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  onClick={closeMobileMenu}
                >
                  <MapPin className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Track Delivery
                </Link>
                
                {backendUser && (
                  <>
                    <Link 
                      href="/my-jobs" 
                      className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                      onClick={closeMobileMenu}
                    >
                      <Package className="h-4 w-4 transition-transform group-hover:scale-110" />
                      My Shipments
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Profile Settings
                    </Link>
                  </>
                )}
                
                <Link 
                  href="/contact" 
                  className="flex items-center justify-center gap-3 text-white hover:text-emerald-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  onClick={closeMobileMenu}
                >
                  <Phone className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Contact Us
                </Link>
                
                {backendUser && (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 text-red-400 hover:text-red-300 transition-all duration-300 font-semibold py-3 px-4 rounded-xl hover:bg-red-500/10 backdrop-blur-sm border border-transparent hover:border-red-500/20 group"
                  >
                    <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                    Log Out
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}