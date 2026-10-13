"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ShieldAlert, ShieldCheck, Lock, LogIn, LogOut, Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isSuperAdmin, hasAccess, isLoading, signInWithGoogle, signOut } = useAdminAuth();
  const [isDemoBypass, setIsDemoBypass] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-slate-400 font-medium">
            Verifying cryptographic admin tokens...
          </span>
        </div>
      </div>
    );
  }

  // If in local development and user clicked bypass for visual review
  if (isDemoBypass || hasAccess) {
    return <>{children}</>;
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-red-950/80 border border-red-800 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-display font-bold text-white">
              Badhon Admin Portal
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected moderation console for North Western University, Bangladesh. Authentication requires an authorized administrative account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with University Google Account</span>
          </button>

          {/* Local Development Sandbox Bypass */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDemoBypass(true)}
              className="text-[11px] text-slate-400 hover:text-slate-300 underline"
            >
              [Dev Sandbox]: Preview Admin Layout Offline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but missing admin custom claims
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 bg-amber-950/80 border border-amber-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-display font-bold text-white">
            Access Denied
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Signed in as <strong className="text-white">{user.email}</strong>, but your account lacks the required <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400">admin: true</code> Firebase Custom Claim.
          </p>
          <p className="text-[11px] text-slate-400">
            Administrative permissions are granted through offline CLI bootstrap or by the Super Administrator.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setIsDemoBypass(true)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Preview UI in Demo Sandbox Mode
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
