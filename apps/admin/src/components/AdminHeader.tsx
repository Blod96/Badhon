import React from "react";
import { Bell, Search, Shield, User } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-surface-muted px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donors, users, or requests..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Admin Profile & Notifications */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Pending notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-primary absolute top-1.5 right-1.5" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Authenticated Admin Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary font-bold text-xs">
            NWU
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-text-primary leading-tight">
              Dr. Asif Mahmud
            </span>
            <span className="text-[10px] text-text-secondary font-medium flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5 text-brand-primary" />
              <span>NWU Moderator</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
