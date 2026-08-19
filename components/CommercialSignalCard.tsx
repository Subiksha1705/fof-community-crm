"use client";

import React, { useState } from "react";
import { MemberWithState } from "@/lib/types";
import { useCRM } from "@/lib/store";

interface CommercialSignalCardProps {
  member: MemberWithState;
}

export function CommercialSignalCard({ member }: CommercialSignalCardProps) {
  const { updateMember } = useCRM();
  const [isEditing, setIsEditing] = useState(false);
  const [signalText, setSignalText] = useState(member.commercialSignal || "");

  const handleSave = () => {
    updateMember(member.id, { commercialSignal: signalText.trim() || null });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Commercial Signal Isolation (Assessment Safeguard)
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Completely separate from community activity metrics
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
        >
          {isEditing ? "Cancel" : member.commercialSignal ? "Edit Signal" : "+ Add Signal"}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            placeholder="e.g. Evaluating ERP software vendors in Q4..."
            value={signalText}
            onChange={(e) => setSignalText(e.target.value)}
            className="w-full text-xs p-2 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
            >
              Save Signal
            </button>
          </div>
        </div>
      ) : (
        <div>
          {member.commercialSignal ? (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  Detected Commercial Context:
                </span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">
                  Requires Human Review
                </span>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                "{member.commercialSignal}"
              </p>
            </div>
          ) : (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-md text-xs text-zinc-500 italic">
              No commercial signals recorded for this member.
            </div>
          )}
        </div>
      )}

      {/* Strict Separation Guarantees per PRD */}
      <div className="bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
          Strict Separation Safeguards:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓</span> Does NOT affect activity state
          </li>
          <li className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓</span> Does NOT affect engagement score
          </li>
          <li className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓</span> Does NOT trigger automatic outreach
          </li>
          <li className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✓</span> Does NOT inform AI recommendations
          </li>
        </ul>
      </div>
    </div>
  );
}
