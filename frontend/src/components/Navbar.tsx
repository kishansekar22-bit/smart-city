import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { alertService } from "../services/api";
import { EmergencyAlert, UserRole } from "../types";
import {
  Building2,
  Bell,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  Shield,
  Briefcase,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const { user, logout, demoLogin } = useAuth();
  const { success } = useToast();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await alertService.getAlerts({ active_only: true });
        setActiveAlerts(alerts);
      } catch {
        // ignore
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlert = activeAlerts.find((a) => a.severity === "Critical") || activeAlerts[0];

  const handleDemoSwitch = async (role: UserRole) => {
    await demoLogin(role);
    setShowRoleMenu(false);
    success(`Switched active session to ${role.toUpperCase()} persona`, "Persona Switched");
    if (role === "admin") {
      onNavigate("admin-dashboard");
    } else if (role === "official") {
      onNavigate("admin-complaints");
    } else {
      onNavigate("citizen-dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Critical Alert Bar if active */}
      {criticalAlert && (
        <div
          onClick={() => onNavigate("alerts")}
          className={`cursor-pointer px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            criticalAlert.severity === "Critical"
              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
              : "bg-amber-500 hover:bg-amber-600 text-slate-900"
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-semibold uppercase tracking-wider">
            [{criticalAlert.severity} ALERT]
          </span>
          <span className="truncate max-w-xl">{criticalAlert.title}</span>
          <span className="underline ml-1 hidden sm:inline">View advisory &rarr;</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand and Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              onClick={() => onNavigate(user ? (user.role === "citizen" ? "citizen-dashboard" : "admin-dashboard") : "landing")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-tealbrand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900">SMART CITY</span>
                  <span className="bg-brand-100 text-brand-700 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded">360</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Municipal Corporation & Citizen Services</p>
              </div>
            </div>
          </div>

          {/* Center: Quick navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate("landing")}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("city-map")}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Live Map
            </button>
            <button
              onClick={() => onNavigate("services")}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => onNavigate("announcements")}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Announcements
            </button>
            <button
              onClick={() => onNavigate("alerts")}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors relative"
            >
              Alerts
              {activeAlerts.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-600 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Persona Switcher, Report Issue, and User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100 transition-colors shadow-sm"
                title="Switch demo persona instantly"
              >
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden sm:inline">Role:</span>
                <span className="capitalize font-bold text-brand-700">{user?.role || "Guest"}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">1-Click Demo Persona</p>
                    <p className="text-xs text-slate-500">Switch role for testing</p>
                  </div>
                  <button
                    onClick={() => handleDemoSwitch("citizen")}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      user?.role === "citizen" ? "bg-brand-50/70 text-brand-700 font-semibold" : "text-slate-700"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Citizen Persona</p>
                      <p className="text-[11px] text-slate-500">Aarav Sharma (Reports & Tracks)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("official")}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      user?.role === "official" ? "bg-brand-50/70 text-brand-700 font-semibold" : "text-slate-700"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="font-semibold">City Official Persona</p>
                      <p className="text-[11px] text-slate-500">Priya Nambiar (Roads Dept)</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("admin")}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      user?.role === "admin" ? "bg-brand-50/70 text-brand-700 font-semibold" : "text-slate-700"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold">Administrator Persona</p>
                      <p className="text-[11px] text-slate-500">Dr. Ramesh Kumar (Full Access)</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Report Issue Button */}
            <button
              onClick={() => onNavigate("report-issue")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-tealbrand-600 rounded-lg shadow-sm hover:from-brand-700 hover:to-tealbrand-700 transition-all transform active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="User profile menu"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                      {user.full_name.charAt(0)}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-sm text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {user.role}
                        </span>
                        {user.department_name && (
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px]">
                            {user.department_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (user.role === "citizen") onNavigate("citizen-dashboard");
                        else onNavigate("admin-dashboard");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        success("Signed out successfully");
                        onNavigate("landing");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate("login")}
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};