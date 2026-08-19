import { Member, Activity, ActivityState } from "./types";
import { daysBetweenCalendarDates, formatRelativeDays, SEED_REFERENCE_DATE } from "./date-utils";

export interface StateCalculationResult {
  state: ActivityState;
  lastActivityDate: string | null;
  daysInactive: number;
  daysSinceJoined: number;
  activitiesInLast14Days: number;
  activitiesInLast30Days: number;
  totalActivities: number;
  lastActivityText: string;
  reason: string;
}

export function getLastActivityDate(activities: Activity[]): string | null {
  if (!activities || activities.length === 0) return null;
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0].date;
}

export function calculateActivityState(
  member: Member,
  activities: Activity[],
  referenceDate: string = SEED_REFERENCE_DATE
): StateCalculationResult {
  const now = referenceDate;
  const lastActivityDate = getLastActivityDate(activities);
  const daysInactive = lastActivityDate
    ? daysBetweenCalendarDates(lastActivityDate, now)
    : 999;
  const daysSinceJoined = daysBetweenCalendarDates(member.joinedDate, now);

  const activitiesInLast14Days = activities.filter(
    (a) =>
      daysBetweenCalendarDates(a.date, now) >= 0 &&
      daysBetweenCalendarDates(a.date, now) <= 14
  ).length;

  const activitiesInLast30Days = activities.filter(
    (a) =>
      daysBetweenCalendarDates(a.date, now) >= 0 &&
      daysBetweenCalendarDates(a.date, now) <= 30
  ).length;

  const hasHighEngagementInLast14Days = activities
    .filter(
      (a) =>
        daysBetweenCalendarDates(a.date, now) >= 0 &&
        daysBetweenCalendarDates(a.date, now) <= 14
    )
    .some((a) => a.engagement === "High");

  const totalActivities = activities.length;
  const lastActivityText = lastActivityDate
    ? formatRelativeDays(daysInactive)
    : "No activities recorded yet";

  let state: ActivityState = "Active";
  let reason = "";

  // Rule 1: Dormant (daysInactive >= 60)
  if (daysInactive >= 60) {
    state = "Dormant";
    reason = `Member has been inactive for ${daysInactive} calendar days (>= 60 days).`;
  }
  // Rule 2: At Risk (daysInactive 30-59 and totalActivities >= 2)
  else if (daysInactive >= 30 && daysInactive < 60 && totalActivities >= 2) {
    state = "AtRisk";
    reason = `Member was previously active (${totalActivities} historical activities) but has no community activity for ${daysInactive} days.`;
  }
  // Rule 3: Highly Active (>= 3 activities in last 14 days OR 1+ High engagement in last 14 days)
  else if (activitiesInLast14Days >= 3 || hasHighEngagementInLast14Days) {
    state = "HighlyActive";
    if (hasHighEngagementInLast14Days) {
      reason = `Member recorded high-engagement activity within the last 14 calendar days (${activitiesInLast14Days} total in 14d).`;
    } else {
      reason = `Member recorded ${activitiesInLast14Days} activities within the last 14 calendar days (>= 3 required).`;
    }
  }
  // Rule 4: Newly Joined (joinedDate <= 14 days and totalActivities < 2)
  else if (daysSinceJoined <= 14 && totalActivities < 2) {
    state = "NewlyJoined";
    reason = `New member in onboarding period (joined ${daysSinceJoined} days ago, ${totalActivities} activities).`;
  }
  // Rule 5: Active (>= 1 activity in last 30 days)
  else if (activitiesInLast30Days >= 1) {
    state = "Active";
    reason = `Member has steady community participation (${activitiesInLast30Days} activity in the last 30 days).`;
  }
  // Fallback 1: brand new with no activity at all
  else if (totalActivities === 0 && daysSinceJoined <= 14) {
    state = "NewlyJoined";
    reason = "New member in onboarding period. No community activity recorded yet.";
  }
  // Fallback 2: Default Active
  else {
    state = "Active";
    reason = "Member maintains general active status.";
  }

  return {
    state,
    lastActivityDate,
    daysInactive,
    daysSinceJoined,
    activitiesInLast14Days,
    activitiesInLast30Days,
    totalActivities,
    lastActivityText,
    reason,
  };
}
