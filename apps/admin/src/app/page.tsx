import React from "react";
import { StatsCards } from "@/components/StatsCards";
import { UserModerationTable } from "@/components/UserModerationTable";
import { RequestModerationTable } from "@/components/RequestModerationTable";
import { ReportsQueue } from "@/components/ReportsQueue";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { ShieldCheck, Activity, FileText } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Executive Overview & Moderation Queue
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            North Western University (NWU), Khulna — Live Campus Coordination Operations
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            Backend Active (Phase 2 Preview)
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards />

      {/* Priority Section: Reports Queue */}
      <ReportsQueue />

      {/* Requests Moderation Section */}
      <RequestModerationTable />

      {/* Users & Donors Management Section */}
      <UserModerationTable />

      {/* Immutable Audit Log Viewer */}
      <AuditLogViewer />

      {/* Audit Log Overview Banner */}
      <div id="audit" className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-primary" />
            <h3 className="font-display font-bold text-sm text-white">
              Immutable Admin Audit Log Active
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            All user suspensions, request cancellations, and custom claim changes are cryptographically attributed to the acting administrator&apos;s UID and logged in Firestore `adminAuditLogs`.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-700 shrink-0"
        >
          View Full JSON Audit Log
        </button>
      </div>
    </div>
  );
}
