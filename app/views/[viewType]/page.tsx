"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { StateBadge } from "@/components/StateBadge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useCRM } from "@/lib/store";

export default function FocusedViewPage() {
  const params = useParams();
  const viewType = params?.viewType as "newly-joined" | "highly-active" | "at-risk-dormant";
  const { getFocusedViewMembers } = useCRM();

  const members = getFocusedViewMembers(viewType);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const viewConfigs: Record<
    typeof viewType,
    { title: string; subtitle: string; icon: string; focusGoal: string }
  > = {
    "newly-joined": {
      title: "Newly Joined Members View",
      subtitle: "Focus on onboarding & encouraging first community contribution",
      icon: "🌱",
      focusGoal:
        "4 Members in Onboarding: Help them introduce themselves or ask a question in their Primary Space within their first 14 days.",
    },
    "highly-active": {
      title: "Highly Active Members View",
      subtitle: "Identify core contributors, guest writers, and peer mentors",
      icon: "🔥",
      focusGoal:
        "4 Highly Active Members: Recognize strong contributions, invite to facilitate roundtables or contribute guest posts.",
    },
    "at-risk-dormant": {
      title: "At Risk & Dormant Members View",
      subtitle: "Re-engagement evaluation and light check-in decision queue",
      icon: "💤",
      focusGoal:
        "6 Silent Members (3 At Risk, 3 Dormant): Evaluate whether to surface relevant peer discussions or let dormant members rest.",
    },
  };

  const currentConfig = viewConfigs[viewType] || {
    title: "Focused View",
    subtitle: "Custom member view",
    icon: "📋",
    focusGoal: "Review member activity and take targeted actions.",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-16">
      <Header
        title={currentConfig.title}
        subtitle={currentConfig.subtitle}
        onAddMemberClick={() => setIsAddModalOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Goal Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="text-3xl">{currentConfig.icon}</div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Community Strategy Focus
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {currentConfig.focusGoal}
            </p>
          </div>
        </div>

        {/* Directory Table for Focused View */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Members in View ({members.length})
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              Filtered by computed state
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Role & Company</th>
                  <th className="py-3.5 px-4">Primary Space</th>
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4">Next Action</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      <Link
                        href={`/members/${m.id}`}
                        className="hover:text-emerald-600 hover:underline"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {m.role}
                      </div>
                      <div className="text-[11px] text-zinc-500">{m.company}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px]">
                        {m.primarySpace}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StateBadge state={m.activityState} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {m.stateExplanation.lastActivityText}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-emerald-700 dark:text-emerald-400 font-medium">
                      "{m.nextAction || "—"}"
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/members/${m.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                      >
                        View Member →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
