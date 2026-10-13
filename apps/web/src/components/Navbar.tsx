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
                className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
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
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {!user && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signInWithGoogle();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
            <Link
              href="#request-modal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-sm"
            >
              Request Blood
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
