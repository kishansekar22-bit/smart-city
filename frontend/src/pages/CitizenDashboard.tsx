import { resolveImageUrl } from "../utils/imageUrl"
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { complaintService, alertService, announcementService, serviceService } from "../services/api";
import { Complaint, EmergencyAlert, Announcement, PublicService } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  MapPin,
  Radio,
  Building,
  Phone,
  Eye,
} from "lucide-react";

interface CitizenDashboardProps {
  onNavigate: (page: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cData, aData, annData, sData] = await Promise.all([
          // If citizen is logged in, fetch complaints
          complaintService.getComplaints({ limit: 10 }),
          alertService.getAlerts({ active_only: true }),
          announcementService.getAnnouncements(),
          serviceService.getServices(),
        ]);
        setComplaints(cData.complaints);
        setAlerts(aData);
        setAnnouncements(annData.slice(0, 3));
        setServices(sData.slice(0, 4));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Metric counts
  const total = complaints.length;
  const pending = complaints.filter((c) => ["Submitted", "Acknowledged", "Assigned"].includes(c.status)).length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const resolved = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 via-brand-700 to-tealbrand-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-2">
              Citizen Central Command
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.full_name || "Citizen"}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-xl">
              Track the status of your municipal grievances, view emergency warnings for your neighborhood, and discover city facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("report-issue")}
              className="px-5 py-3 rounded-xl bg-white text-brand-900 hover:bg-brand-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-brand-600" />
              <span>Report New Issue</span>
            </button>
            <button
              onClick={() => onNavigate("city-map")}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 text-brand-300" />
              <span>Open Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Grievances</p>
            <p className="text-2xl font-black text-slate-900">{total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Review</p>
            <p className="text-2xl font-black text-amber-600">{pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">In Progress</p>
            <p className="text-2xl font-black text-sky-600">{inProgress}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Resolved</p>
            <p className="text-2xl font-black text-emerald-600">{resolved}</p>
          </div>
        </div>
      </div>

      {/* Emergency Alerts Alert Bar if any */}
      {alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
              <h3 className="font-bold text-sm text-rose-900">Active Emergency Alerts ({alerts.length})</h3>
            </div>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 2).map((al) => (
              <div key={al.id} className="bg-white p-3 rounded-xl border border-rose-200 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {al.severity}
                    </span>
                    <span className="font-semibold text-slate-900">{al.title}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{al.description}</p>
                </div>
                {al.area && <span className="text-[11px] text-slate-400 shrink-0 font-medium">{al.area}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Complaints + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Complaints Table (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-extrabold text-slate-900">Recent Complaints</h2>
            </div>
            <button
              onClick={() => onNavigate("my-complaints")}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {complaints.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No complaints logged yet</p>
                <p className="text-xs text-slate-400 mt-1">Report your first civic issue with photo and GPS location.</p>
                <button
                  onClick={() => onNavigate("report-issue")}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Report an Issue
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.slice(0, 5).map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => onNavigate(`complaint-detail-${comp.id}`)}
                    className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {comp.image_url ? (
                        <img
                          src={resolveImageUrl(comp.image_url)}
                          alt={comp.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0 font-semibold">
                          Civic
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {comp.ticket_id}
                          </span>
                          <span className="text-xs text-slate-500">&bull;</span>
                          <span className="text-xs text-slate-600 font-medium">{comp.category}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{comp.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{comp.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <StatusBadge status={comp.status} size="sm" />
                      <PriorityBadge priority={comp.priority} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Announcements & Nearby Services (Span 1) */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">City Announcements</h3>
              </div>
              <button
                onClick={() => onNavigate("announcements")}
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onNavigate("announcements")}
                  className="p-3 bg-slate-50 rounded-xl hover:bg-brand-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-brand-700 uppercase">{ann.category}</span>
                    <span>{new Date(ann.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Services Shortcut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-tealbrand-600" />
                <h3 className="font-bold text-sm text-slate-900">Nearby Public Facilities</h3>
              </div>
              <button
                onClick={() => onNavigate("services")}
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                Directory
              </button>
            </div>

            <div className="space-y-2.5">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => onNavigate("services")}
                  className="flex items-start justify-between gap-2 text-xs hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div>
                    <h5 className="font-semibold text-slate-900">{srv.name}</h5>
                    <p className="text-[11px] text-slate-500">{srv.category}</p>
                  </div>
                  {srv.phone && (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {srv.phone.split("/")[0].trim()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};