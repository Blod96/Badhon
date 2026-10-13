import React from "react";
import { ShieldCheck, UserCheck, Bell, PhoneCall, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Bell className="w-6 h-6 text-brand-primary" />,
      title: "Request Blood",
      description: "A patient family member or doctor creates an emergency request with blood group, hospital location, and urgency."
    },
    {
      num: "02",
      icon: <UserCheck className="w-6 h-6 text-brand-primary" />,
      title: "Eligible Matching",
      description: "The platform notifies available voluntary donors in the area whose 90-day cooldown period has safely passed."
    },
    {
      num: "03",
      icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
      title: "Consent-First Acceptance",
      description: "Donors review sanitized hospital details. Personal contact numbers are shared only when the donor clicks 'Accept'."
    },
    {
      num: "04",
      icon: <PhoneCall className="w-6 h-6 text-brand-primary" />,
      title: "Direct Coordination",
      description: "Requester receives verified donor contact info, coordinates blood delivery, and marks the request fulfilled."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-surface-muted text-text-secondary rounded-full text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>Privacy-First Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
            How Badhon Protects Donors & Saves Lives
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            No public phone number leaks. No commercial blood brokers. Pure volunteer mutual coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-surface-bg border border-surface-muted p-6 rounded-2xl relative flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-surface-muted flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                  <span className="font-display font-extrabold text-2xl text-slate-200">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
