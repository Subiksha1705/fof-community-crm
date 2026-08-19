"use client";

import React, { useState } from "react";
import { useCRM } from "@/lib/store";
import { CommunitySpace, ActivityType, EngagementLevel } from "@/lib/types";

interface RecordActivityModalProps {
  memberId: string;
  memberName: string;
  isOpen: boolean;
  onClose: () => void;
}

const SPACES: CommunitySpace[] = [
  "Say Hello",
  "Ask Finance Peers",
  "Finance Workflows",
  "Tools & Systems",
  "Career & Compensation",
  "Water Cooler",
];

const TYPES: ActivityType[] = [
  "Introduction",
  "Post",
  "Comment",
  "Question",
  "Answer",
  "Resource contribution",
  "Job interaction",
  "Interview/story",
];

export function RecordActivityModal({
  memberId,
  memberName,
  isOpen,
  onClose,
}: RecordActivityModalProps) {
  const { addActivity, referenceDate } = useCRM();

  const [date, setDate] = useState(referenceDate);
  const [space, setSpace] = useState<CommunitySpace>("Finance Workflows");
  const [type, setType] = useState<ActivityType>("Comment");
  const [description, setDescription] = useState("");
  const [engagement, setEngagement] = useState<EngagementLevel>("Medium");
  const [recordedBy, setRecordedBy] = useState("Community Team");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addActivity({
      memberId,
      date: date || referenceDate,
      space,
      type,
      description: description.trim(),
      engagement,
      recordedBy: recordedBy.trim() || "Community Team",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Record Activity
            </h2>
            <p className="text-xs text-zinc-500">
              Log community activity for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{memberName}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Activity Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Community Space *
              </label>
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value as CommunitySpace)}
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                {SPACES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Activity Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Shared ERP implementation template & answered member questions."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Engagement Level *
            </label>
            <div className="flex gap-4 pt-1">
              {(["Low", "Medium", "High"] as EngagementLevel[]).map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="engagement"
                    value={level}
                    checked={engagement === level}
                    onChange={() => setEngagement(level)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Recorded By (Audit Trail)
            </label>
            <input
              type="text"
              required
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer shadow-xs"
            >
              Save Activity & Recalculate State
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
