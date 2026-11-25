import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { alertService } from "../services/api";
import { EmergencyAlert, AlertSeverity } from "../types";
import {
  AlertTriangle,
  Radio,
  PlusCircle,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Trash2,
  ShieldAlert,
  Info,
} from "lucide-react";

interface AlertsPageProps {
  onNavigate: (page: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("Warning");
  const [area, setArea] = useState("");
  const [creating, setCreating] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getAlerts({
        active_only: showActiveOnly ? true : undefined,
        severity: filterSeverity !== "All" ? filterSeverity : undefined,
      });
      setAlerts(data);
    } catch (err: any) {
      error("Failed to load alerts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [filterSeverity, showActiveOnly]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      error("Please fill in title and description.");
      return;
    }
    try {
      setCreating(true);
      await alertService.createAlert({ title, description, severity, area: area || undefined });
      success("Emergency alert broadcasted successfully!", "Alert Dispatched");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setArea("");
      loadAlerts();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to publish alert");
    } finally {
      setCreating(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await alertService.updateAlert(id, { is_active: false });
      success("Alert marked as resolved / archived", "Alert Updated");
      loadAlerts();
    } catch (err: any) {
      error("Failed to resolve alert: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this emergency broadcast?")) return;
    try {
      await alertService.deleteAlert(id);
      success("Alert deleted from dispatch system", "Deleted");
      loadAlerts();
    } catch (err: any) {
      error("Failed to delete alert: " + err.message);
    }
  };

  const isStaff = user && (user.role === "official" || user.role === "admin");

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-600 animate-pulse" />
            <span>Emergency Broadcast & Civic Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time public safety warnings, traffic diversions, weather updates, and utility disruptions
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Broadcast New Alert</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Severity:</span>
          {["All", "Critical", "Warning", "Informational"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterSeverity === s
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="rounded text-rose-600 focus:ring-rose-500"
          />
          <span>Show Active Advisories Only</span>
        </label>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No Active Emergency Advisories</p>
            <p className="text-xs text-slate-400">All city utility networks and transit corridors are functioning normally.</p>
          </div>
        ) : (
          alerts.map((al) => {
            const isCritical = al.severity === "Critical";
            const isWarning = al.severity === "Warning";

            return (
              <div
                key={al.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCritical
                    ? "bg-rose-50/70 border-rose-300 shadow-sm"
                    : isWarning
                    ? "bg-amber-50/60 border-amber-300 shadow-sm"
                    : "bg-sky-50/60 border-sky-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isCritical
                            ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                            : isWarning
                            ? "bg-amber-500 text-slate-900 border-amber-500"
                            : "bg-sky-600 text-white border-sky-600"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{al.severity} ADVISORY</span>
                      </span>

                      {!al.is_active && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          RESOLVED / ARCHIVED
                        </span>
                      )}

                      {al.area && (
                        <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{al.area}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{al.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
                      {al.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Broadcasted: {new Date(al.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </span>
                      {al.author_name && <span>Published by: {al.author_name}</span>}
                    </div>
                  </div>

                  {isStaff && (
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      {al.is_active && (
                        <button
                          onClick={() => handleResolveAlert(al.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(al.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Broadcast Emergency Warning</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Advisory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flooding Alert along Outer Ring Road Bellandur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Critical">Critical (Red Emergency)</option>
                    <option value="Warning">Warning (Amber Caution)</option>
                    <option value="Informational">Informational (Blue Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affected Area / Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahadevapura / Bellandur"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Public Advisory & Guidance</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details regarding traffic bottlenecks, alternative diversions, safety protocols..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {creating ? "Broadcasting..." : "Dispatch Citywide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};