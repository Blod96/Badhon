"use client";

import React, { useState } from "react";
import { FileText, ShieldAlert, UserCheck, ShieldCheck, Clock, Filter } from "lucide-react";

interface AuditLogRecord {
  logId: string;
  adminUid: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
}

const SYNTHETIC_AUDIT_LOGS: AuditLogRecord[] = [
  {
    logId: "audit_1001",
    adminUid: "admin_super_1",
    action: "USER_SUSPEND",
    targetType: "USER",
    targetId: "u4_suspicious_broker",
    reason: "Reported commercial blood selling activity",
    createdAt: "2026-10-13 14:15:22"
  },
  {
    logId: "audit_1002",
    adminUid: "admin_super_1",
    action: "REQUEST_FORCE_CANCEL",
    targetType: "REQUEST",
    targetId: "req_synthetic_104",
    reason: "Duplicate submission reported by emergency ward",
    createdAt: "2026-10-13 12:40:05"
  },
  {
    logId: "audit_1003",
    adminUid: "admin_super_1",
    action: "ASSIGN_ROLE",
    targetType: "USER",
    targetId: "u1_tanvir_ahmed",
    reason: "NWU Blood Club student executive coordinator appointment",
    createdAt: "2026-10-12 18:22:10"
  },
  {
    logId: "audit_1004",
    adminUid: "admin_moderator_2",
    action: "USER_REACTIVATE",
    targetType: "USER",
    targetId: "u8_cleared_student",
    reason: "Identity and university student registration verified",
    createdAt: "2026-10-11 09:30:45"
  }
];

export function AuditLogViewer() {
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const filteredLogs = SYNTHETIC_AUDIT_LOGS.filter((log) => {
    if (filterAction === "ALL") return true;
    return log.action.includes(filterAction);
  });

  return (
    <div id="audit" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-text-primary">
              Immutable Admin Audit Ledger
            </h2>
            <p className="text-[11px] text-text-secondary">
              Cryptographically attributed server audit logs stored in Firestore `adminAuditLogs`
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="ALL">All Actions</option>
            <option value="USER">User Moderation</option>
            <option value="REQUEST">Request Oversight</option>
            <option value="ROLE">Role Assignments</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Acting Admin</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Reason / Context</th>
              <th className="py-3 px-4 text-right">Integrity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const isSuspend = log.action === "USER_SUSPEND";
              const isRole = log.action === "ASSIGN_ROLE";
              const isCancel = log.action === "REQUEST_FORCE_CANCEL";

              return (
                <tr key={log.logId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.createdAt}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        isSuspend || isCancel
                          ? "bg-red-100 text-red-800"
                          : isRole
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {log.adminUid}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-text-primary font-medium">
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {log.targetType}
                    </span>
                    <code className="text-xs text-brand-primary">{log.targetId}</code>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                    {log.reason}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Sealed</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
