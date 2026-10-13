"use client";

import React, { useState } from "react";
import { BloodGroup, BloodGroupLabels, AffiliationType, AccountStatus } from "@badhon/domain";
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck } from "lucide-react";

const SYNTHETIC_USERS = [
  {
    uid: "u1",
    displayName: "Tanvir Ahmed",
    email: "tanvir.cse@nwu.edu.bd",
    bloodGroup: BloodGroup.O_POSITIVE,
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "CSE",
    status: AccountStatus.ACTIVE,
    affiliationVerified: true
  },
  {
    uid: "u2",
    displayName: "Nusrat Jahan",
    email: "nusrat.bba@nwu.edu.bd",
    bloodGroup: BloodGroup.A_POSITIVE,
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "BBA Faculty",
    status: AccountStatus.ACTIVE,
    affiliationVerified: true
  },
  {
    uid: "u3",
    displayName: "Rashedul Karim",
    email: "rashedul@gmail.com",
    bloodGroup: BloodGroup.B_POSITIVE,
    affiliationType: AffiliationType.EXTERNAL,
    department: "External Donor",
    status: AccountStatus.ACTIVE,
    affiliationVerified: false
  },
  {
    uid: "u4",
    displayName: "Suspicious Broker Account",
    email: "broker123@yahoo.com",
    bloodGroup: BloodGroup.AB_POSITIVE,
    affiliationType: AffiliationType.EXTERNAL,
    department: "Unverified",
    status: AccountStatus.SUSPENDED,
    affiliationVerified: false
  }
];

export function UserModerationTable() {
  const [users, setUsers] = useState(SYNTHETIC_USERS);

  const toggleStatus = (uid: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.uid === uid) {
          return {
            ...user,
            status:
              user.status === AccountStatus.ACTIVE
                ? AccountStatus.SUSPENDED
                : AccountStatus.ACTIVE
          };
        }
        return user;
      })
    );
  };

  return (
    <div id="users" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-sm text-text-primary">
            User Management & Moderation
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Review user account status, NWU affiliation badges, and moderation flags.
          </p>
        </div>
        <span className="text-xs font-semibold text-text-secondary bg-slate-100 px-2.5 py-1 rounded-lg">
          {users.length} Users Listed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">User & Email</th>
              <th className="px-6 py-3">Blood Group</th>
              <th className="px-6 py-3">Affiliation</th>
              <th className="px-6 py-3">Verification</th>
              <th className="px-6 py-3">Account Status</th>
              <th className="px-6 py-3 text-right">Moderation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="font-semibold text-text-primary">
                    {user.displayName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-red-50 text-brand-primary border border-red-100">
                    {BloodGroupLabels[user.bloodGroup]}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-text-primary font-medium block">
                    {user.affiliationType === AffiliationType.NWU_MEMBER
                      ? "North Western Univ"
                      : "External"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {user.department}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  {user.affiliationVerified ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified NWU</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px]">
                      <span>Self-Declared</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.status === AccountStatus.ACTIVE
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => toggleStatus(user.uid)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                      user.status === AccountStatus.ACTIVE
                        ? "text-red-700 bg-red-50 hover:bg-red-100"
                        : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                  >
                    {user.status === AccountStatus.ACTIVE ? "Suspend User" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
