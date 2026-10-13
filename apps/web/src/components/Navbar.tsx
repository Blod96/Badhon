"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Droplet, HeartHandshake, ShieldCheck, Menu, X, PhoneCall, LogIn, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, signInWithGoogle, signOut, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-200">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-text-primary tracking-tight">
                Badhon <span className="text-brand-primary">বাঁধন</span>
              </span>
              <span className="block text-xs font-medium text-text-secondary">
                NWU Blood Connect • Khulna
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-text-secondary">
            <Link href="#directory" className="hover:text-brand-primary transition-colors">
              Find Donors
            </Link>
            <Link href="#requests" className="hover:text-brand-primary transition-colors">
              Urgent Requests
            </Link>
            <Link href="#how-it-works" className="hover:text-brand-primary transition-colors">
              How It Works
            </Link>
            <Link href="#guidance" className="hover:text-brand-primary transition-colors">
              Hospital Help
            </Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="tel:999"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-text-secondary bg-surface-muted hover:bg-slate-200 rounded-lg transition-colors"
              title="National Emergency Service"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-primary" />
              <span>999</span>
            </a>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-brand-surface rounded-xl border border-brand-border">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {userProfile?.bloodGroup ? userProfile.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") : "B+"}
                  </div>
                  <span className="text-xs font-semibold text-text-primary max-w-[120px] truncate">
                    {user.displayName || "Donor"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={isLoading}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-text-primary bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-primary" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="#request-modal"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-sm transition-colors duration-150 active:scale-[0.98]"
            >
              Request Blood
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-muted bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="#directory"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-muted"
          >
            Find Donors
          </Link>
          <Link
            href="#requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-muted"
          >
            Urgent Requests
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-muted"
          >
            How It Works
          </Link>
          <Link
            href="#guidance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-muted"
          >
            Hospital Help
          </Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            <Link
              href="#request-modal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover shadow-sm"
            >
              Request Blood
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
