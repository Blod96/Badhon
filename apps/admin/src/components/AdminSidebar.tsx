import React from "react";
import Link from "next/link";
import {
  Droplet,
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  Settings,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

export function AdminSidebar() {
  const navItems = [
    { label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, href: "#overview", active: true },
    { label: "User Management", icon: <Users className="w-4 h-4" />, href: "#users", badge: "6 Active" },
    { label: "Request Moderation", icon: <Activity className="w-4 h-4" />, href: "#requests", badge: "3 Open" },
    { label: "Abuse Reports", icon: <AlertTriangle className="w-4 h-4" />, href: "#reports", badge: "1 Pending", badgeColor: "bg-amber-500" },
    { label: "Audit Logs", icon: <FileText className="w-4 h-4" />, href: "#audit" },
    { label: "System Config", icon: <Settings className="w-4 h-4" />, href: "#settings" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-white leading-tight">
              Badhon Admin
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">
              NWU Moderation Console
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="px-4 py-3">
          <div className="bg-slate-800/80 rounded-xl px-3 py-2 flex items-center space-x-2 border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="text-white font-medium block">Custom Claim: Verified</span>
              <span className="text-slate-400 text-[10px]">Least-Privilege Mode</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                item.active
                  ? "bg-brand-primary text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : item.active
                      ? "bg-red-800 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="text-[10px] text-slate-400 px-3">
          Khulna, Bangladesh • v1.0.0-phase2
        </div>
      </div>
    </aside>
  );
}
