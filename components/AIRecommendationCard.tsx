"use client";

import React, { useState } from "react";
import { MemberWithState } from "@/lib/types";
import { generateAIRecommendation } from "@/lib/ai-engine";
import { useCRM } from "@/lib/store";

interface AIRecommendationCardProps {
  member: MemberWithState;
}

export function AIRecommendationCard({ member }: AIRecommendationCardProps) {
  const { updateMember, referenceDate } = useCRM();
  const [recommendationText, setRecommendationText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState("");
  const [acceptedMessage, setAcceptedMessage] = useState(false);

  const handleGenerate = () => {
    const result = generateAIRecommendation(member, member.activities, referenceDate);
    setRecommendationText(result.recommendation);
    setEditableText(result.recommendation);
    setIsEditing(false);
    setAcceptedMessage(false);
  };

  const handleAccept = () => {
    const textToSave = isEditing ? editableText : recommendationText;
    if (textToSave) {
      updateMember(member.id, { nextAction: textToSave });
      setAcceptedMessage(true);
      setTimeout(() => {
        setRecommendationText(null);
        setAcceptedMessage(false);
      }, 2500);
    }
  };

  const handleDismiss = () => {
    setRecommendationText(null);
    setIsEditing(false);
    setAcceptedMessage(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              AI-Assisted Next Action Recommendation
            </h3>
            <p className="text-xs text-zinc-500">
              Community-oriented suggestions. Human review required.
            </p>
          </div>
        </div>

        {!recommendationText && (
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Recommendation
          </button>
        )}
      </div>

      {acceptedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-md text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Accepted recommendation updated in Member Next Action field!
        </div>
      )}

      {recommendationText && !acceptedMessage && (
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/60 dark:border-indigo-800/60 pb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              AI-ASSISTED RECOMMENDATION — SIMULATED
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              Requires Human Review
            </span>
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full text-xs p-2 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          ) : (
            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
              {recommendationText}
            </p>
          )}

          <div className="text-[11px] text-zinc-500 italic bg-white/60 dark:bg-zinc-900/60 p-2 rounded border border-indigo-100 dark:border-indigo-900/40">
            This recommendation is generated from deterministic rules based on member state and activity history. It is designed to be consistent, predictable, and auditable.
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded cursor-pointer"
              >
                Edit
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded cursor-pointer"
            >
              Dismiss
            </button>

            <button
              onClick={handleAccept}
              className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer shadow-xs"
            >
              Accept & Update Next Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
