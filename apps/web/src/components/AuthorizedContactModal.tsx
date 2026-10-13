"use client";

import React, { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { Phone, MessageCircle, ShieldCheck, X, Loader2, AlertCircle, Clock } from "lucide-react";

interface AuthorizedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  donorUid: string;
}

interface ContactData {
  requestId: string;
  donorUid: string;
  donorDisplayName: string;
  donorPhone: string;
  allowWhatsApp: boolean;
  grantedAt: string;
  grantStatus: string;
}

export function AuthorizedContactModal({
  isOpen,
  onClose,
  requestId,
  donorUid
}: AuthorizedContactModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);

  useEffect(() => {
    if (!isOpen || !requestId || !donorUid) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchContact = async () => {
      try {
        const getFn = httpsCallable(functions, "getAuthorizedContact");
        const res = await getFn({ requestId, donorUid });
        if (isMounted) {
          setContact(res.data as ContactData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to fetch authorized contact:", err);
          setError(
            err?.message ||
              "Could not unlock contact. The grant may have expired or you may not be authorized."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContact();

    return () => {
      isMounted = false;
    };
  }, [isOpen, requestId, donorUid]);

  if (!isOpen) return null;

  const cleanPhone = contact?.donorPhone?.replace(/\D/g, "") || "";
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-muted overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-brand-surface border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-text-primary">
                Authorized Contact Grant
              </h3>
              <p className="text-[11px] text-text-secondary">
                Protected phone released by mutual emergency consent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-secondary hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
              <p className="text-xs text-text-secondary font-medium">
                Validating server grant permissions & creating access audit trail...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="block font-semibold mb-0.5">Authorization Denied</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && contact && (
            <>
              {/* Donor Summary */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-text-primary">
                    {contact.donorDisplayName}
                  </h4>
                  <span className="text-xs text-text-secondary">
                    Verified Accepted Voluntary Donor
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Grant Active
                </span>
              </div>

              {/* Phone display */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Verified Phone Number
                </span>
                <div className="font-mono text-2xl font-extrabold text-brand-primary tracking-wide">
                  {contact.donorPhone}
                </div>
                <div className="flex items-center justify-center space-x-1 text-[11px] text-text-muted pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Authorized for coordination during this active request</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${contact.donorPhone}`}
                  className="flex items-center justify-center space-x-2 h-12 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Donor</span>
                </a>

                {contact.allowWhatsApp ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center space-x-2 h-12 bg-slate-200 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed"
                    title="Donor opted out of WhatsApp coordination"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp N/A</span>
                  </button>
                )}
              </div>

              {/* Security notice */}
              <div className="text-[11px] text-text-muted bg-brand-surface/40 p-2.5 rounded-xl border border-brand-border/40 text-center">
                This access was logged in the security audit ledger. Please coordinate respectfully.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
