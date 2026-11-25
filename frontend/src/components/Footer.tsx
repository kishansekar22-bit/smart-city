import React from "react";
import { Building2, Phone, Mail, Globe, ShieldCheck } from "lucide-react";

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-tealbrand-400 flex items-center justify-center text-white font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">SMART CITY 360</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Integrated municipal governance and citizen empowerment platform. Real-time grievance tracking, open GIS city mapping, and automated civic services.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Citizen Service Charter Compliant</span>
            </div>
          </div>

          {/* Quick Civic Navigation */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate("report-issue")} className="hover:text-white transition-colors">
                  Report Pothole / Streetlight / Waste
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("city-map")} className="hover:text-white transition-colors">
                  Live Smart City GIS Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("services")} className="hover:text-white transition-colors">
                  Public Hospitals & Police Stations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("announcements")} className="hover:text-white transition-colors">
                  Municipal Notices & Tenders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("alerts")} className="hover:text-white transition-colors">
                  Weather & Disaster Advisories
                </button>
              </li>
            </ul>
          </div>

          {/* City Departments */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">City Departments</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>BBMP Road Infrastructure & Engineering</li>
              <li>BESCOM Electricity & Lighting Supply</li>
              <li>BWSSB Water & Sewerage Board</li>
              <li>Bengaluru City Traffic Police (BTP)</li>
              <li>Bruhat Solid Waste Management Corp</li>
              <li>Horticulture & Urban Forestry</li>
            </ul>
          </div>

          {/* 24x7 Emergency Helplines */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">24x7 Emergency Contacts</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Police / National Emergency: <strong className="text-white">112</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Fire & Rescue Brigade: <strong className="text-white">101</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Ambulance & Trauma Care: <strong className="text-white">108</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>BESCOM Power Helpline: <strong className="text-white">1912</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-tealbrand-400" />
                <span>helpdesk@smartcity.gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>smartcity.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; 2026 Smart City Municipal Corporation. All rights reserved. Production Ready Release.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Civic Service</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">RTI Information</span>
          </div>
        </div>
      </div>
    </footer>
  );
};