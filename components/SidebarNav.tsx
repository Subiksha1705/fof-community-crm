"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCRM } from "@/lib/store";

export function SidebarNav() {
  const pathname = usePathname();
  const { getMetrics } = useCRM();
  const metrics = getMetrics();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      count: metrics.total,
    },
    {
      label: "Members Directory",
      href: "/members",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      count: metrics.total,
    },
    {
      label: "Follow-ups Required",
      href: "/follow-ups",
      icon: (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      count: metrics.followUps,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
      highlight: true,
    },
  ];

  const focusedViews = [
    {
      label: "Newly Joined",
      href: "/views/newly-joined",
      count: metrics.newlyJoined,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
    },
    {
      label: "Highly Active",
      href: "/views/highly-active",
      count: metrics.highlyActive,
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200",
    },
    {
      label: "At Risk / Dormant",
      href: "/views/at-risk-dormant",
      count: metrics.atRisk + metrics.dormant,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
            FoF
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white leading-tight">
              Friends of Finance
            </h1>
            <p className="text-xs text-slate-400 font-medium">Activity CRM v2.1</p>
          </div>
        </div>
        <div className="mt-2 text-[11px] bg-slate-800/80 text-emerald-400 px-2 py-1 rounded border border-slate-700/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Activity-First & Safe</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-3 flex-1 flex flex-col gap-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor ||
                        (isActive
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-800 text-slate-300")
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Focused Views */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Focused Views
          </div>
          <nav className="space-y-1">
            {focusedViews.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 border-l-2 border-emerald-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}
                  >
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Help & System Info */}
        <div className="pt-4 border-t border-slate-800">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Methodology & Docs
          </div>
          <Link
            href="/help"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === "/help"
                ? "bg-slate-800 text-emerald-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Help & Methodology</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Volopay Assessment</p>
        <p>Growth Squad Task 3</p>
        <p className="text-[10px] text-slate-400">Single-browser localStorage mode</p>
      </div>
    </aside>
  );
}
