import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Building2, Lock, Mail, ArrowRight, UserCheck, Briefcase, Shield, Sparkles } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please provide both email and password.");
      return;
    }
    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.full_name}!`, "Authentication Successful");
      if (user.role === "admin") onNavigate("admin-dashboard");
      else if (user.role === "official") onNavigate("admin-complaints");
      else onNavigate("citizen-dashboard");
    } catch (err: any) {
      error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "citizen" | "official" | "admin") => {
    try {
      setLoading(true);
      await demoLogin(role);
      success(`Signed in as demo ${role.toUpperCase()}`, "Quick Persona Active");
      if (role === "admin") onNavigate("admin-dashboard");
      else if (role === "official") onNavigate("admin-complaints");
      else onNavigate("citizen-dashboard");
    } catch (err: any) {
      error("Quick login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen & Staff Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access grievance reporting, municipal management & city analytics
          </p>
        </div>

        {/* 1-Click Demo Personas Strip for Grading */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant 1-Click Demo Login</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemo("citizen")}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm flex flex-col items-center justify-center transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
              <span>Citizen</span>
              <span className="text-[9px] text-slate-400 font-normal">Aarav Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("official")}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-brand-50 text-brand-800 border border-brand-200 shadow-sm flex flex-col items-center justify-center transition-colors"
            >
              <Briefcase className="w-4 h-4 text-brand-600 mb-0.5" />
              <span>City Official</span>
              <span className="text-[9px] text-slate-400 font-normal">Priya (BBMP)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 shadow-sm flex flex-col items-center justify-center transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-600 mb-0.5" />
              <span>Admin</span>
              <span className="text-[9px] text-slate-400 font-normal">Dr. Ramesh</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartcity.gov.in"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>New citizen without an account? </span>
          <button
            onClick={() => onNavigate("register")}
            className="text-brand-600 font-bold hover:underline"
          >
            Create Citizen Account
          </button>
        </div>
      </div>
    </div>
  );
};