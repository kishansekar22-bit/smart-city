import React from "react";
import { ComplaintStatus, ComplaintStatusHistory } from "../types";
import { Check, Clock, UserCheck, PlayCircle, CheckCircle, ShieldAlert } from "lucide-react";

interface ComplaintTimelineProps {
  currentStatus: ComplaintStatus;
  history?: ComplaintStatusHistory[];
}

const STAGES: { status: ComplaintStatus; label: string; icon: any }[] = [
  { status: "Submitted", label: "Grievance Lodged", icon: Clock },
  { status: "Acknowledged", label: "Acknowledged by Dept", icon: Clock },
  { status: "Assigned", label: "Field Officer Assigned", icon: UserCheck },
  { status: "In Progress", label: "Work In Progress", icon: PlayCircle },
  { status: "Resolved", label: "Issue Resolved", icon: CheckCircle },
  { status: "Closed", label: "Grievance Closed", icon: ShieldAlert },
];

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ currentStatus, history = [] }) => {
  const currentIndex = STAGES.findIndex((s) => s.status === currentStatus);

  return (
    <div className="py-4">
      {/* Visual Stepper */}
      <div className="relative">
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden md:block" />
        <div
          className="absolute top-5 left-6 h-0.5 bg-brand-600 transition-all duration-500 -z-0 hidden md:block"
          style={{ width: `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 100))}%` }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            const stageHistory = history.find((h) => h.status === stage.status);

            return (
              <div key={stage.status} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                    isCompleted
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : isCurrent
                      ? "bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100 animate-pulse"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <stage.icon className="w-4 h-4" />
                  )}
                </div>

                <div className="mt-2">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-brand-700"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {stageHistory && (
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {new Date(stageHistory.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {isCurrent && !stageHistory && (
                    <span className="inline-block mt-1 text-[9px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200">
                      CURRENT STAGE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log / Notes history */}
      {history.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Status Audit Log & Actions</h4>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={h.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Stage changed to <span className="text-brand-700 font-extrabold">{h.status}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(h.created_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {h.note && <p className="text-slate-600 mt-1">{h.note}</p>}
                  {h.changed_by_name && (
                    <p className="text-[11px] text-slate-400 mt-0.5">Updated by: {h.changed_by_name} ({h.role_name || "Official"})</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};