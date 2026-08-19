import { Member, Activity, ActivityState } from "./types";
import { calculateActivityState } from "./state-engine";

export interface AIRecommendationResult {
  recommendation: string;
  generatedAt: string;
  isSimulated: true;
}

export function generateAIRecommendation(
  member: Member,
  activities: Activity[],
  referenceDate?: string
): AIRecommendationResult {
  const stateResult = calculateActivityState(member, activities, referenceDate);
  const state: ActivityState = stateResult.state;
  const primarySpace = member.primarySpace;

  let recommendation = "";

  if (state === "HighlyActive") {
    recommendation =
      `This member is highly active in ${primarySpace}. ` +
      `Consider inviting them to contribute a guest piece or interview ` +
      `about their practical experience. This could help newer members learn from them.`;
  } else if (state === "AtRisk") {
    recommendation =
      `This member was previously active but has gone quiet. ` +
      `Consider surfacing a recent discussion relevant to ${primarySpace} ` +
      `to re-engage them. A personal message highlighting a peer's question might help.`;
  } else if (state === "NewlyJoined") {
    recommendation =
      `This is a new member. Help them get their first contribution by ` +
      `inviting them to share a question or introduction in ${primarySpace}.`;
  } else if (state === "Active") {
    recommendation =
      `This member has steady engagement. Continue monitoring their participation ` +
      `and consider highlighting relevant discussions in their primary space (${primarySpace}).`;
  } else if (state === "Dormant") {
    recommendation =
      `This member has been silent for a long time. Before reaching out, ` +
      `review whether a re-engagement makes sense. If you do reach out, ` +
      `keep it personal and low-pressure.`;
  } else {
    recommendation = `Unable to generate recommendation at this time.`;
  }

  return {
    recommendation,
    generatedAt: new Date().toISOString(),
    isSimulated: true,
  };
}
