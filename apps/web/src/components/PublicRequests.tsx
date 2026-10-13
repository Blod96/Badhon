"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { BloodGroup, BloodGroupLabels, Urgency, RequestStatus } from "@badhon/domain";
import { AlertCircle, Clock, Hospital, MapPin, Users, HeartHandshake, Plus } from "lucide-react";
import { db } from "../lib/firebase";
import { CreateRequestModal } from "./CreateRequestModal";

export interface PublicRequestItem {
  requestId: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  hospitalAddress: string;
  district: string;
  upazila: string;
  urgency: Urgency;
  neededAt: string;
  status: RequestStatus;
  clinicalDetails: string;
}

export function PublicRequests() {
  const [requests, setRequests] = useState<PublicRequestItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "requestPublic"), where("status", "==", "OPEN"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setIsLoading(false);
          const liveList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              requestId: doc.id,
              bloodGroup: data.bloodGroup as BloodGroup,
              unitsNeeded: data.unitsNeeded || 1,
              hospitalName: data.hospitalName || "Hospital in Khulna",
              hospitalAddress: data.hospitalAddress || "",
              district: data.district || "Khulna",
              upazila: data.upazila || "Sonadanga",
              urgency: (data.urgency || Urgency.EMERGENCY) as Urgency,
              neededAt: data.neededAt?.toDate ? data.neededAt.toDate().toLocaleString() : String(data.neededAt || "Urgent"),
              status: data.status as RequestStatus,
              clinicalDetails: data.clinicalDetails || ""
            };
          });
          setRequests(liveList);
        },
        (err) => {
          console.debug("Firestore live request stream inactive.", err);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setIsLoading(false);
    }
  }, []);

  return (
    <section id="requests" className="py-12 bg-surface-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-surface-muted gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-red-100 border border-red-200 text-red-800 rounded-md text-xs font-semibold mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-brand-primary" />
              <span>Real-Time Regional Hospital Needs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
              Active Blood Requests
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Sanitized summaries of verified emergency needs across hospitals in Khulna.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post Blood Request</span>
            </button>
            <div className="hidden sm:block text-xs text-text-secondary">
              <span className="font-semibold text-brand-primary">
                {requests.filter(r => r.urgency === Urgency.EMERGENCY).length} Critical
              </span>{" "}
              needs today
            </div>
          </div>
        </div>

        {/* Request Cards Grid or Empty State */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">বর্তমানে কোনো জরুরি রক্তের আবেদন নেই</h3>
              <p className="text-xs text-slate-500">
                কোনো রক্তের প্রয়োজনে আপনি এখনই সরাসরি নতুন রিকোয়েস্ট পোস্ট করতে পারেন।
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post Blood Request</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => {
            const isCritical = req.urgency === Urgency.EMERGENCY;
            const isUrgent = req.urgency === Urgency.URGENT;

            return (
              <div
                key={req.requestId}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                  isCritical
                    ? "border-red-300 ring-1 ring-red-200"
                    : isUrgent
                    ? "border-amber-200"
                    : "border-surface-muted"
                }`}
              >
                <div>
                  {/* Top Bar: Urgency badge & Needed Bags */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-red-600 text-white animate-pulse"
                          : isUrgent
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {req.urgency}
                    </span>

                    <span className="text-xs font-semibold text-text-secondary bg-surface-muted px-2.5 py-1 rounded-lg">
                      {req.unitsNeeded} {req.unitsNeeded === 1 ? "Bag" : "Bags"} Needed
                    </span>
                  </div>

                  {/* Blood Group Display & Hospital */}
                  <div className="flex items-start space-x-3.5 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-display font-extrabold text-xl shadow-sm shrink-0">
                      {BloodGroupLabels[req.bloodGroup] || req.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary leading-snug">
                        {req.hospitalName}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-text-secondary mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {req.upazila}, {req.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Context Note */}
                  {req.clinicalDetails && (
                    <div className="bg-surface-bg p-3 rounded-xl text-xs text-text-secondary mb-4 border border-surface-muted">
                      <span className="font-medium text-text-primary block mb-0.5">
                        Clinical Context:
                      </span>
                      {req.clinicalDetails}
                    </div>
                  )}

                  {/* Deadline info */}
                  <div className="flex items-center space-x-1.5 text-xs text-text-secondary pb-3">
                    <Clock className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="font-medium text-text-primary">
                      Required: {req.neededAt}
                    </span>
                  </div>
                </div>

                {/* Footer action button */}
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href="#respond-modal"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-sm transition-colors active:scale-[0.98]"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>I Can Donate (Sign In)</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
}
