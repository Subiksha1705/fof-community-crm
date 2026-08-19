import React from "react";
import { ActivityState } from "@/lib/types";

interface StateBadgeProps {
  state: ActivityState;
  size?: "sm" | "md" | "lg";
}

export function StateBadge({ state, size = "md" }: StateBadgeProps) {
  const styles: Record<ActivityState, { label: string; className: string }> = {
    NewlyJoined: {
      label: "Newly Joined",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    },
    Active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    },
    HighlyActive: {
      label: "Highly Active",
      className: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    },
    AtRisk: {
      label: "At Risk",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    },
    Dormant: {
      label: "Dormant",
      className: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    },
  };

  const current = styles[state] || styles.Active;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs rounded",
    md: "px-2.5 py-1 text-xs font-semibold rounded-md border",
    lg: "px-3 py-1.5 text-sm font-semibold rounded-md border",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border ${current.className} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {current.label}
    </span>
  );
}
