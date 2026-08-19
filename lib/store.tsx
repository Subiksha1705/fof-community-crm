"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Member, Activity, MemberWithState, ActivityState } from "./types";
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, validateSeedData } from "./seed-data";
import { calculateActivityState } from "./state-engine";
import { SEED_REFERENCE_DATE } from "./date-utils";

const LOCAL_STORAGE_KEY = "fof-crm-data-v2";

interface CRMStoreContextType {
  members: Member[];
  activities: Activity[];
  referenceDate: string;
  isInitialized: boolean;
  validationError: string | null;
  addMember: (data: Omit<Member, "id" | "createdAt">) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  addActivity: (data: Omit<Activity, "id" | "createdAt" | "recordedAt">) => Activity;
  resetToSeedData: () => void;
  getMemberWithState: (id: string) => MemberWithState | null;
  getAllMembersWithState: () => MemberWithState[];
  getFollowUpMembers: () => MemberWithState[];
  getFocusedViewMembers: (
    viewType: "newly-joined" | "highly-active" | "at-risk-dormant"
  ) => MemberWithState[];
  getMetrics: () => {
    total: number;
    newlyJoined: number;
    active: number;
    highlyActive: number;
    atRisk: number;
    dormant: number;
    followUps: number;
  };
}

const CRMContext = createContext<CRMStoreContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [referenceDate] = useState<string>(SEED_REFERENCE_DATE);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Startup validation & localStorage load
  useEffect(() => {
    try {
      // Validate initial seed data
      const validation = validateSeedData(INITIAL_MEMBERS, INITIAL_ACTIVITIES, SEED_REFERENCE_DATE);
      if (!validation.isValid) {
        console.error("Seed data validation failed:", validation.errors);
        setValidationError(`Seed data invalid: ${validation.errors.join(", ")}`);
      } else {
        console.log("✓ Seed data validation passed:", validation.distribution);
      }

      // Clear legacy storage key if present
      localStorage.removeItem("fof-crm-data");

      // Check localStorage for persisted user edits
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Ensure saved data is from 2026 reference timeline
        const hasLegacy2024Data = parsed.activities && parsed.activities.some((a: any) => a.date && a.date.startsWith("2024"));
        if (hasLegacy2024Data) {
          console.warn("Legacy 2024 localStorage data detected. Resetting to 2026 seed dataset.");
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
          if (parsed.members && Array.isArray(parsed.members)) {
            setMembers(parsed.members);
          }
          if (parsed.activities && Array.isArray(parsed.activities)) {
            setActivities(parsed.activities);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load CRM state from localStorage:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage on state change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ members, activities })
      );
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }, [members, activities, isInitialized]);

  const addMember = (data: Omit<Member, "id" | "createdAt">): Member => {
    const newMember: Member = {
      ...data,
      id: `m-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const addActivity = (
    data: Omit<Activity, "id" | "createdAt" | "recordedAt">
  ): Activity => {
    const nowISO = new Date().toISOString();
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      recordedAt: nowISO,
      createdAt: nowISO,
    };
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  const resetToSeedData = () => {
    setMembers(INITIAL_MEMBERS);
    setActivities(INITIAL_ACTIVITIES);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const getMemberWithState = (id: string): MemberWithState | null => {
    const member = members.find((m) => m.id === id);
    if (!member) return null;
    const memberActivities = activities.filter((a) => a.memberId === id);
    const calcResult = calculateActivityState(member, memberActivities, referenceDate);

    return {
      ...member,
      activityState: calcResult.state,
      stateExplanation: {
        lastActivityText: calcResult.lastActivityText,
        activitiesCount14d: calcResult.activitiesInLast14Days,
        activitiesCount30d: calcResult.activitiesInLast30Days,
        totalActivities: calcResult.totalActivities,
        daysInactive: calcResult.daysInactive,
        daysSinceJoined: calcResult.daysSinceJoined,
        reason: calcResult.reason,
      },
      activities: memberActivities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  };

  const getAllMembersWithState = (): MemberWithState[] => {
    return members.map((m) => {
      const memberActivities = activities.filter((a) => a.memberId === m.id);
      const calcResult = calculateActivityState(m, memberActivities, referenceDate);
      return {
        ...m,
        activityState: calcResult.state,
        stateExplanation: {
          lastActivityText: calcResult.lastActivityText,
          activitiesCount14d: calcResult.activitiesInLast14Days,
          activitiesCount30d: calcResult.activitiesInLast30Days,
          totalActivities: calcResult.totalActivities,
          daysInactive: calcResult.daysInactive,
          daysSinceJoined: calcResult.daysSinceJoined,
          reason: calcResult.reason,
        },
        activities: memberActivities.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    });
  };

  const getFollowUpMembers = (): MemberWithState[] => {
    const all = getAllMembersWithState();
    // Follow-ups required = Newly Joined + At Risk + Dormant
    const followUps = all.filter(
      (m) =>
        m.activityState === "NewlyJoined" ||
        m.activityState === "AtRisk" ||
        m.activityState === "Dormant"
    );

    // Urgency sort: (1) At Risk — highest, (2) Newly Joined — high, (3) Dormant — medium
    const urgencyOrder: Record<ActivityState, number> = {
      AtRisk: 1,
      NewlyJoined: 2,
      Dormant: 3,
      HighlyActive: 4,
      Active: 5,
    };

    return followUps.sort(
      (a, b) => urgencyOrder[a.activityState] - urgencyOrder[b.activityState]
    );
  };

  const getFocusedViewMembers = (
    viewType: "newly-joined" | "highly-active" | "at-risk-dormant"
  ): MemberWithState[] => {
    const all = getAllMembersWithState();
    if (viewType === "newly-joined") {
      return all.filter((m) => m.activityState === "NewlyJoined");
    }
    if (viewType === "highly-active") {
      return all.filter((m) => m.activityState === "HighlyActive");
    }
    if (viewType === "at-risk-dormant") {
      return all.filter(
        (m) => m.activityState === "AtRisk" || m.activityState === "Dormant"
      );
    }
    return [];
  };

  const getMetrics = () => {
    const all = getAllMembersWithState();
    let newlyJoined = 0;
    let active = 0;
    let highlyActive = 0;
    let atRisk = 0;
    let dormant = 0;

    all.forEach((m) => {
      if (m.activityState === "NewlyJoined") newlyJoined++;
      else if (m.activityState === "Active") active++;
      else if (m.activityState === "HighlyActive") highlyActive++;
      else if (m.activityState === "AtRisk") atRisk++;
      else if (m.activityState === "Dormant") dormant++;
    });

    const followUps = newlyJoined + atRisk + dormant;

    return {
      total: all.length,
      newlyJoined,
      active,
      highlyActive,
      atRisk,
      dormant,
      followUps,
    };
  };

  return (
    <CRMContext.Provider
      value={{
        members,
        activities,
        referenceDate,
        isInitialized,
        validationError,
        addMember,
        updateMember,
        addActivity,
        resetToSeedData,
        getMemberWithState,
        getAllMembersWithState,
        getFollowUpMembers,
        getFocusedViewMembers,
        getMetrics,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
