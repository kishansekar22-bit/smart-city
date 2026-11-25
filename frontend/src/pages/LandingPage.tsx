import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { complaintService, alertService, announcementService, serviceService } from "../services/api";
import { EmergencyAlert, Announcement, PublicService } from "../types";
import {
  Building2,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  FileCheck,
  Radio,
  CheckCircle2,
  Users,
  Search,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aData, annData, sData] = await Promise.all([
          alertService.getAlerts({ active_only: true }),
          announcementService.getAnnouncements(),
          serviceService.getServices(),
        ]);
        setAlerts(aData.slice(0, 3));
        setAnnouncements(annData.slice(0, 3));
        setServices(sData.slice(0, 6));
      } catch {
        // ignore
      }
    };
    loadData();
  }, []);

  const handleTrackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;
    try {
      const complaint = await complaintService.getComplaintById(ticketSearch.trim().toUpperCase());
      if (complaint) {
        onNavigate(`complaint-detail-${complaint.id}`);
      }
    } catch {
      setSearchError("Complaint ticket ID not found. E.g. SC-2026-000101");
      setTimeout(() => setSearchError(""), 4000);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Unified Smart City Governance & Citizen Portal 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Empowering Citizens. <br />
            <span className="bg-gradient-to-r from-brand-300 via-tealbrand-200 to-emerald-300 bg-clip-text text-transparent">
              Transforming Urban Living.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Report potholes, failed streetlights, garbage dumps, or water leakages directly to city departments.
            Track resolution in real-time with verified GPS coordinates and digital audit trails.
          </p>

          {/* Quick Ticket Tracker & Actions */}
          <div className="pt-4 max-w-xl mx-auto space-y-4">
            <form onSubmit={handleTrackTicket} className="relative flex items-center">
              <input
                type="text"
                placeholder="Track Ticket ID (e.g. SC-2026-000101)..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 backdrop-blur-md"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
              >
                Track Now
              </button>
            </form>
            {searchError && <p className="text-xs text-rose-300 font-medium">{searchError}</p>}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("report-issue")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-tealbrand-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-tealbrand-700 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate("city-map")}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <MapPin className="w-4 h-4 text-brand-300" />
                <span>Explore City GIS Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live City Stats Strip */}
        <div className="relative max-w-5xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">98.2%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Resolution Rate</p>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">26.4 hrs</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Avg Turnaround Time</p>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">15,400+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Active Citizens</p>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">24 / 7</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Unified Command Desk</p>
          </div>
        </div>
      </section>

      {/* Emergency Alerts Section if active */}
      {alerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-rose-50/80 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                <h3 className="font-bold text-base">Active Emergency & Disaster Advisories</h3>
              </div>
              <button
                onClick={() => onNavigate("alerts")}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
              >
                View all alerts ({alerts.length}) &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((al) => (
                <div key={al.id} className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        al.severity === "Critical"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {al.severity}
                    </span>
                    {al.area && <span className="text-[11px] text-slate-500 font-medium">{al.area}</span>}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">{al.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{al.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works - 3 Step Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">How Civic Grievance Redressal Works</h2>
          <p className="text-sm text-slate-600 mt-2">
            Every complaint receives a verified ticket number and is automatically routed to the concerned municipal department.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5">Report the Civic Issue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Snap a photo, select the exact GPS pin on our interactive city map, and submit your grievance in under 60 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5">Auto-Assigned to Department</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our intelligent engine routes the ticket directly to BBMP Roads, BESCOM Power, or BWSSB Water squads with SLA countdowns.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5">Field Resolution & Feedback</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal inspectors execute repairs, upload proof of resolution photos, and citizens rate the service quality.
            </p>
          </div>
        </div>
      </section>

      {/* Featured City Announcements */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">Official Updates</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Latest City Announcements</h2>
            </div>
            <button
              onClick={() => onNavigate("announcements")}
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all updates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                onClick={() => onNavigate("announcements")}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              >
                {ann.image_url && (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img src={ann.image_url} alt={ann.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">{ann.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-bold">
                    <span>Read full notice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Public Services Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">Civic Infrastructure</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Essential Public Services</h2>
          </div>
          <button
            onClick={() => onNavigate("services")}
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Search directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigate("services")}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {s.category}
                </span>
                {s.phone && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {s.phone}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-2">{s.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.address}</p>
              {s.opening_hours && (
                <p className="text-[11px] text-brand-700 font-medium mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{s.opening_hours}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};