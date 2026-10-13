"use client";

import React, { useState } from "react";
import { ReportCategory, ReportStatus } from "@badhon/domain";
import { AlertTriangle, Check, X, ShieldAlert } from "lucide-react";

const SYNTHETIC_REPORTS = [
  {
    reportId: "rep-001",
    targetType: "USER",
    targetId: "u4 (broker123@yahoo.com)",
    category: ReportCategory.COMMERCIAL_BROKER,
    details: "User demanded 2000 BDT cash advance over phone after offering to donate at KMCH.",
    status: ReportStatus.PENDING,
    createdAt: "2026-10-13 17:40"
  }
];

export function ReportsQueue() {
  const [reports, setReports] = useState(SYNTHETIC_REPORTS);

  const resolveReport = (reportId: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.reportId === reportId ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div id="reports" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h2 className="font-display font-bold text-sm text-text-primary">
            Community Abuse & Commercial Broker Reports
          </h2>
        </div>
        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          {reports.filter(r => r.status === ReportStatus.PENDING).length} Pending Review
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {reports.map((report) => (
          <div key={report.reportId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold">
                  {report.category}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Target: <strong className="text-text-primary">{report.targetId}</strong>
                </span>
                <span className="text-[11px] text-slate-400">• {report.createdAt}</span>
              </div>
              <p className="text-xs text-text-primary bg-slate-50 p-3 rounded-xl border border-slate-200">
                &ldquo;{report.details}&rdquo;
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {report.status === ReportStatus.PENDING ? (
                <>
                  <button
                    type="button"
                    onClick={() => resolveReport(report.reportId, ReportStatus.RESOLVED)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Suspend & Resolve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveReport(report.reportId, ReportStatus.DISMISSED)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {report.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            No pending community reports.
          </div>
        )}
      </div>
    </div>
  );
}
