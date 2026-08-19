"use client";

import React, { useState } from "react";
import { useCRM } from "@/lib/store";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddMemberClick?: () => void;
}

export function Header({ title, subtitle, onAddMemberClick }: HeaderProps) {
  const { referenceDate, resetToSeedData } = useCRM();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Baseline Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
          <span className="text-zinc-400">Baseline Date:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{referenceDate}</span>
        </div>

        {/* Add Member Button if supported */}
        {onAddMemberClick && (
          <button
            onClick={onAddMemberClick}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        )}

        {/* Reset Seed Data Button */}
        {showResetConfirm ? (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded-md border border-amber-300 dark:border-amber-700 text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-medium px-1">Reset to 20 seed members?</span>
            <button
              onClick={() => {
                resetToSeedData();
                setShowResetConfirm(false);
              }}
              className="bg-amber-600 text-white px-2 py-1 rounded font-bold hover:bg-amber-700 cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline cursor-pointer px-2 py-1.5"
            title="Reset data back to original 20 seed members"
          >
            Reset Seed Data
          </button>
        )}
      </div>
    </header>
  );
}
