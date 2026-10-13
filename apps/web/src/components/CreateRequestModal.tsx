"use client";

import React, { useState } from "react";
import { BloodGroup, BloodGroupLabels, Urgency } from "@badhon/domain";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, CheckCircle2, Loader2, Plus, X, HeartPulse } from "lucide-react";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

const KHULNA_AREAS = [
  "Sonadanga",
  "Boyra",
  "Khalishpur",
  "Daulatpur",
  "Khan Jahan Ali",
  "Rupsha",
  "Phultala"
];

export function CreateRequestModal({ isOpen, onClose, onSuccess }: CreateRequestModalProps) {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.B_POSITIVE);
  const [unitsNeeded, setUnitsNeeded] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState<string>("Khulna Medical College Hospital");
  const [hospitalAddress, setHospitalAddress] = useState<string>("Boyra, Khulna");
  const [upazila, setUpazila] = useState<string>("Boyra");
  const [urgency, setUrgency] = useState<Urgency>(Urgency.EMERGENCY);
  const [neededHours, setNeededHours] = useState<number>(4);
  const [clinicalDetails, setClinicalDetails] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must sign in with Google to create an emergency request.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const neededAt = new Date(Date.now() + neededHours * 60 * 60 * 1000).toISOString();
      const createFn = httpsCallable(functions, "createBloodRequest");
      
      const payload = {
        bloodGroup,
        donorsNeeded: unitsNeeded,
        unitsNeeded,
        hospitalName,
        hospitalAddress,
        division: "Khulna",
        district: "Khulna",
        upazila,
        neededAt,
        urgency,
        clinicalDetails
      };

      const result = await createFn(payload);
      const data = result.data as { requestId: string };
      setCreatedId(data.requestId);
      if (onSuccess) onSuccess(data.requestId);
    } catch (err: any) {
      console.error("Create request failure:", err);
      setError(err?.message || "Failed to create blood request. Please check required fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-surface-muted overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-brand-surface border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">
                Post Emergency Blood Request
              </h3>
              <p className="text-xs text-text-secondary">
                Validated and dispatched to eligible voluntary donors in Khulna
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-secondary hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {createdId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">
                Blood Request Broadcasted!
              </h4>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Your emergency request (ID: <code className="font-mono font-semibold text-brand-primary">{createdId}</code>) is now active on the public feed. Matching donors are being notified.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white font-medium text-xs rounded-xl shadow-md hover:bg-brand-primaryHover transition-all"
              >
                Close & View Feed
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Blood Group & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Blood Group Required
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                  >
                    {Object.entries(BloodGroupLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Bags / Units Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                  />
                </div>
              </div>

              {/* Urgency & Timeframe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Clinical Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as Urgency)}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                  >
                    <option value={Urgency.EMERGENCY}>EMERGENCY (Within 6h)</option>
                    <option value={Urgency.URGENT}>URGENT (Within 24h)</option>
                    <option value={Urgency.NORMAL}>NORMAL (Routine / 72h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Needed Within (Hours)
                  </label>
                  <select
                    value={neededHours}
                    onChange={(e) => setNeededHours(parseInt(e.target.value, 10))}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                  >
                    <option value={2}>Within 2 hours</option>
                    <option value={4}>Within 4 hours</option>
                    <option value={6}>Within 6 hours</option>
                    <option value={12}>Within 12 hours</option>
                    <option value={24}>Within 24 hours</option>
                  </select>
                </div>
              </div>

              {/* Hospital & Area */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Khulna Medical College Hospital (KMCH)"
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Hospital Area / Upazila
                    </label>
                    <select
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      {KHULNA_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Local Address / Landmark
                    </label>
                    <input
                      type="text"
                      required
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      placeholder="e.g. Boyra Main Road, Ward 4"
                      className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Clinical Details / Patient Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalDetails}
                    onChange={(e) => setClinicalDetails(e.target.value)}
                    placeholder="e.g. Surgery scheduled, patient admitted in ICU / Ward 5."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating & Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish Emergency Blood Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
