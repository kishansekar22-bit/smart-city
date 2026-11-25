import React from "react";
import { ComplaintStatus } from "../types";
import { Clock, Eye, UserCheck, PlayCircle, CheckCircle, ShieldAlert } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStyle = () => {
    switch (status) {
      case "Submitted":
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-700",
          icon: Clock,
        };
      case "Acknowledged":
        return {
          bg: "bg-purple-50 border-purple-200 text-purple-700",
          icon: Eye,
        };
      case "Assigned":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-700",
          icon: UserCheck,
        };
      case "In Progress":
        return {
          bg: "bg-sky-50 border-sky-300 text-sky-800 ring-1 ring-sky-300/50",
          icon: PlayCircle,
        };
      case "Resolved":
        return {
          bg: "bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300/50",
          icon: CheckCircle,
        };
      case "Closed":
        return {
          bg: "bg-slate-100 border-slate-300 text-slate-700",
          icon: ShieldAlert,
        };
      default:
        return {
          bg: "bg-slate-100 border-slate-200 text-slate-700",
          icon: Clock,
        };
    }
  };

  const { bg, icon: Icon } = getStyle();
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${bg} ${sizeClasses}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{status}</span>
    </span>
  );
};