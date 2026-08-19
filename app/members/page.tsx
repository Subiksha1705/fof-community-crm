"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StateBadge } from "@/components/StateBadge";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useCRM } from "@/lib/store";
import { ActivityState, CommunitySpace } from "@/lib/types";

export default function MembersDirectoryPage() {
  const { getAllMembersWithState } = useCRM();
  const allMembers = getAllMembersWithState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedSpace, setSelectedSpace] = useState<string>("ALL");
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"lastActivity" | "name" | "joinedDate">("lastActivity");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Extract unique owners & spaces
  const uniqueOwners = useMemo(() => {
    const set = new Set(allMembers.map((m) => m.owner));
    return Array.from(set);
  }, [allMembers]);

  const uniqueSpaces: CommunitySpace[] = [
    "Say Hello",
    "Ask Finance Peers",
    "Finance Workflows",
    "Tools & Systems",
    "Career & Compensation",
    "Water Cooler",
  ];

  // Filter & sort logic
  const filteredMembers = useMemo(() => {
    return allMembers
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchRole = m.role.toLowerCase().includes(q);
          const matchCompany = m.company.toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchCompany) return false;
        }

        // State filter
        if (selectedState !== "ALL" && m.activityState !== selectedState) {
          return false;
        }

        // Space filter
        if (selectedSpace !== "ALL" && m.primarySpace !== selectedSpace) {
          return false;
        }

        // Owner filter
        if (selectedOwner !== "ALL" && m.owner !== selectedOwner) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "joinedDate") {
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        }
        // default: lastActivity (fewest days inactive comes first)
        return a.stateExplanation.daysInactive - b.stateExplanation.daysInactive;
      });
  }, [allMembers, searchQuery, selectedState, selectedSpace, selectedOwner, sortBy]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-12">
      <Header
        title="Members Directory"
        subtitle={`Viewing ${filteredMembers.length} of ${allMembers.length} community members`}
        onAddMemberClick={() => setIsAddModalOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search member by name, role, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                <option value="lastActivity">Most Recent Activity</option>
                <option value="name">Name (A-Z)</option>
                <option value="joinedDate">Joined Date (Newest)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {/* State Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-500">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                <option value="ALL">All States ({allMembers.length})</option>
                <option value="NewlyJoined">Newly Joined</option>
                <option value="Active">Active</option>
                <option value="HighlyActive">Highly Active</option>
                <option value="AtRisk">At Risk</option>
                <option value="Dormant">Dormant</option>
              </select>
            </div>

            {/* Space Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-500">Space:</span>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                <option value="ALL">All Spaces</option>
                {uniqueSpaces.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-500">Owner:</span>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                <option value="ALL">All Owners</option>
                {uniqueOwners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedState !== "ALL" || selectedSpace !== "ALL" || selectedOwner !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedState("ALL");
                  setSelectedSpace("ALL");
                  setSelectedOwner("ALL");
                }}
                className="text-xs text-emerald-600 hover:underline font-semibold ml-auto cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No members found matching "{searchQuery}"
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try checking spelling, searching by role/company, or clearing active filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedState("ALL");
                  setSelectedSpace("ALL");
                  setSelectedOwner("ALL");
                }}
                className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                View All Members
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Role & Company</th>
                    <th className="py-3.5 px-4">Primary Space</th>
                    <th className="py-3.5 px-4">Activity State</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4">Owner</th>
                    <th className="py-3.5 px-4">Next Action</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredMembers.map((m) => (
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
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {m.owner}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-700 dark:text-zinc-300">
                        {m.nextAction || "—"}
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
          )}
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
