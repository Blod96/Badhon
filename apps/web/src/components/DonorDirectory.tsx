"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { BloodGroup, BloodGroupLabels, AffiliationType } from "@badhon/domain";
import { Search, MapPin, CheckCircle2, Clock, ShieldCheck, UserCheck } from "lucide-react";
import { db } from "../lib/firebase";


// Clearly labeled synthetic donor records for Phase 2 UI prototype
const SYNTHETIC_DONORS = [
  {
    uid: "d1",
    displayName: "Tanvir Ahmed",
    bloodGroup: BloodGroup.O_POSITIVE,
    district: "Khulna",
    upazila: "Sonadanga",
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "CSE, 8th Sem",
    isAvailable: true,
    isEligible: true,
    verifiedBadge: true
  },
  {
    uid: "d2",
    displayName: "Nusrat Jahan",
    bloodGroup: BloodGroup.A_POSITIVE,
    district: "Khulna",
    upazila: "Khalishpur",
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "BBA, Faculty",
    isAvailable: true,
    isEligible: true,
    verifiedBadge: true
  },
  {
    uid: "d3",
    displayName: "Rashedul Karim",
    bloodGroup: BloodGroup.B_POSITIVE,
    district: "Khulna",
    upazila: "Boyra",
    affiliationType: AffiliationType.EXTERNAL,
    department: "Khulna City",
    isAvailable: true,
    isEligible: true,
    verifiedBadge: false
  },
  {
    uid: "d4",
    displayName: "Farzana Akter",
    bloodGroup: BloodGroup.AB_POSITIVE,
    district: "Khulna",
    upazila: "Daulatpur",
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "EEE, Alumni",
    isAvailable: false,
    isEligible: false,
    verifiedBadge: true
  },
  {
    uid: "d5",
    displayName: "Mehedi Hasan",
    bloodGroup: BloodGroup.O_NEGATIVE,
    district: "Khulna",
    upazila: "Sonadanga",
    affiliationType: AffiliationType.NWU_MEMBER,
    department: "Law & Justice",
    isAvailable: true,
    isEligible: true,
    verifiedBadge: true
  },
  {
    uid: "d6",
    displayName: "Sabrina Mostafa",
    bloodGroup: BloodGroup.B_NEGATIVE,
    district: "Khulna",
    upazila: "Khan Jahan Ali",
    affiliationType: AffiliationType.EXTERNAL,
    department: "Community Donor",
    isAvailable: true,
    isEligible: true,
    verifiedBadge: false
  }
];

const KHULNA_UPAZILAS = [
  "All Upazilas",
  "Sonadanga",
  "Khalishpur",
  "Boyra",
  "Daulatpur",
  "Khan Jahan Ali",
  "Rupsha",
  "Phultala"
];

export function DonorDirectory() {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("All Upazilas");
  const [nwuOnly, setNwuOnly] = useState<boolean>(false);
  const [donors, setDonors] = useState<typeof SYNTHETIC_DONORS>(SYNTHETIC_DONORS);
  const [isLive, setIsLive] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      const q = query(collection(db, "donorPublic"), where("isPublicVisible", "==", true));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveList = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                uid: doc.id,
                displayName: data.displayName || "Donor",
                bloodGroup: data.bloodGroup as BloodGroup,
                district: data.district || "Khulna",
                upazila: data.upazila || "Sonadanga",
                affiliationType: data.affiliationType as AffiliationType,
                department: data.department || (data.affiliationType === AffiliationType.NWU_MEMBER ? "NWU Member" : "Community Donor"),
                isAvailable: data.isAvailable ?? true,
                isEligible: data.isEligible ?? true,
                verifiedBadge: data.verifiedBadge ?? false
              };
            });
            setDonors(liveList);
            setIsLive(true);
          }
        },
        (err) => {
          // Gracefully retain synthetic data if offline / permission check
          console.debug("Firestore live listener inactive, using offline preview data.", err);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  const filteredDonors = donors.filter((donor) => {
    if (selectedGroup !== "ALL" && donor.bloodGroup !== selectedGroup) return false;
    if (selectedUpazila !== "All Upazilas" && donor.upazila !== selectedUpazila) return false;
    if (nwuOnly && donor.affiliationType !== AffiliationType.NWU_MEMBER) return false;
    return true;
  });


  return (
    <section id="directory" className="py-12 bg-white border-y border-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-surface-muted gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-brand-surface border border-brand-border text-brand-primary rounded-md text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sanitized Public Directory (No Public Phone Numbers)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
              Voluntary Donor Directory
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Find potential voluntary donors in the Khulna metropolitan area. Contact numbers are disclosed only upon mutual emergency acceptance.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-text-secondary bg-surface-bg px-3 py-2 rounded-lg border border-surface-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-status-available"></span>
            <span>Available: {SYNTHETIC_DONORS.filter(d => d.isAvailable).length}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-text-primary">Preview Data</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-surface-bg p-4 sm:p-5 rounded-2xl border border-surface-muted mb-8 space-y-4">
          {/* Blood Group Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Filter by Blood Group
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroup("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedGroup === "ALL"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-white text-text-secondary border border-surface-muted hover:border-slate-300"
                }`}
              >
                All Groups
              </button>
              {Object.entries(BloodGroupLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedGroup(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedGroup === key
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-white text-text-secondary border border-surface-muted hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Affiliation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            <div>
              <label htmlFor="upazila-select" className="block text-xs font-medium text-text-secondary mb-1">
                Area / Upazila (Khulna)
              </label>
              <select
                id="upazila-select"
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-white border border-surface-muted rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {KHULNA_UPAZILAS.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2.5 h-11 px-3 bg-white border border-surface-muted rounded-xl cursor-pointer w-full hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={nwuOnly}
                  onChange={(e) => setNwuOnly(e.target.checked)}
                  className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
                />
                <span className="text-xs font-medium text-text-primary">
                  NWU Community Members Only
                </span>
              </label>
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <div className="text-[11px] text-text-secondary bg-brand-surface/60 border border-brand-border/40 p-2.5 rounded-xl w-full">
                <strong>Privacy Policy:</strong> Personal contact numbers are protected and only released via authenticated response.
              </div>
            </div>
          </div>
        </div>

        {/* Donor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => (
            <div
              key={donor.uid}
              className="bg-white border border-surface-muted hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center font-display font-bold text-lg text-brand-primary">
                      {BloodGroupLabels[donor.bloodGroup]}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-semibold text-sm text-text-primary">
                          {donor.displayName}
                        </h3>
                        {donor.verifiedBadge && (
                          <span title="Verified NWU Affiliation">
                            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-secondary block">
                        {donor.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      donor.isAvailable
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {donor.isAvailable ? "Available" : "In Cooldown"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-text-secondary mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {donor.upazila}, {donor.district}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {donor.affiliationType === AffiliationType.NWU_MEMBER
                        ? "North Western University"
                        : "Community Donor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Phone Protected
                </span>
                <a
                  href="#request-modal"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-primary bg-brand-surface hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Send Emergency Request
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredDonors.length === 0 && (
          <div className="text-center py-12 bg-surface-bg rounded-2xl border border-surface-muted">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-text-primary">
              No matching donors found
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Try broadening your location filter or selecting all blood groups to find volunteers in surrounding areas.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
