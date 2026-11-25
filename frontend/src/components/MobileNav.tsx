import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, MapPin, PlusCircle, AlertTriangle, User as UserIcon } from "lucide-react";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  const dashboardTarget = user?.role === "citizen" ? "citizen-dashboard" : "admin-dashboard";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-3 py-1.5 flex items-center justify-around md:hidden shadow-lg">
      <button
        onClick={() => onNavigate(dashboardTarget)}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
          currentPage === dashboardTarget ? "text-brand-600 font-bold" : "text-slate-500"
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate("city-map")}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
          currentPage === "city-map" ? "text-brand-600 font-bold" : "text-slate-500"
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span>Map</span>
      </button>

      {/* Central Report Action Button */}
      <button
        onClick={() => onNavigate("report-issue")}
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-tealbrand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 active:scale-95 transition-transform">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-brand-700 mt-0.5">Report</span>
      </button>

      <button
        onClick={() => onNavigate("alerts")}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
          currentPage === "alerts" ? "text-brand-600 font-bold" : "text-slate-500"
        }`}
      >
        <AlertTriangle className="w-5 h-5" />
        <span>Alerts</span>
      </button>

      <button
        onClick={() => onNavigate(user ? "profile" : "login")}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
          currentPage === "profile" || currentPage === "login" ? "text-brand-600 font-bold" : "text-slate-500"
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span>{user ? "Profile" : "Log In"}</span>
      </button>
    </div>
  );
};