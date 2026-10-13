"use client";

import React, { useState } from "react";
import { BloodGroup, BloodGroupLabels, Urgency, RequestStatus } from "@badhon/domain";
import { AlertCircle, Ban, CheckCircle } from "lucide-react";

const SYNTHETIC_REQUESTS = [
  {
    requestId: "req-101",
    requesterName: "Kamrul Islam",
    hospitalName: "Khulna Medical College Hospital (KMCH)",
    bloodGroup: BloodGroup.B_POSITIVE,
    unitsNeeded: 2,
    urgency: Urgency.EMERGENCY,
    status: RequestStatus.OPEN,
    createdAt: "2026-10-13 18:30"
  },
  {
    requestId: "req-102",
    requesterName: "Dr. Nazmul Huda",
    hospitalName: "Gazi Medical College Hospital",
    bloodGroup: BloodGroup.O_NEGATIVE,
    unitsNeeded: 1,
    urgency: Urgency.URGENT,
    status: RequestStatus.IN_PROGRESS,
    createdAt: "2026-10-13 14:15"
  },
  {
    requestId: "req-103",
    requesterName: "Shorif Hossain",
    hospitalName: "Khulna City Medical College",
    bloodGroup: BloodGroup.A_POSITIVE,
    unitsNeeded: 2,
    urgency: Urgency.NORMAL,
    status: RequestStatus.OPEN,
    createdAt: "2026-10-13 11:00"
  }
];

export function RequestModerationTable() {
  const [requests, setRequests] = useState(SYNTHETIC_REQUESTS);

  const forceCancel = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.requestId === requestId) {
          return { ...req, status: RequestStatus.CANCELLED };
        }
        return req;
      })
    );
  };

  return (
    <div id="requests" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-sm text-text-primary">
            Emergency Blood Request Moderation
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Inspect active requests and intervene if requests are reported fraudulent or commercialized.
          </p>
        </div>
        <span className="text-xs font-semibold text-text-secondary bg-slate-100 px-2.5 py-1 rounded-lg">
          {requests.filter(r => r.status !== RequestStatus.CANCELLED).length} Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Hospital & Requester</th>
              <th className="px-6 py-3">Blood Group</th>
              <th className="px-6 py-3">Bags Needed</th>
              <th className="px-6 py-3">Urgency</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Moderation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.requestId} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="font-semibold text-text-primary">
                    {req.hospitalName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Requester: {req.requesterName} • {req.createdAt}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-red-50 text-brand-primary border border-red-100">
                    {BloodGroupLabels[req.bloodGroup]}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-medium text-text-primary">
                  {req.unitsNeeded} Bags
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      req.urgency === Urgency.EMERGENCY
                        ? "bg-red-100 text-red-800"
                        : req.urgency === Urgency.URGENT
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {req.urgency}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      req.status === RequestStatus.OPEN
                        ? "bg-emerald-50 text-emerald-700"
                        : req.status === RequestStatus.IN_PROGRESS
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  {req.status !== RequestStatus.CANCELLED ? (
                    <button
                      type="button"
                      onClick={() => forceCancel(req.requestId)}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Force Cancel
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Cancelled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
