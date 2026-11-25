import React, { useState, useEffect } from "react";
import { analyticsService } from "../services/api";
import { AnalyticsData } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: "#3b82f6",
  Acknowledged: "#a855f7",
  Assigned: "#f59e0b",
  "In Progress": "#0284c7",
  Resolved: "#10b981",
  Closed: "#64748b",
};

const CHART_COLORS = ["#0284c7", "#0d9488", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#64748b", "#f97316"];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Calculating citywide municipal analytics...</p>
      </div>
    );
  }

  const { kpis, categoryBreakdown, statusBreakdown, areaBreakdown, timelineData, departmentPerformance } = data;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Municipal Command & Analytics Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Executive Smart City Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, service level adherence (SLA), and geographic complaint distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("admin-complaints")}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>Manage All Complaints</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Complaints</span>
            <FileText className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis.totalComplaints}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">+14% vs last month</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{kpis.pendingComplaints}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting assignment</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">In Progress</span>
            <PlayCircle className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-600">{kpis.inProgressComplaints}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active squad field repair</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{kpis.resolvedComplaints}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">94.8% SLA rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Avg Turnaround</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-brand-800">{kpis.avgResolutionHours}h</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">-4.2 hrs this week</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{kpis.activeAlerts}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Emergency advisories</p>
        </div>
      </div>

      {/* Row 1 Charts: Trend Over Time + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Complaint Volume & Resolution Trend</h3>
              <p className="text-xs text-slate-500">6-Month monthly intake vs field completion</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Positive Intake Clearance
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", fontSize: "12px", border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="submitted" stroke="#0284c7" fillOpacity={1} fill="url(#colorSub)" name="Lodged Issues" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" name="Resolved Issues" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart (Span 1) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Complaints by Status</h3>
            <p className="text-xs text-slate-500">Breakdown of current ticket states</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#0284c7"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || "#0284c7" }} />
                <span className="text-slate-600 truncate">{s.status}:</span>
                <strong className="text-slate-900 ml-auto">{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Category Distribution + Area Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Complaints by Category</h3>
            <p className="text-xs text-slate-500">Distribution across 11 civic municipal categories</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown.slice(0, 7)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }} />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]}>
                  {categoryBreakdown.slice(0, 7).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by City Area / Zone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Complaints by Municipal Ward / Zone</h3>
              <p className="text-xs text-slate-500">Hotspot concentration across Bengaluru localities</p>
            </div>
            <button
              onClick={() => onNavigate("city-map")}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>GIS Map</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {areaBreakdown.slice(0, 6).map((item, idx) => {
              const pct = Math.round((item.count / kpis.totalComplaints) * 100);
              return (
                <div key={item.area} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-800 font-semibold">{item.area}</span>
                    <span className="text-slate-500">
                      {item.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(5, pct)}%`,
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Performance & SLA Adherence */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Department Performance & Resolution Adherence</h3>
          <p className="text-xs text-slate-500">SLA completion metrics by civic agency</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Agency Code</th>
                <th className="py-3 px-4">Total Received</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentPerformance.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-brand-700">{d.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{d.total}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">{d.resolved}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.rate >= 75 ? "bg-emerald-500" : d.rate >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${d.rate}%` }}
                        />
                      </div>
                      <span className="font-bold">{d.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};