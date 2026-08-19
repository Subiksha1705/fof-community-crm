"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StateBadge } from "@/components/StateBadge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useCRM } from "@/lib/store";

export default function FollowUpsPage() {
  const { getFollowUpMembers, activities, referenceDate } = useCRM();
  const followUpMembers = getFollowUpMembers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Split into categories for clear overview
  const atRiskMembers = followUpMembers.filter((m) => m.activityState === "AtRisk");
  const newlyJoinedMembers = followUpMembers.filter((m) => m.activityState === "NewlyJoined");
  const dormantMembers = followUpMembers.filter((m) => m.activityState === "Dormant");

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-16">
      <Header
        title="Follow-ups Required"
        subtitle={`${followUpMembers.length}-member attention queue (Newly Joined + At Risk + Dormant)`}
        onAddMemberClick={() => setIsAddModalOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Urgency Explanation Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                Prioritized Queue
              </span>
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-100">
                {followUpMembers.length} Members Needing Attention
              </h2>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              Sorted strictly by community urgency: <strong>1. At Risk</strong> (high priority re-engagement) → <strong>2. Newly Joined</strong> (onboarding activation) → <strong>3. Dormant</strong> (evaluation required).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
              At Risk: {atRiskMembers.length}
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">
              New: {newlyJoinedMembers.length}
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold">
              Dormant: {dormantMembers.length}
            </span>
          </div>
        </div>

        {followUpMembers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center space-y-3 shadow-xs">
            <div className="text-4xl">🎉</div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              0 members need attention
            </h3>
            <p className="text-xs text-emerald-600 font-semibold">
              Your community is healthy! All members are active or onboarding smoothly.
            </p>

            <div className="pt-6 max-w-xl mx-auto text-left">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 border-b pb-1">
                Recent Community Activity:
              </h4>
              <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                {activities.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <span>• {a.space}: {a.description}</span>
                    <span className="text-zinc-400">{a.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUpMembers.map((member) => {
              const urgencyLabels: Record<string, { label: string; style: string }> = {
                AtRisk: {
                  label: "1. Highest Urgency — At Risk",
                  style: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300",
                },
                NewlyJoined: {
                  label: "2. High Urgency — Newly Joined",
                  style: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300",
                },
                Dormant: {
                  label: "3. Medium Urgency — Dormant",
                  style: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300",
                },
              };

              const currentUrgency = urgencyLabels[member.activityState] || urgencyLabels.Dormant;

              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${currentUrgency.style}`}>
                        {currentUrgency.label}
                      </span>
                      <StateBadge state={member.activityState} size="sm" />
                    </div>

                    <div>
                      <Link
                        href={`/members/${member.id}`}
                        className="text-base font-bold text-zinc-900 dark:text-zinc-50 hover:text-emerald-600 hover:underline"
                      >
                        {member.name}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {member.role} — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{member.company}</span>
                      </p>
                    </div>

                    <div className="text-xs space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex justify-between text-zinc-500">
                        <span>Last Activity:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {member.stateExplanation.lastActivityText}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>Primary Space:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {member.primarySpace}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>Owner:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {member.owner}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700/80 text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Next Action:
                      </span>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        "{member.nextAction || "Encourage community participation"}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/members/${member.id}`}
                      className="w-full text-center block px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                    >
                      View Member & Take Action →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
