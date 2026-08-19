"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SEED_REFERENCE_DATE } from "@/lib/date-utils";

export default function HelpPage() {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  const checklistItems = [
    { id: 1, text: "Open dashboard → see 20 members, state counts, follow-up count of 10" },
    { id: 2, text: "Search for 'Aarav Mehta' → member appears in results" },
    { id: 3, text: "Open Aarav's detail page → view profile, state, activity history" },
    { id: 4, text: "Review state explanation → understand why he's 'Highly Active'" },
    { id: 5, text: "Add a new activity → confirm it appears in history and state recalculates" },
    { id: 6, text: "Go to Members directory → filter by 'At Risk' → see 3 members" },
    { id: 7, text: "Click Follow-ups → see 10 members needing attention" },
    { id: 8, text: "Go to Newly Joined view → see 4 new members" },
    { id: 9, text: "Return to a member detail → generate AI recommendation → confirm it does not auto-send → click [Dismiss]" },
    { id: 10, text: "Review commercial signal section → confirm it's separate from activity state" },
    { id: 11, text: "Add a new member → save → search for them → refresh browser → confirm they persist" },
    { id: 12, text: "Open Help → review rules, tech stack, safeguards" },
  ];

  const toggleCheck = (id: number) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950 pb-16">
      <Header
        title="Help & Methodology"
        subtitle="System architecture, classification rules, AI safeguards, and verification checklist"
      />

      <div className="p-6 space-y-8 max-w-5xl w-full mx-auto text-xs">
        {/* About This CRM */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>ℹ️</span> About This CRM
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
            This is a community activity-management CRM built for the Volopay Friends of Finance Growth Squad assessment (Task 3). It demonstrates how a community manager can track member engagement, identify who needs attention, and recommend thoughtful community actions — <strong>without converting community participation into sales signals</strong>.
          </p>
        </section>

        {/* Technology Stack & Data Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              ⚡ Technology Stack
            </h3>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
              <li>• <strong>Frontend:</strong> Next.js App Router (TypeScript + React 19)</li>
              <li>• <strong>Styling:</strong> Tailwind CSS v4 (SaaS aesthetic, dark mode support)</li>
              <li>• <strong>State Engine:</strong> Deterministic top-to-bottom rule evaluator</li>
              <li>• <strong>Storage:</strong> Browser localStorage persistence (`fof-crm-data`)</li>
              <li>• <strong>Reference Date:</strong> Anchored to calendar date <strong>{SEED_REFERENCE_DATE}</strong></li>
            </ul>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              🔒 Data Privacy & Fictional Dataset
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              All 20 members and activity records in this application are <strong>entirely fictional</strong>. No real finance professionals from the community are included. No activity is fabricated for real people, and no real community members are contacted.
            </p>
          </section>
        </div>

        {/* Activity-State Rules (PRD Section 8.12) */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              📐 Activity-State Deterministic Calculation Rules
            </h2>
            <p className="text-zinc-500 mt-0.5">
              Rules are evaluated in strict top-to-bottom if-else order — <strong>first match wins</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/80 space-y-1">
              <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>1. DORMANT</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700">60+ Days Inactive</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Last activity date is <strong>≥60 calendar days</strong> ago (or no activities for 60+ days).
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/60 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>2. AT RISK</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">30–59 Days & ≥2 Total</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300">
                Last activity <strong>30–59 calendar days ago</strong> AND member has <strong>≥2 historical activities</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-900/60 space-y-1">
              <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                <span>3. HIGHLY ACTIVE</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100">≥3 in 14d OR 1+ High</span>
              </div>
              <p className="text-teal-800 dark:text-teal-300">
                <strong>≥3 activities in last 14 calendar days</strong> OR <strong>≥1 High-engagement activity in last 14 days</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60 space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>4. NEWLY JOINED</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">Joined ≤14d & &lt;2 Total</span>
              </div>
              <p className="text-blue-800 dark:text-blue-300">
                Joined <strong>≤14 calendar days ago</strong> AND total activities <strong>&lt; 2</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/60 space-y-1">
            <div className="font-bold text-emerald-900 dark:text-emerald-200">
              5. ACTIVE (Fallback)
            </div>
            <p className="text-emerald-800 dark:text-emerald-300">
              Member recorded <strong>≥1 activity in the last 30 calendar days</strong> and does not match rules 1–4.
            </p>
          </div>
        </section>

        {/* AI & Commercial Safeguards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🤖</span> AI Feature Safeguards (Simulated Engine)
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              The AI Recommendation generator is <strong>simulated and deterministic by design</strong>. This guarantees transparent, auditable, and instant suggestions without leaving the browser or sending member data to third-party services.
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded border text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
              <p>✓ No external API calls</p>
              <p>✓ Never sends messages automatically</p>
              <p>✓ Never infers buying intent or reads commercial signals</p>
              <p>✓ Requires human review before accepting</p>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🛡️</span> Commercial Signal Separation
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Commercial signals exist as a separate, human-reviewed field. They demonstrate responsible product design: tracking relevant business context without contaminating community health metrics or automated state calculations.
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded border text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
              <p>✓ Isolated data field</p>
              <p>✓ Never read by state Engine</p>
              <p>✓ Never passed to AI system</p>
              <p>✓ Status: Requires Human Review</p>
            </div>
          </section>
        </div>

        {/* Pre-launch Testing Checklist (Section 12 & 8.12) */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ✅ Interactive Testing & Evaluator Checklist
              </h2>
              <p className="text-zinc-500">
                12-step verification guide for evaluating CRM functionality
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-xs">
              {checkedCount} / {checklistItems.length} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checklistItems.map((item) => {
              const isChecked = !!checklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                    isChecked
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-xs leading-relaxed">
                    <strong>{item.id}.</strong> {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
