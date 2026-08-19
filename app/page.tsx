"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StateBadge } from "@/components/StateBadge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useCRM } from "@/lib/store";
import { formatCalendarDate, formatRelativeDays, daysBetweenCalendarDates } from "@/lib/date-utils";

export default function DashboardPage() {
  const { getMetrics, getAllMembersWithState, activities, referenceDate } = useCRM();
  const metrics = getMetrics();
  const allMembers = getAllMembersWithState();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sort activities reverse chronological
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Map member names for quick activity lookup
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-12">
      <Header
        title="Community Activity Dashboard"
        subtitle="Transparent activity tracking & community health monitoring"
        onAddMemberClick={() => setIsAddModalOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* USP Highlight Callout */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <span>Community Intelligence Without the Sales Pitch</span>
            </div>
            <h2 className="text-base font-bold tracking-tight">
              Activity-First CRM for Friends of Finance
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Deterministic state engines classify member participation. Commercial signals remain strictly isolated from community health metrics and AI recommendations.
            </p>
          </div>
          <Link
            href="/help"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-xs"
          >
            View Methodology & Rules →
          </Link>
        </div>

        {/* Headline Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs text-zinc-500 font-medium">Total Members</span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              {metrics.total}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Newly Joined</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {metrics.newlyJoined}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.active}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Highly Active</span>
              <span className="w-2 h-2 rounded-full bg-teal-500" />
            </div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {metrics.highlyActive}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">At Risk</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {metrics.atRisk}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Dormant</span>
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-600 dark:text-zinc-400 mt-1">
              {metrics.dormant}
            </div>
          </div>

          <div className="bg-amber-500/10 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 col-span-2 sm:col-span-4 lg:col-span-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                Follow-ups
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {metrics.followUps}
            </div>
          </div>
        </div>

        {/* Follow-up Required Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-lg shrink-0">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {metrics.followUps} Members Require Attention
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Breakdown: <span className="font-semibold">{metrics.newlyJoined} Newly Joined</span> (onboarding support),{" "}
                <span className="font-semibold">{metrics.atRisk} At Risk</span> (re-engagement), and{" "}
                <span className="font-semibold">{metrics.dormant} Dormant</span> (decision required).
              </p>
            </div>
          </div>

          <Link
            href="/follow-ups"
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-xs"
          >
            Review {metrics.followUps} Follow-ups →
          </Link>
        </div>

        {/* Two Column Layout: Recent Activities & Quick Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Community Activities
                </h3>
                <p className="text-xs text-zinc-500">
                  Latest recorded member actions across all community spaces
                </p>
              </div>
              <Link
                href="/members"
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                View Directory →
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentActivities.map((act) => {
                const member = memberMap.get(act.memberId);
                const daysAgo = daysBetweenCalendarDates(act.date, referenceDate);
                return (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {member ? (
                          <Link
                            href={`/members/${member.id}`}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 hover:underline"
                          >
                            {member.name}
                          </Link>
                        ) : (
                          <span className="font-bold text-zinc-900">Unknown</span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
                          {act.space}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-500 font-medium">{act.type}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>Recorded by {act.recordedBy}</span>
                        <span>•</span>
                        <span>Engagement: <strong className="text-zinc-600 dark:text-zinc-300">{act.engagement}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatCalendarDate(act.date)}
                      </span>
                      <div className="text-[11px] text-zinc-400">
                        {formatRelativeDays(daysAgo)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Views & Navigation Cards */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Focused Member Views
              </h3>

              <div className="space-y-2">
                <Link
                  href="/views/newly-joined"
                  className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      Newly Joined ({metrics.newlyJoined})
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-300">
                      Help members make first contribution
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/views/highly-active"
                  className="p-3 rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100/80 dark:hover:bg-teal-900/50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-teal-900 dark:text-teal-200">
                      Highly Active ({metrics.highlyActive})
                    </div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-300">
                      Identify guest posts & interviews
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/views/at-risk-dormant"
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      At Risk / Dormant ({metrics.atRisk + metrics.dormant})
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300">
                      Evaluate re-engagement strategy
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                CRM Safety & Principles
              </h3>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Deterministic Activity Engine (Top-to-bottom rules)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Isolated Commercial Signals (Never affects state)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Human-in-the-loop AI (No automated messages)</span>
                </li>
              </ul>
            </div>
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
