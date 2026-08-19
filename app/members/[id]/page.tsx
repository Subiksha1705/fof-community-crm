"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { StateBadge } from "@/components/StateBadge";
import { EditMemberModal } from "@/components/EditMemberModal";
import { RecordActivityModal } from "@/components/RecordActivityModal";
import { AIRecommendationCard } from "@/components/AIRecommendationCard";
import { CommercialSignalCard } from "@/components/CommercialSignalCard";
import { useCRM } from "@/lib/store";
import { formatCalendarDate, formatRelativeDays, daysBetweenCalendarDates } from "@/lib/date-utils";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { getMemberWithState, referenceDate } = useCRM();

  const member = getMemberWithState(id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordActivityOpen, setIsRecordActivityOpen] = useState(false);

  if (!member) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Member Not Found
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          The requested member record does not exist or was removed.
        </p>
        <Link
          href="/members"
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded text-xs font-semibold"
        >
          Return to Members Directory
        </Link>
      </div>
    );
  }

  const daysSinceJoined = daysBetweenCalendarDates(member.joinedDate, referenceDate);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-16">
      <Header
        title={member.name}
        subtitle={`${member.role} at ${member.company}`}
      />

      <div className="p-6 space-y-6 max-w-6xl w-full mx-auto">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/members"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to Directory
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs cursor-pointer"
            >
              ✏️ Edit Member Profile
            </button>
            <button
              onClick={() => setIsRecordActivityOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Record Activity</span>
            </button>
          </div>
        </div>

        {/* Member Profile Overview Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {member.name}
                </h2>
                <StateBadge state={member.activityState} size="md" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
                {member.role} — <span className="font-semibold text-zinc-900 dark:text-zinc-200">{member.company}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Primary Space:</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
                {member.primarySpace}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 font-medium">Community Owner:</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {member.owner}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-medium">Joined Date:</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {formatCalendarDate(member.joinedDate)} ({formatRelativeDays(daysSinceJoined)})
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-medium">Total Recorded Activities:</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {member.activities.length} activity entries
              </div>
            </div>
          </div>

          {member.notes && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-400 font-medium">Member Notes:</span>
              <p className="text-zinc-700 dark:text-zinc-300 mt-1 italic bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-200 dark:border-zinc-700/60">
                "{member.notes}"
              </p>
            </div>
          )}
        </div>

        {/* State Explanation & Next Action Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity State Card + Transparent Explanation */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Computed Activity State
              </span>
              <StateBadge state={member.activityState} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Last activity:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {member.stateExplanation.lastActivityText}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Activities (Last 14 days):</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {member.stateExplanation.activitiesCount14d}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Activities (Last 30 days):</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {member.stateExplanation.activitiesCount30d}
                </span>
              </div>

              <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700/80">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Transparent Engine Explanation:
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  {member.stateExplanation.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Next Action Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Community Next Action
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Recommended Action:
                </div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  "{member.nextAction || "No next action assigned yet."}"
                </p>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 italic">
              Community actions prioritize member engagement and peer support over commercial outreach.
            </div>
          </div>
        </div>

        {/* AI Assisted Recommendation Engine */}
        <AIRecommendationCard member={member} />

        {/* Commercial Signal Safeguard */}
        <CommercialSignalCard member={member} />

        {/* Activity History Timeline */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Activity History
              </h3>
              <p className="text-xs text-zinc-500">
                Auditable timeline of recorded community contributions
              </p>
            </div>

            <button
              onClick={() => setIsRecordActivityOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs cursor-pointer"
            >
              + Record Activity
            </button>
          </div>

          {member.activities.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
              <div className="text-2xl">📝</div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No activities recorded yet.
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Recommended next step: Help this member share their first contribution in{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">{member.primarySpace}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {member.activities.map((act) => {
                const daysAgo = daysBetweenCalendarDates(act.date, referenceDate);
                const engagementColors = {
                  Low: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300",
                  Medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
                  High: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300",
                };

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCalendarDate(act.date)}
                        </span>
                        <span className="text-zinc-400">({formatRelativeDays(daysAgo)})</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">
                          {act.space}
                        </span>
                        <span className="text-zinc-500">• {act.type}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border ${
                          engagementColors[act.engagement]
                        }`}
                      >
                        Engagement: {act.engagement}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      "{act.description}"
                    </p>

                    {/* Audit Trail info */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>Recorded by: <strong className="text-zinc-600 dark:text-zinc-300">{act.recordedBy}</strong></span>
                      <span>Recorded at: {new Date(act.recordedAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <EditMemberModal
        member={member}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <RecordActivityModal
        memberId={member.id}
        memberName={member.name}
        isOpen={isRecordActivityOpen}
        onClose={() => setIsRecordActivityOpen(false)}
      />
    </div>
  );
}
