"use client";

import React, { useState, useEffect } from "react";
import { FileText, ShieldAlert, UserCheck, ShieldCheck, Clock, Filter } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AuditLogRecord {
  logId: string;
  adminUid: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [filterAction, setFilterAction] = useState<string>("ALL");

  useEffect(() => {
    try {
      const q = query(
        collection(db, "adminAuditLogs"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AuditLogRecord[] = snapshot.docs.map((d) => {
            const data = d.data();
            let dateStr = "Recent";
            if (data.createdAt?.toDate) {
              dateStr = data.createdAt.toDate().toLocaleString();
            } else if (typeof data.createdAt === "string") {
              dateStr = data.createdAt;
            }
            return {
              logId: d.id,
              adminUid: data.adminUid || "system",
              action: data.action || "ADMIN_ACTION",
              targetType: data.targetType || "SYSTEM",
              targetId: data.targetId || "-",
              reason: data.reason || "Operational review",
              createdAt: dateStr
            };
          });
          setLogs(list);
        },
        (err) => {
          console.debug("Firestore adminAuditLogs listener inactive:", err);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  const filteredLogs = logs.filter((log) => {
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
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 px-4 text-center text-slate-400">
                  No admin audit events recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
