import React from "react";
import Link from "next/link";
import { Droplet, Heart, Shield, ArrowRight, Activity, Hospital, Phone } from "lucide-react";
import { DonorDirectory } from "@/components/DonorDirectory";
import { PublicRequests } from "@/components/PublicRequests";
import { HowItWorks } from "@/components/HowItWorks";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Urgent Broadcast Banner */}
      <div className="bg-red-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center space-x-2">
        <Activity className="w-4 h-4 animate-pulse" />
        <span>
          Emergency Notice: B+ and O- blood required urgently at Khulna Medical College Hospital.
        </span>
        <a href="#requests" className="underline font-bold ml-1 hover:text-red-100">
          View Need &rarr;
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-surface-muted overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-primary">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                <span>North Western University (NWU), Khulna</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-text-primary tracking-tight leading-[1.1]">
                A trusted bond for <span className="text-brand-primary">life-saving</span> blood.
              </h1>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
                Badhon (বাঁধন) connects voluntary blood donors across the North Western University community and Khulna with emergency medical requests—built with zero public phone leaks and strict donor consent.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <a
                  href="#directory"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Droplet className="w-4 h-4 mr-2 fill-current" />
                  <span>Find Available Donors</span>
                </a>
                <a
                  href="#requests"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-text-primary bg-surface-muted hover:bg-slate-200 transition-colors border border-surface-muted"
                >
                  <span>Active Hospital Needs</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>

              {/* Trust Metrics Bar */}
              <div className="pt-6 border-t border-surface-muted grid grid-cols-3 gap-4 text-left">
                <div>
                  <span className="block text-2xl font-display font-extrabold text-text-primary">
                    100%
                  </span>
                  <span className="text-xs text-text-secondary font-medium">
                    Voluntary & Free
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-display font-extrabold text-brand-primary">
                    Private
                  </span>
                  <span className="text-xs text-text-secondary font-medium">
                    Consent-First Calls
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-display font-extrabold text-text-primary">
                    Khulna
                  </span>
                  <span className="text-xs text-text-secondary font-medium">
                    Campus & Regional
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card / Fast Emergency Box */}
            <div className="lg:col-span-5">
              <div className="bg-surface-bg border border-surface-muted rounded-3xl p-6 sm:p-8 shadow-sm relative">
                <div className="flex items-center justify-between pb-4 border-b border-surface-muted mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-brand-primary">
                      <Droplet className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-display font-bold text-sm text-text-primary">
                      Emergency Blood Need?
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-primary bg-brand-surface px-2.5 py-0.5 rounded-full border border-brand-border">
                    Fast Match
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-text-secondary leading-normal">
                    Submit verified emergency details to notify eligible donors near your hospital immediately.
                  </p>

                  <div className="p-4 bg-white rounded-2xl border border-surface-muted space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Major Hospitals Covered:</span>
                      <span className="font-semibold text-text-primary">Khulna Region</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Hospital className="w-3.5 h-3.5 text-brand-primary" />
                        <span>KMCH (Khulna Medical College Hospital)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Hospital className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Khulna Sadar & City Medical</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="http://localhost:3000/#directory"
                    className="w-full flex items-center justify-center py-3.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-sm transition-colors"
                  >
                    Search Donors by Blood Group
                  </a>

                  <p className="text-[11px] text-center text-text-secondary">
                    Need emergency advice? Call National Emergency Hotline{" "}
                    <a href="tel:999" className="font-bold text-text-primary underline">
                      999
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Hospital Emergency Requests */}
      <PublicRequests />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Sanitized Donor Directory */}
      <DonorDirectory />

      {/* Non-Medical Disclaimer Section */}
      <section id="guidance" className="py-12 bg-white border-t border-surface-muted">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-text-primary">
            Voluntary Coordination Disclaimer
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Badhon is an open voluntary communication platform operated by the university student and volunteer community. It does not perform laboratory medical testing, cross-matching, or blood banking. Qualified medical staff at the attending hospital are solely responsible for verifying donor hemoglobin, screening for transfusion-transmissible infections, and confirming blood compatibility.
          </p>
        </div>
      </section>
    </div>
  );
}
