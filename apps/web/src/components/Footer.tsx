import React from "react";
import Link from "next/link";
import { Droplet, Shield, Hospital, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Badhon বাঁধন
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              University and community blood donation coordination platform for North Western University (NWU), Khulna, Bangladesh.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 rounded-md text-[11px] text-slate-300">
              <Shield className="w-3.5 h-3.5 text-brand-primary" />
              <span>Privacy-by-Design Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#directory" className="hover:text-white transition-colors">
                  Sanitized Donor Directory
                </Link>
              </li>
              <li>
                <Link href="#requests" className="hover:text-white transition-colors">
                  Active Emergency Requests
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How Coordination Works
                </Link>
              </li>
              <li>
                <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="text-brand-border hover:text-white transition-colors">
                  Protected Admin Portal &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Regional Hospital Hotlines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Khulna Emergency Lines
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <Hospital className="w-3.5 h-3.5 text-slate-500" />
                <span>KMCH Blood Bank: +88041-760350</span>
              </li>
              <li className="flex items-center space-x-2">
                <Hospital className="w-3.5 h-3.5 text-slate-500" />
                <span>Khulna Sadar Hospital: +88041-720171</span>
              </li>
              <li className="flex items-center space-x-2">
                <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
                <span>NWU Campus Volunteer Cell</span>
              </li>
            </ul>
          </div>

          {/* Non-Medical Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Important Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Badhon is strictly a volunteer communication platform. It is <strong>not</strong> a medical authority, blood bank, or compatibility determinant. Certified medical staff at receiving hospitals remain solely responsible for blood screening and safety.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} North Western University (NWU), Bangladesh. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="#privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#contact" className="hover:text-slate-400 transition-colors">
              Contact Club
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
