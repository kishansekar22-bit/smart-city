import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { complaintService } from "../services/api";
import { Complaint } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { User, Mail, Phone, Shield, Building, LogOut, CheckCircle2, FileText, ArrowRight } from "lucide-react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout, demoLogin } = useAuth();
  const { success } = useToast();
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (user) {
      complaintService.getComplaints({ citizen_id: user.id }).then((d) => setUserComplaints(d.complaints)).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">Please sign in to view your profile.</p>
        <button
          onClick={() => onNavigate("login")}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-50" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user.full_name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.full_name}</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
            </p>
            {user.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone}</span>
              </p>
            )}
            {user.department_name && (
              <p className="text-xs text-brand-800 font-semibold flex items-center gap-1.5 pt-1">
                <Building className="w-3.5 h-3.5 text-brand-600" />
                <span>{user.department_name}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            success("Signed out successfully");
            onNavigate("landing");
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 1-Click Role Switcher */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Quick Testing Persona Switcher</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={async () => {
              await demoLogin("citizen");
              success("Logged in as Citizen (Aarav Sharma)");
              onNavigate("citizen-dashboard");
            }}
            className="p-3 bg-white hover:bg-brand-50 border border-slate-200 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-emerald-800">1. Citizen Persona</p>
            <p className="text-[11px] text-slate-500">Aarav Sharma (citizen@smartcity.gov.in)</p>
          </button>

          <button
            onClick={async () => {
              await demoLogin("official");
              success("Logged in as City Official (Priya Nambiar - BBMP Roads)");
              onNavigate("admin-complaints");
            }}
            className="p-3 bg-white hover:bg-brand-50 border border-slate-200 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-brand-800">2. City Official Persona</p>
            <p className="text-[11px] text-slate-500">Priya Nambiar (official@smartcity.gov.in)</p>
          </button>

          <button
            onClick={async () => {
              await demoLogin("admin");
              success("Logged in as Administrator (Dr. Ramesh Kumar)");
              onNavigate("admin-dashboard");
            }}
            className="p-3 bg-white hover:bg-brand-50 border border-slate-200 rounded-xl text-left text-xs transition-colors"
          >
            <p className="font-bold text-purple-800">3. Administrator Persona</p>
            <p className="text-[11px] text-slate-500">Dr. Ramesh Kumar (admin@smartcity.gov.in)</p>
          </button>
        </div>
      </div>

      {/* User's Lodged Complaints History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>My Submitted Grievance History ({userComplaints.length})</span>
          </h3>
          <button
            onClick={() => onNavigate("report-issue")}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            + Report New
          </button>
        </div>

        {userComplaints.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            You haven't submitted any complaints under this account yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {userComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate(`complaint-detail-${c.id}`)}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brand-700">{c.ticket_id}</span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs text-slate-600 font-medium">{c.category}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{c.title}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={c.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};