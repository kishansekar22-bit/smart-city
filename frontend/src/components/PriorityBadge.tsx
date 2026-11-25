import React from "react";
import { ComplaintPriority } from "../types";
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "md" }) => {
  const getStyle = () => {
    switch (priority) {
      case "Critical":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-500/20",
          icon: AlertCircle,
          pulse: true,
        };
      case "High":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-700",
          icon: ArrowUp,
          pulse: false,
        };
      case "Medium":
        return {
          bg: "bg-slate-100 border-slate-200 text-slate-700",
          icon: AlertTriangle,
          pulse: false,
        };
      case "Low":
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-600",
          icon: ArrowDown,
          pulse: false,
        };
      default:
        return {
          bg: "bg-slate-100 border-slate-200 text-slate-700",
          icon: AlertTriangle,
          pulse: false,
        };
    }
  };

  const { bg, icon: Icon, pulse } = getStyle();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5 font-medium";

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping mr-0.5" />}
      <Icon className="w-3 h-3" />
      <span>{priority}</span>
    </span>
  );
};