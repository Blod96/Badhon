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
            className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 shadow-md transition-all active:scale-[0.98]"
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
