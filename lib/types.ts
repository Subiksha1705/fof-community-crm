export type ActivityState =
  | "NewlyJoined"
  | "Active"
  | "HighlyActive"
  | "AtRisk"
  | "Dormant";

export type CommunitySpace =
  | "Say Hello"
  | "Ask Finance Peers"
  | "Finance Workflows"
  | "Tools & Systems"
  | "Career & Compensation"
  | "Water Cooler";

export type ActivityType =
  | "Introduction"
  | "Post"
  | "Comment"
  | "Question"
  | "Answer"
  | "Resource contribution"
  | "Job interaction"
  | "Interview/story";

export type EngagementLevel = "Low" | "Medium" | "High";

export interface Member {
  id: string;
  name: string;
  role: string;
  company: string;
  primarySpace: CommunitySpace;
  owner: string;
  joinedDate: string; // ISO 8601 calendar date "YYYY-MM-DD"
  notes: string;
  nextAction: string;
  commercialSignal: string | null; // Isolated field
  createdAt: string; // ISO 8601 string
}

export interface Activity {
  id: string;
  memberId: string;
  date: string; // ISO 8601 calendar date "YYYY-MM-DD"
  space: CommunitySpace;
  type: ActivityType;
  description: string;
  engagement: EngagementLevel;
  recordedBy: string;
  recordedAt: string; // ISO 8601 date-time string
  createdAt: string;
}

export interface MemberWithState extends Member {
  activityState: ActivityState;
  stateExplanation: {
    lastActivityText: string;
    activitiesCount14d: number;
    activitiesCount30d: number;
    totalActivities: number;
    daysInactive: number;
    daysSinceJoined: number;
    reason: string;
  };
  activities: Activity[];
}
