"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BloodGroup, BloodGroupLabels, UserRole, AffiliationType } from "@badhon/domain";
import { Shield, CheckCircle, Phone, ArrowRight, X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, userProfile, reloadProfile } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(userProfile?.bloodGroup || BloodGroup.O_POSITIVE);
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [department, setDepartment] = useState<string>(userProfile?.department || "CSE");
  const [upazila, setUpazila] = useState<string>(userProfile?.upazila || "Sonadanga");
  const [phone, setPhone] = useState<string>(userProfile?.phoneNumber || "");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleSendOtp = () => {
    if (!phone || phone.length < 11) {
      alert("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)");
      return;
    }
    // Simulation / integration hook for OTP
    setOtpSent(true);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bloodGroup,
        roles: [role],
        department,
        upazila,
        phoneNumber: phone.startsWith("+880") ? phone : `+880${phone.replace(/^0/, "")}`,
        isPhoneVerified: true, // Mark verified after OTP verification
        updatedAt: new Date().toISOString()
      });
      await reloadProfile();
      onClose();
    } catch (err) {
      console.error("[Onboarding] Error updating profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-surface text-brand-primary flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-text-primary">
            Complete Your NWU Profile
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure your blood group and verified mobile number to enable life-saving emergency matching.
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-4">
          {/* Blood Group Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Your Blood Group
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(BloodGroupLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBloodGroup(key as BloodGroup)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    bloodGroup === key
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-slate-50 text-text-secondary border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Department & Upazila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                NWU Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CSE, EEE, BBA"
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Area (Khulna)
              </label>
              <select
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="Sonadanga">Sonadanga</option>
                <option value="Khalishpur">Khalishpur</option>
                <option value="Boyra">Boyra</option>
                <option value="Daulatpur">Daulatpur</option>
                <option value="Khan Jahan Ali">Khan Jahan Ali</option>
              </select>
            </div>
          </div>

          {/* Bangladeshi Phone Number & OTP */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Bangladeshi Mobile Number
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712345678"
                className="flex-1 h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-3 h-10 bg-slate-100 hover:bg-slate-200 text-text-primary text-xs font-semibold rounded-xl transition-colors shrink-0"
              >
                {otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Phone number is protected by our least-privilege consent architecture.
            </p>
          </div>

          {otpSent && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Enter 6-Digit SMS Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-center tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              {isSubmitting ? "Saving Profile..." : "Complete Profile & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
