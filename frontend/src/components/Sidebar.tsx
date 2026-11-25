import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  AlertTriangle,
  Radio,
  Building,
  MessageSquareHeart,
  BarChart3,
  SlidersHorizontal,
  X,
  Shield,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || "citizen";

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const citizenNav = [
    { id: "citizen-dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { id: "report-issue", label: "Report Civic Issue", icon: PlusCircle, highlight: true },
    { id: "my-complaints", label: "Track My Complaints", icon: FileText },
    { id: "city-map", label: "Interactive City Map", icon: MapPin },
    { id: "alerts", label: "Emergency Alerts", icon: AlertTriangle },
    { id: "announcements", label: "City Announcements", icon: Radio },
    { id: "services", label: "Public Services Directory", icon: Building },
    { id: "feedback", label: "Citizen Feedback", icon: MessageSquareHeart },
  ];

  const officialNav = [
    { id: "admin-dashboard", label: "Analytics Overview", icon: BarChart3 },
    { id: "admin-complaints", label: "Complaint Management", icon: SlidersHorizontal, highlight: true },
    { id: "city-map", label: "Incident Map GIS", icon: MapPin },
    { id: "alerts", label: "Emergency Broadcasts", icon: AlertTriangle },
    { id: "announcements", label: "Publish Announcements", icon: Radio },
    { id: "services", label: "Public Services Registry", icon: Building },
    { id: "citizen-dashboard", label: "Citizen View Preview", icon: LayoutDashboard },
  ];

  const adminNav = [
    { id: "admin-dashboard", label: "Executive Analytics", icon: BarChart3 },
    { id: "admin-complaints", label: "All Complaints Operations", icon: SlidersHorizontal, highlight: true },
    { id: "city-map", label: "Smart City GIS Map", icon: MapPin },
    { id: "alerts", label: "Emergency Alerts Admin", icon: AlertTriangle },
    { id: "announcements", label: "Manage Announcements", icon: Radio },
    { id: "services", label: "Public Services Registry", icon: Building },
    { id: "feedback", label: "Citizen Feedback Reviews", icon: MessageSquareHeart },
    { id: "citizen-dashboard", label: "Citizen View Switch", icon: LayoutDashboard },
  ];

  const navItems = role === "admin" ? adminNav : role === "official" ? officialNav : citizenNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-800">Navigation Menu</span>
            <button onClick={onClose} className="p-1 rounded text-slate-500 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="mb-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</p>
                <p className="text-xs font-bold text-slate-800 capitalize">{role}</p>
              </div>
            </div>
            {user?.department_name && (
              <span className="text-[10px] bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded">
                Dept Staff
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold shadow-sm shadow-brand-500/20"
                      : item.highlight
                      ? "bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold border border-brand-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : item.highlight ? "text-brand-600" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Municipal Helpdesk Box */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="rounded-xl p-3 bg-gradient-to-br from-brand-50 to-tealbrand-50 border border-brand-100 text-xs">
            <div className="flex items-center gap-2 text-brand-800 font-bold mb-1">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>City Helpline 24x7</span>
            </div>
            <p className="text-slate-600 text-[11px] mb-2">Emergency: 112 | Civic: 1912</p>
            <p className="text-[10px] text-slate-400 font-medium">BBMP Unified Command Centre</p>
          </div>
        </div>
      </aside>
    </>
  );
};