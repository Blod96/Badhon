"use client";

import React, { useState, useEffect } from "react";
import { BloodGroup, BloodGroupLabels, AffiliationType, AccountStatus } from "@badhon/domain";
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface ManagedUser {
  uid: string;
  displayName: string;
  email: string;
  bloodGroup: BloodGroup;
  affiliationType: AffiliationType;
  department: string;
  status: AccountStatus;
  affiliationVerified: boolean;
}

export function UserModerationTable() {
  const [users, setUsers] = useState<ManagedUser[]>([]);

  useEffect(() => {
    try {
      const q = collection(db, "users");
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ManagedUser[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              uid: d.id,
              displayName: data.displayName || "User",
              email: data.email || "No email",
              bloodGroup: (data.bloodGroup as BloodGroup) || BloodGroup.O_POSITIVE,
              affiliationType: (data.affiliationType as AffiliationType) || AffiliationType.EXTERNAL,
              department: data.department || (data.affiliationType === AffiliationType.NWU_MEMBER ? "NWU Member" : "General"),
              status: (data.status as AccountStatus) || AccountStatus.ACTIVE,
              affiliationVerified: data.affiliationVerified ?? false
            };
          });
          setUsers(list);
        },
        (err) => {
          console.debug("Firestore users listener inactive:", err);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  const toggleStatus = async (uid: string) => {
    const targetUser = users.find((u) => u.uid === uid);
    if (!targetUser) return;
    const nextStatus =
      targetUser.status === AccountStatus.ACTIVE
        ? AccountStatus.SUSPENDED
        : AccountStatus.ACTIVE;

    try {
      await updateDoc(doc(db, "users", uid), {
        status: nextStatus
      });
    } catch (err) {
      console.warn("Failed to update user status in Firestore:", err);
      setUsers((prev) =>
        prev.map((user) => {
          if (user.uid === uid) {
            return { ...user, status: nextStatus };
          }
          return user;
        })
      );
    }
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
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No registered users in the database yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
