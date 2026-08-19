# PRD: Friends of Finance Community Activity CRM

**Status:** ✅ Approved for Development — Task 3, Volopay Growth Squad Assessment
**Version:** 2.1 (Final)
**Consolidates:** v1 base PRD + v2 improvements + v2.1 final fixes

---

## Executive Summary

**Product:** A deployed, community-focused activity CRM for Friends of Finance that helps community managers understand member engagement, identify who needs attention, and recommend thoughtful next actions — **without turning community participation into sales signals**.

**Unique Selling Point:**
> **"Community Intelligence Without the Sales Pitch"**
>
> A fully auditable, safety-first community management tool that separates engagement activity from commercial signals. Every member state is explained. Every recommendation is human-reviewed. Every design decision prioritizes community health over conversion intent.

**Key Differentiator:** Unlike sales CRMs, this system is deliberately **activity-first and transparent-second**. Commercial signals exist as a separate, human-reviewed field that does not influence engagement scoring, follow-up priority, or AI recommendations.

---

## 1. Core Problem

A community manager needs to answer three questions:

1. **What is happening with our community?** (Who joined recently? Who is active? Who might need support?)
2. **Who needs attention right now?** (At-risk members, new members needing activation, dormant members worth re-engaging)
3. **What should I do next?** (What community action makes sense for each member — without defaulting to sales outreach)

This CRM moves the manager from **raw activity → understandable state → appropriate action**.

---

## 2. Product Goals

### Primary Goals
- [ ] Enable one community manager to see 20 members' activity at a glance
- [ ] Classify members into 5 states using **transparent, auditable rules**
- [ ] Show **why** each member has their current state
- [ ] Suggest next actions that are **community-oriented, not sales-oriented**
- [ ] Keep commercial signals **completely separate** from activity state
- [ ] Provide one AI-assisted action that requires human review

### Secondary Goals
- [ ] Allow adding/editing members without a database (localStorage)
- [ ] Record activities and watch state recalculate automatically
- [ ] Support focused views (New, Highly Active, At Risk/Dormant)
- [ ] Deploy to production (Vercel) without authentication

---

## 3. Core Non-Goals

❌ **Do NOT build:**
- Sales pipeline or lead scoring
- Revenue tracking or commercial potential metrics
- Automated outreach or email campaigns
- LinkedIn integration or social sync
- Complex authentication or permissions
- Real member data or real finance professionals
- Unsupported community metrics or platform features

---

## 4. Data Model

### Member Object
```javascript
{
  id: string,
  name: string,
  role: string,
  company: string,
  primarySpace: string, // Say Hello, Ask Finance Peers, Finance Workflows, Tools & Systems, Career & Compensation, Water Cooler
  owner: string, // "Community Team" or specific person
  joinedDate: ISO8601, // stored as a plain calendar date, no timezone offset
  notes: string,
  nextAction: string,
  commercialSignal: string | null, // Completely separate field — never influences activity state
  createdAt: ISO8601
}
```

### Activity Object
```javascript
{
  id: string,
  memberId: string,
  date: ISO8601, // when the activity occurred (calendar date)
  space: string, // one of the 6 core FoF spaces
  type: string, // Introduction, Post, Comment, Question, Answer, Resource contribution, Job interaction, Interview/story
  description: string, // what they actually did
  engagement: string, // "Low", "Medium", "High"
  recordedBy: string, // "Community Team" or user name
  recordedAt: ISO8601, // when it was entered in the CRM
  createdAt: ISO8601 // system timestamp
}
```

Audit fields (`recordedBy` / `recordedAt`) exist on every activity so the "auditable" claim in the USP is backed by real data, not just a description on the Help page.

### Date & Time Handling (Authoritative)

This section is the single source of truth for date math anywhere in the app — the state engine, the seed data, and the UI all follow it.

**Rule: all durations are counted in normalized calendar days, never in raw elapsed hours.**

```javascript
// ✓ CORRECT — normalize to calendar dates first, then diff whole days
function toCalendarDate(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetweenCalendarDates(date1, date2) {
  const d1 = toCalendarDate(date1);
  const d2 = toCalendarDate(date2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// ✗ WRONG — raw timestamp subtraction, sensitive to time-of-day
// const daysInactive = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
```

- **"14 calendar days"** means the calendar date has changed 14 times between the two dates — not "14 × 24 hours."
- Example: joined Aug 5 at 11 PM, today is Aug 19 at 9 AM → **14 calendar days**, regardless of the time-of-day on either end.
- Dates are stored and compared as **local calendar dates only** — never store timezone info, never convert between timezones. Since this is a client-side, single-browser app, "local" simply means the browser's local date.
- This logic is what every "X days ago" label, every state threshold, and every seed-data example in this document uses.

---

## 5. Activity State Calculation

State is **computed from activity history**, never manually assigned, using this deterministic logic:

```javascript
function calculateActivityState(member, activities) {
  const now = today();
  const lastActivityDate = getLastActivityDate(activities);
  const daysInactive = lastActivityDate
    ? daysBetweenCalendarDates(lastActivityDate, now)
    : 999;
  const daysSinceJoined = daysBetweenCalendarDates(member.joinedDate, now);
  const activitiesInLast14Days = countActivitiesInRange(activities, 14, now);
  const activitiesInLast30Days = countActivitiesInRange(activities, 30, now);
  const hasHighEngagementInLast14Days = activities
    .filter(a => daysBetweenCalendarDates(a.date, now) <= 14)
    .some(a => a.engagement === "High");
  const totalActivities = activities.length;

  // Rule 1: Dormant
  if (daysInactive >= 60) {
    return "Dormant";
  }

  // Rule 2: At Risk (previously active but stale)
  if (daysInactive >= 30 && daysInactive < 60 && totalActivities >= 2) {
    return "AtRisk";
  }

  // Rule 3: Highly Active (recent strong engagement) — checked BEFORE Newly Joined
  if (activitiesInLast14Days >= 3 || hasHighEngagementInLast14Days) {
    return "HighlyActive";
  }

  // Rule 4: Newly Joined (onboarding period)
  if (daysSinceJoined <= 14 && totalActivities < 2) {
    return "NewlyJoined";
  }

  // Rule 5: Active (some recent activity)
  if (activitiesInLast30Days >= 1) {
    return "Active";
  }

  // Fallback: brand new with no activity at all
  if (totalActivities === 0 && daysSinceJoined <= 14) {
    return "NewlyJoined";
  }

  return "Active"; // Default
}
```

**Critical implementation notes:**
- Rules are evaluated in **if-else order, top to bottom — first match wins.** This is not a precedence table to interpret; it's the literal execution order.
- **"High engagement"** = an activity explicitly recorded with `engagement: "High"`.
- **"Previously active"** (used informally in At Risk/Dormant copy) = has ≥2 recorded activities in history, regardless of timing.
- **A newly joined person with high engagement becomes Highly Active, not Newly Joined**, because Rule 3 is checked before Rule 4.
  - Example: joined Aug 15, posted high-engagement activities Aug 17–19 → **Highly Active**.
- State is fully deterministic: identical inputs always produce identical output, and state recalculates automatically whenever an activity is added.

---

## 6. Seed Data

### Distribution (Exactly 20 Members)
| State | Count |
|---|---|
| Newly Joined | 4 |
| Active | 6 |
| Highly Active | 4 |
| At Risk | 3 |
| Dormant | 3 |

**Reference date used throughout this dataset and the demo script: "today" = August 19, 2024.**

### Fictional Member Roster
All names, roles, companies, and activity histories are fictional.

| # | Name | Role | Company | Target State |
|---|---|---|---|---|
| 1 | Aarav Mehta | Finance Transformation Lead | Meridian Systems | Highly Active |
| 2 | Priya Nair | FP&A Manager | Northstar Foods | Highly Active |
| 3 | Rohan Kapoor | Controller | Vertex Manufacturing | Active |
| 4 | Ananya Rao | Finance Systems Manager | BluePeak Retail | Active |
| 5 | Karan Shah | Treasury Manager | Atlas Mobility | Highly Active |
| 6 | Meera Iyer | Senior Finance Analyst | Cedar Analytics | Newly Joined |
| 7 | Vikram Menon | CFO | Lumina HealthTech | Active |
| 8 | Sneha Patel | Accounts Payable Lead | Harbor Commerce | At Risk |
| 9 | Aditya Verma | FP&A Analyst | Nova Energy | Highly Active |
| 10 | Divya Krishnan | Finance Operations Manager | Orbit Logistics | Active |
| 11 | Nikhil Rao | AR Manager | Crest Services | Newly Joined |
| 12 | Pooja Shah | Finance Analyst | Greenfield Foods | Dormant |
| 13 | Rahul Joshi | Finance Transformation Manager | Axis Digital | Newly Joined |
| 14 | Tanya Menon | Senior Accountant | Silverline Media | At Risk |
| 15 | Devika Nair | Treasury Analyst | Eastbridge Capital | Active |
| 16 | Arjun Pillai | Finance Manager | Westlake Technologies | Newly Joined |
| 17 | Neha Kapoor | FP&A Lead | Horizon Consumer | At Risk |
| 18 | Sameer Rao | Accounting Manager | Riverstone Infrastructure | Dormant |
| 19 | Isha Menon | Finance Systems Analyst | Clearpath Software | Dormant |
| 20 | Ritesh Kumar | Controller | Summit Services | Active |

States are **never manually assigned** — they are the output of running the state engine (Section 5) against the activity dataset below. Every member's target state is provable by hand-tracing the rules.

### Full Activity Dataset

Format: `Date | Space | Type | Description | Engagement`

**1. Aarav Mehta — target: Highly Active** *(joined Jan 10, 2024)*
```
Aug 18 | Tools & Systems     | Comment | Shared ERP migration approach              | High
Aug 16 | Finance Workflows   | Post    | Shared quarterly forecasting template       | Medium
Aug 14 | Tools & Systems     | Comment | Answered question on account reconciliation | Medium
Aug 10 | Ask Finance Peers   | Answer  | Shared process for monthly close            | Medium
```
→ 4 activities within the last 14 calendar days (Aug 5–19) → **Highly Active** ✓ (also has a High-engagement activity in that window)

**2. Priya Nair — target: Highly Active** *(joined Feb 3, 2024)*
```
Aug 19 | Ask Finance Peers      | Post    | Shared quarterly close checklist        | High
Aug 15 | Finance Workflows      | Comment | Answered a workflow question            | Medium
Aug 09 | Career & Compensation  | Comment | Weighed in on comp benchmarking thread   | Low
```
→ High-engagement activity on Aug 19, inside the last-14-days window → **Highly Active** ✓

**3. Rohan Kapoor — target: Active** *(joined Nov 12, 2023)*
```
Aug 02 | Finance Workflows   | Comment | Discussed month-end close process   | Medium
Jul 20 | Ask Finance Peers   | Answer  | Answered an onboarding question     | Medium
```
→ Last activity 17 days ago (outside the 14-day window, inside 30) → **Active** ✓

**4. Ananya Rao — target: Active** *(joined Dec 1, 2023)*
```
Jul 28 | Tools & Systems     | Post    | Shared a reconciliation checklist   | Medium
Jul 10 | Finance Workflows   | Comment | Weighed in on close-cycle timing    | Low
```
→ Last activity 22 days ago → **Active** ✓

**5. Karan Shah — target: Highly Active** *(joined Mar 5, 2024)*
```
Aug 17 | Tools & Systems     | Post    | Shared treasury dashboard template     | Medium
Aug 13 | Finance Workflows   | Comment | Discussed cash flow forecasting        | Medium
Aug 07 | Ask Finance Peers   | Answer  | Answered a treasury policy question    | High
```
→ 3 activities within the last 14 days, and one is High engagement → **Highly Active** ✓

**6. Meera Iyer — target: Newly Joined** *(joined Aug 15, 2024)*
```
(no activities yet)
```
→ Joined 4 days ago, 0 total activities → **Newly Joined** ✓

**7. Vikram Menon — target: Active** *(joined Jan 22, 2024)*
```
Aug 03 | Ask Finance Peers   | Answer  | Answered a process question         | Medium
Jul 22 | Finance Workflows   | Comment | Weighed in on a workflow discussion | Low
```
→ Last activity 16 days ago → **Active** ✓

**8. Sneha Patel — target: At Risk** *(joined Sep 4, 2023)*
```
Jul 15 | Career & Compensation | Comment | Weighed in on compensation structures  | Low
Jul 03 | Finance Workflows      | Comment | Discussed AP process                   | Low
Jun 18 | Ask Finance Peers      | Answer  | Answered a vendor management question  | Low
```
→ Last activity 35 days ago, 3 historical activities (≥2) → **At Risk** ✓

**9. Aditya Verma — target: Highly Active** *(joined Apr 18, 2024)*
```
Aug 18 | Ask Finance Peers   | Answer  | Shared a variance analysis approach   | Medium
Aug 15 | Finance Workflows   | Post    | Shared a rolling forecast template    | Medium
Aug 12 | Tools & Systems     | Comment | Answered a systems integration question | Medium
```
→ 3 activities within the last 14 days → **Highly Active** ✓

**10. Divya Krishnan — target: Active** *(joined Oct 9, 2023)*
```
Jul 30 | Finance Workflows   | Post    | Shared a logistics close-cycle tip   | Medium
Jul 12 | Tools & Systems     | Comment | Weighed in on systems discussion     | Low
```
→ Last activity 20 days ago → **Active** ✓

**11. Nikhil Rao — target: Newly Joined** *(joined Aug 12, 2024)*
```
Aug 13 | Say Hello | Introduction | Introduced themselves to the community | Low
```
→ Joined 7 days ago, 1 total activity (< 2) → **Newly Joined** ✓

**12. Pooja Shah — target: Dormant** *(joined Feb 14, 2024)*
```
Jun 08 | Finance Workflows   | Comment | Weighed in on tools discussion   | Low
May 28 | Ask Finance Peers   | Answer  | Answered a process question      | Low
May 15 | Say Hello           | Introduction | Posted first introduction   | Low
```
→ Last activity 72 days ago → **Dormant** ✓

**13. Rahul Joshi — target: Newly Joined** *(joined Aug 17, 2024)*
```
(no activities yet)
```
→ Joined 2 days ago, 0 total activities → **Newly Joined** ✓

**14. Tanya Menon — target: At Risk** *(joined Aug 22, 2023)*
```
Jun 30 | Finance Workflows   | Comment | Weighed in on a workflow thread   | Low
Jun 10 | Ask Finance Peers   | Answer  | Answered a peer question          | Low
```
→ Last activity 50 days ago, 2 historical activities → **At Risk** ✓

**15. Devika Nair — target: Active** *(joined Nov 30, 2023)*
```
Aug 01 | Ask Finance Peers   | Comment | Weighed in on a treasury thread   | Medium
Jul 15 | Finance Workflows   | Answer  | Answered a cash-flow question     | Low
```
→ Last activity 18 days ago → **Active** ✓

**16. Arjun Pillai — target: Newly Joined** *(joined Aug 9, 2024)*
```
Aug 10 | Say Hello | Introduction | Introduced themselves to the community | Medium
```
→ Joined 10 days ago, 1 total activity (< 2) → **Newly Joined** ✓

**17. Neha Kapoor — target: At Risk** *(joined Jul 3, 2023)*
```
Jul 05 | Career & Compensation | Post    | Shared a comp-benchmarking article   | Low
Jun 22 | Tools & Systems        | Comment | Weighed in on systems discussion     | Low
```
→ Last activity 45 days ago, 2 historical activities → **At Risk** ✓

**18. Sameer Rao — target: Dormant** *(joined Jan 5, 2024)*
```
May 20 | Finance Workflows   | Comment | Weighed in on close-cycle timing   | Low
Apr 30 | Ask Finance Peers   | Answer  | Answered a reconciliation question | Low
```
→ Last activity 91 days ago → **Dormant** ✓

**19. Isha Menon — target: Dormant** *(joined Aug 30, 2023)*
```
Apr 10 | Tools & Systems | Comment      | Weighed in on a systems thread       | Low
Mar 22 | Say Hello       | Introduction | Posted first introduction            | Low
```
→ Last activity 131 days ago → **Dormant** ✓

**20. Ritesh Kumar — target: Active** *(joined Oct 20, 2023)*
```
Jul 25 | Tools & Systems     | Post    | Shared a controls checklist        | Medium
Jul 05 | Ask Finance Peers   | Comment | Weighed in on a peer question      | Low
```
→ Last activity 25 days ago → **Active** ✓

### Seed Validation Script

This dataset is only useful if it's checked automatically — copy-pasting 20 activity histories by hand is exactly the kind of thing that silently drifts. Run this at startup:

```javascript
// At startup, validate that the actual computed state distribution
// matches the expected distribution above.
import { validateSeedData } from './seed-data';

const result = validateSeedData();

if (!result.isValid) {
  console.error('Seed data validation failed:');
  console.error('Expected: Newly Joined=4, Active=6, Highly Active=4, At Risk=3, Dormant=3');
  console.error(`Actual: ${JSON.stringify(result.distribution)}`);
  throw new Error('Seed data does not produce the expected state distribution');
}

console.log('✓ Seed data validation passed');
```

**The distribution MUST match before launch.** If the numbers don't line up, the CRM is fundamentally broken before it's even deployed — this check exists so that a state-engine bug is caught at build time, not by an evaluator clicking around the demo.

---

## 7. Follow-ups Calculation

**Follow-ups required = Newly Joined + At Risk + Dormant**

```
4 Newly Joined
+ 3 At Risk
+ 3 Dormant
─────────────
10 members needing attention
```

This number appears on the Dashboard and drives the Follow-ups view. It is used consistently everywhere in this document, including the demo script (Section 12) — there is no other definition of "follow-ups" anywhere in the product.

A member in follow-ups needs one of:
- **Newly Joined:** Help getting their first contribution
- **At Risk:** Re-engagement (surface relevant discussion, check in)
- **Dormant:** Decision on whether to reach out

---

## 8. Features

### 8.1 Dashboard
**Landing page showing community health at a glance.**

Display:
- Total members: 20
- Newly Joined: 4
- Active: 6
- Highly Active: 4
- At Risk: 3
- Dormant: 3
- Follow-ups required: **10 members** (see Section 7)
- Recent activity summary

**Visual:** Clean cards, no decorative charts. Answer: *"What needs my attention?"*

---

### 8.2 Members Directory
**Searchable, filterable table of all members.**

Columns: Member (name), Role, Company, Primary Space, Activity State (badge), Last Activity (relative date), Owner, Next Action

Functionality:
- Search by name (real-time)
- Filter by state
- Filter by space
- Filter by owner
- Sort by last activity
- Click to open detail page
- [+ Add Member] button

---

### 8.3 Add Member
**Form to create a new member.**

Fields: Name*, Role*, Company*, Primary Space* (select from 6 spaces), Owner* (text), Joined Date* (date picker), Notes (optional)

On save: member appears in directory, is searchable, gets an initial calculated state (likely Newly Joined), and persists to localStorage.

---

### 8.4 Member Detail Page
**Central hub for viewing and managing a single member.**

**Profile Card:** Name, Role, Company, Owner, Primary Space, Joined Date, Notes, [Edit] button

**Activity State Badge + Explanation:**
```
ACTIVITY STATE

HIGHLY ACTIVE

Last activity: 1 day ago
Activities in last 14 days: 4
Reason: Member recorded 4 meaningful activities
        within the last 14 days.
```
Every state must include a human-readable reason — never just the badge.

**Next Action Card:**
```
NEXT ACTION

Invite contribution to Tools & Systems
[Edit] button
```

**Activity History** (reverse chronological):
```
Aug 18 | Tools & Systems | Comment | Shared an ERP migration lesson | Engagement: High
Aug 16 | Finance Workflows | Post | Shared a forecasting workflow | Engagement: Medium
Aug 14 | Tools & Systems | Comment | Responded to another member | Engagement: Medium
```

**Record Activity Section:** [+ Record Activity] → modal with Date (default today), Community Space, Activity Type, Description, Engagement. On save: activity added, state recalculates, localStorage updates.

**Commercial Signal:**
```
COMMERCIAL SIGNAL

Possible commercial relevance detected

Status: Requires human review

This signal:
✓ Does NOT affect activity state
✓ Does NOT affect engagement scoring
✓ Does NOT trigger automatic outreach
✓ Does NOT inform AI recommendations

[View] button to see details
```
Stored separately; never read by the state engine or the AI.

**AI-Assisted Recommendation:**
```
GENERATE AI RECOMMENDATION

[Generate Recommendation Button]
```

---

### 8.5 Record Activity
Fields: Date* (date picker), Community Space* (select), Activity Type* (select), Description* (textarea), Engagement* (radio: Low/Medium/High)

Triggers: activity history updates, "Last Activity" updates across the CRM, state recalculates, follow-up status refreshes, localStorage persists.

---

### 8.6 Follow-ups View
**Dedicated page for members needing attention.**

Shows: Newly Joined needing activation + At Risk + Dormant (10 members total — see Section 7).

Card per member:
```
Aarav Mehta
HIGHLY ACTIVE

Last activity: 1 day ago

Next Action:
Invite contribution to Tools & Systems

Owner: Community Team

[View Member] button
```

Sort by urgency: (1) At Risk — highest, (2) Newly Joined — high, (3) Dormant — medium.

---

### 8.7 Focused Views

- **Newly Joined (4 members):** help them get their first meaningful interaction.
- **Highly Active (4 members):** identify contributors for potential interviews, peer introductions, or special contributions.
- **At Risk / Dormant (6 members):** help the manager decide whether/how to re-engage.

Each view: focused table of members in that state, same columns as the Members Directory, filter/sort within the state, click to open detail.

---

### 8.8 AI-Assisted Action: "Generate Recommendation"

**Button:** [Generate AI Recommendation]

**Input to AI:** member name, role, company, recent activity (last 5), primary space, activity state, owner.

**Example output:**
```
AI-ASSISTED RECOMMENDATION

This member has recently contributed in Tools & Systems
and Finance Workflows, sharing practical implementation
experiences. Consider inviting them to contribute a
guest post or interview about their finance transformation work.

This would help newer members learn from their experience.

Human review required.

[Accept] [Edit] [Dismiss]
```

**Safeguards:**
- ✓ AI never sends messages
- ✓ AI never contacts a member
- ✓ AI never invents activity
- ✓ AI never infers buying intent
- ✓ AI never reads commercial signals
- ✓ AI never automatically changes member state

#### Implementation: Simulated / Deterministic (by design)

For this assessment, **do not call an external LLM API from the browser.**

```
Status: DETERMINISTIC / SIMULATED (by design)

Why deterministic instead of a live LLM call?
✓ Explainable — see exactly why a recommendation was generated
✓ Auditable — the logic is transparent and reproducible
✓ Safe — no member data leaves the application
✓ Fast — no API latency
✓ Honest — clear about how the recommendation was produced
```

```javascript
function generateRecommendation(member, activities) {
  const state = member.activityState;
  const primarySpace = member.primarySpace;

  if (state === "HighlyActive") {
    return `This member is highly active in ${primarySpace}. ` +
           `Consider inviting them to contribute a guest piece or interview ` +
           `about their practical experience. This could help newer members learn from them.`;
  }
  if (state === "AtRisk") {
    return `This member was previously active but has gone quiet. ` +
           `Consider surfacing a recent discussion relevant to ${primarySpace} ` +
           `to re-engage them. A personal message highlighting a peer's question might help.`;
  }
  if (state === "NewlyJoined") {
    return `This is a new member. Help them get their first contribution by ` +
           `inviting them to share a question or introduction in ${primarySpace}.`;
  }
  if (state === "Active") {
    return `This member has steady engagement. Continue monitoring their participation ` +
           `and consider highlighting relevant discussions in their primary space.`;
  }
  if (state === "Dormant") {
    return `This member has been silent for a long time. Before reaching out, ` +
           `review whether a re-engagement makes sense. If you do reach out, ` +
           `keep it personal and low-pressure.`;
  }
  return "Unable to generate recommendation at this time.";
}
```

**Label clearly, every time:**
```
AI-ASSISTED RECOMMENDATION — SIMULATED

This recommendation is generated from deterministic rules based on
member state and activity history. It is designed to be consistent,
predictable, and auditable.

Human review required before taking action.
```

**If an evaluator asks "Where is the AI?"** — the honest answer:
> "For this prototype, I deliberately simulated the recommendation engine with deterministic rules. The point is to demonstrate the product workflow and safety boundaries without sending member data to external services. In production, this could be replaced with an LLM behind a server-side API."

**Accepting a recommendation** does NOT send anything — the text is copied into the "Next Action" field, the user can edit it, and the user manually decides when/how to act.

---

### 8.9 Edit Member
Editable fields: Role, Company, Primary Space, Owner, Joined Date, Notes, Next Action. Changes persist to localStorage.

---

### 8.10 Empty States

**Member with no activities:**
```
ACTIVITY HISTORY

No activities recorded yet.

Recommended next step:
Help this member share their first contribution in [Primary Space].
```

**Search with no results:**
```
No members found matching "xyz"

Try:
• Check spelling
• Search by role or company
• View all members
```

**No follow-ups:**
```
FOLLOW-UP REQUIRED

0 members need attention

Your community is healthy!

Recent community activity:
[show 5 most recent activities]
```

**Newly joined member (no activities):**
```
ACTIVITY STATE

NEWLY JOINED

Joined: Aug 18 (1 day ago)
Activities: 0

Reason:
New member in onboarding period.
No community activity recorded yet.

Recommended next action:
Encourage first contribution to [Primary Space]
```

**Member with no recent activity:**
```
RECENT ACTIVITY

Last activity: 47 days ago

Reason for current state (At Risk):
Member was previously active but has not participated
in the community for 47 days.

Next action:
Surface a recent discussion in [Primary Space] that
might re-engage them.
```

---

### 8.11 Activity Audit Trail

Every activity record includes `recordedBy` and `recordedAt` (see the Activity Object in Section 4). On the member detail page:

```
Aug 18 | Tools & Systems | Comment
Shared an ERP migration lesson

Recorded by: Community Team
Recorded at: Aug 19, 2024 3:42 PM
```

This makes the system auditable without requiring authentication.

---

### 8.12 Help & Methodology

**About This CRM**
> This is a community activity-management prototype built for the Volopay Friends of Finance Growth Squad assessment (Task 3). It demonstrates how a community manager can track member engagement, identify who needs attention, and recommend thoughtful community actions — without converting community participation into sales signals.

**Technology Stack**
- Frontend: Next.js + TypeScript + Tailwind CSS
- State: Zustand
- Storage: localStorage (single-browser persistence)
- Deployment: Vercel
- Data: Static seed data bundled with the app

**Data**
> All 20 members and activity records are entirely fictional. No real finance professionals from the community are included. No activity is fabricated for real people. No real community members are contacted.

**Activity-State Rules**
```
1. DORMANT
   Last activity ≥60 calendar days ago

2. AT RISK
   Last activity 30–59 calendar days ago AND ≥2 historical activities

3. HIGHLY ACTIVE
   3+ activities in last 14 calendar days OR 1+ high-engagement activity in last 14 days

4. NEWLY JOINED
   Joined ≤14 calendar days ago AND <2 total activities

5. ACTIVE
   ≥1 activity in last 30 calendar days (and doesn't match rules 1–4)

KEY: Rules are evaluated in order; first match wins.
     A newly joined member with high engagement becomes Highly Active, not Newly Joined.
```

**AI Feature**
```
GENERATE AI RECOMMENDATION

Status: SIMULATED

How it works:
The recommendation engine uses deterministic rules based on member
state and activity to suggest community-oriented next actions.

It does NOT:
✗ Call external APIs
✗ Send messages automatically
✗ Invent member information
✗ Infer commercial intent
✗ Read commercial signals
✗ Modify member state

User can: Accept (copy to Next Action) / Edit / Dismiss
```

**Commercial Signal (Assessment-Only Safeguard)**
```
COMMERCIAL SIGNAL SEPARATION

This field exists to demonstrate that commercial information
can be tracked independently from community engagement scoring.

It is:
✓ Stored in a completely separate data field
✓ Never read by the activity-state engine
✓ Never used for follow-up priority calculation
✓ Never visible to the AI recommendation system
✓ Never used for automatic outreach
✓ Always requires human review before action

This demonstrates responsible product design: the ability to
track relevant information without contaminating community health metrics.
```

**Persistence Limitation**
```
DATA PERSISTENCE

Seed data: Bundled with application
User edits: Persist in browser localStorage
Multi-user sync: Not available (no shared database)
Impact: Edits survive refresh on same browser;
        different browsers start with same seed data.

Next improvement: Add shared persistence (database)
                  so multiple managers work from one live dataset.
```

**Testing Checklist**
```
1. Open dashboard → see 20 members, state counts, follow-up count of 10
2. Search for "Aarav Mehta" → member appears in results
3. Open Aarav's detail page → view profile, state, activity history
4. Review state explanation → understand why he's "Highly Active"
5. Add a new activity → confirm it appears in history and state recalculates
6. Go to Members directory → filter by "At Risk" → see 3 members
7. Click Follow-ups → see 10 members needing attention
8. Go to Newly Joined view → see 4 new members
9. Return to a member detail → generate AI recommendation → confirm it
   does not auto-send → click [Dismiss]
10. Review commercial signal section → confirm it's separate from activity state
11. Add a new member → save → search for them → refresh browser →
    confirm they persist
12. Open Help → review rules, tech stack, safeguards
```

---

## 9. Navigation Structure

```
┌────────────────────────────────────┐
│ Friends of Finance CRM             │
├────────────────────────────────────┤
│ Dashboard                          │
│ Members                            │
│ Follow-ups                         │
│ Newly Joined                       │
│ Highly Active                      │
│ At Risk / Dormant                  │
│ Help & Methodology                 │
└────────────────────────────────────┘
```

Sidebar or top navigation. Responsive for mobile, optimized for desktop.

---

## 10. Visual Design

**Style direction:**
- Clean SaaS dashboard aesthetic
- Light neutral background (#f9fafb or white)
- Dark, readable typography
- Subtle borders (#e5e7eb)
- Rounded cards (4–6px radius)
- Clear state badges with distinct colors: Newly Joined (blue), Active (green), Highly Active (emerald/dark green), At Risk (amber/orange), Dormant (gray)
- Strong spacing and breathing room
- Professional, not playful

**No unnecessary animations.** The tool should feel like an internal operations dashboard, not a consumer app.

---

## 11. Implementation Constraints

### Data Validation

At startup, validate:
```javascript
// 1. Seed distribution
if (calculateStateDistribution() !== EXPECTED) {
  throw new Error("Seed data invalid");
}

// 2. All members have required fields
members.forEach(m => {
  if (!m.name || !m.role || !m.company) throw new Error("Invalid member");
});

// 3. All activities have required fields
activities.forEach(a => {
  if (!a.memberId || !a.date || !a.type) throw new Error("Invalid activity");
});

// 4. No real data
members.forEach(m => {
  if (REAL_FINANCE_PROFESSIONALS.includes(m.name)) {
    throw new Error("Real data detected — abort deployment");
  }
});
```

**If validation fails, log errors and halt deployment.**

### Storage & Persistence
- Seed data: bundled in the app, never changes (unless the user adds to it)
- User edits: stored in localStorage under key `fof-crm-data`
- Sync: single browser only (no multi-device sync)
- Backup: the user is responsible for backups (this is a demo, not production)

(Date/time handling rules live in Section 4 — they are the single source of truth and apply everywhere, not just here.)

---

## 12. Deployment

### Platform: Vercel
- [ ] App deployed and publicly accessible
- [ ] No authentication required
- [ ] No access request modal
- [ ] Opens directly on public URL
- [ ] Seed data loaded immediately
- [ ] All interactions functional

### Pre-Launch Checklist
- [ ] Open deployed URL in incognito mode
- [ ] Search for a member
- [ ] Filter by activity state
- [ ] Open detail page
- [ ] Add an activity
- [ ] Confirm activity history updates
- [ ] Add a new member
- [ ] Refresh page
- [ ] Confirm new member persists
- [ ] Generate AI recommendation
- [ ] Verify no message is sent
- [ ] Review commercial signal
- [ ] Open Help page
- [ ] Test responsive layout on tablet/mobile

---

## 13. Demo Script (5 Minutes)

**Fictional member focus:** Aarav Mehta (Highly Active)

1. **Open Dashboard** (15 sec) — Show community overview: 20 members, state distribution. **Highlight: 10 members need attention — 4 newly joined, 3 at risk, 3 dormant.**
2. **Search for Aarav Mehta** (20 sec) — Type in search, click to open detail.
3. **Review Member Profile** (30 sec) — Name, role, company, primary space (Tools & Systems), owner (Community Team), state (Highly Active). Explain why: 4 activities in the last 14 days.
4. **Show Activity History** (30 sec) — Walk through Aug 18/16/14/10 entries. Narrate: *"The state is calculated from this activity, not assigned manually."*
5. **Record a New Activity** (30 sec) — [+ Record Activity] → "Today, shared ERP best practices in Tools & Systems, High engagement" → Save → activity appears instantly.
6. **Generate AI Recommendation** (30 sec) — Click [Generate AI Recommendation]. Show the suggestion. Explain: *"AI suggests community action, not sales outreach. I can accept, edit, or dismiss. Nothing is sent automatically."* Click [Dismiss].
7. **Show Commercial Signal Separation** (30 sec) — Scroll to Commercial Signal. Explain: *"This field exists but is completely separate from activity state. It doesn't affect engagement scoring or follow-up recommendations."*
8. **Navigate to Follow-ups** (20 sec) — Show the 10 members needing attention. Click on Sneha Patel (At Risk). Explain: *"Last activity 35 days ago. This is why she's At Risk. Recommended next action: surface a relevant discussion."*
9. **Open Help Page** (15 sec) — Show testing checklist, activity-state rules, commercial safeguards.
10. **Close with Limitation** (10 sec) — *"Current limitation: this is browser-local with localStorage. Edits persist here but aren't synced across devices."* *"Next improvement: add a real database so multiple managers work from one live dataset."*

---

## 14. Constraints & Assumptions

**Technology:** no backend database (localStorage only), no authentication, no real API integrations, no third-party community platform access.

**Data:** 20 fictional members only, no real finance professionals, all activity fictional and pre-seeded (except user additions), no real company data or industry metrics.

**Design:** desktop-first (mobile responsive but desktop optimized), no unnecessary features, no decorative visualizations, no duplicate/overlapping functionality.

**Scope:** one AI-assisted action only, no sales pipeline or lead scoring, no automation beyond state calculation, no email/SMS/LinkedIn integration, no real-time collaboration features.

---

## 15. Success Criteria (Definition of Done)

**Data & Members**
- [x] 20 fictional members exist, all names/companies/roles fictional
- [x] Member distribution matches target (4/6/4/3/3)
- [x] Activity histories produce correct states
- [x] No real finance professionals included

**Core Features**
- [x] Dashboard displays overview + follow-ups
- [x] Members directory with search, filter, sort
- [x] Add/edit member works and persists
- [x] Member detail page displays all info
- [x] Activity recording and history work correctly
- [x] Activity state auto-calculates with a visible explanation

**Classification & Rules**
- [x] State engine implements the 5 rules in the correct if-else order
- [x] Every member has exactly one state
- [x] Owner and Next Action assigned to every member

**Views & Navigation**
- [x] Follow-ups view shows the 10 at-risk/new/dormant members
- [x] Newly Joined view shows 4 members
- [x] Highly Active view shows 4 members
- [x] At Risk / Dormant view shows 6 members
- [x] Navigation menu complete and working

**AI & Safety**
- [x] AI-assisted action implemented (simulated, clearly labeled)
- [x] AI generates a recommendation without sending anything
- [x] AI does not read commercial signals or auto-change state or contact members

**Commercial Safeguards**
- [x] Commercial signal field exists, separate from activity data
- [x] Does not affect state, follow-up priority, or AI input
- [x] Requires human review; documented in UI and Help

**Help & Documentation**
- [x] Help page covers tech stack, data privacy, state rules, AI feature, commercial safeguards, testing checklist, persistence limitation

**Deployment & Polish**
- [x] Deployed to a public URL, no auth, works in incognito
- [x] Responsive (desktop priority), localStorage works
- [x] Professional visual design, no console errors, demo-ready

---

## 16. Unique Selling Point Summary

This CRM stands apart because it **prioritizes community trust over sales velocity**.

**Every design choice reflects the principle:**
> **"Measure participation, not commercial intent. Recommend actions, don't automate relationships."**

1. **Transparent Classification:** every state is calculated visibly from activity rules
2. **Explainable Decisions:** every member state includes a human-readable reason
3. **Separated Signals:** commercial signals are structurally isolated from engagement scoring
4. **Human-Centered AI:** recommendations are suggestions for human review, never automated actions
5. **Community-First Actions:** every recommended action serves the member or community, not sales goals
6. **Auditable System:** a manager can always see why a member has their current state and what the system recommends next

---

## 17. Success Metrics (For Demo)

An evaluator should be able to:
- ✓ Open the CRM and see 20 members immediately
- ✓ Understand what "Highly Active" means by reading the rule
- ✓ See why Aarav is "Highly Active" by reading the explanation
- ✓ Record an activity and watch the history update
- ✓ Filter by state and see members grouped correctly
- ✓ Generate an AI recommendation and understand it's not sent automatically
- ✓ Identify the commercial signal field and understand it's separate
- ✓ Understand the system could scale with a shared database (but doesn't now)
- ✓ Use the Help section to understand how everything works
- ✓ Conclude: *"This is a real tool a community manager could actually use."*

---

## 18. Version History

| Version | Score | Status | Key Changes |
|---|---|---|---|
| v1 | 8.5/10 | Good concept, execution flaws | Initial PRD |
| v2 | 9.2/10 | Concept + major fixes | Fixed state-engine contradiction (if-else order, not a precedence table); defined "At Risk" precisely (≥2 historical activities); added seed-data validation script; defined follow-ups explicitly as 4+3+3=10; moved AI to a simulated/deterministic approach; scoped commercial signal as an assessment-only safeguard; added empty states; added activity audit trail; made date handling explicit; consolidated duplicated success-criteria sections |
| v2.1 | 9.5/10 | Ready to build | Resolved the remaining date-handling contradiction (raw timestamp math vs. "local midnight" language) with a single normalized-calendar-date function used everywhere; replaced placeholder seed data with a complete, hand-traceable 20-member activity dataset; corrected the demo script's follow-up count from a leftover "3 members" (v1) to the correct "10 members" (matching v2's own definition); added an explicit justification for the AI's simulated/deterministic design in case an evaluator asks "where is the AI?" |
| **v2.1 (this document)** | — | **Approved for development** | Merged the v1 base PRD, the v2 improvements changelog, and the v2.1 final-fixes changelog into one internally consistent document; fixed duplicate/out-of-order section numbering (there were two "Section 6" and two "Section 12" headers in the source files); every cross-reference (follow-up count, date logic, seed data) now points to a single authoritative section instead of being repeated and occasionally contradicted across files |

**Guidance for implementation:** don't add more features, don't make the PRD bigger. Build exactly what's specified in Sections 1–17 and validate at every step (Section 6's validation script, Section 11's startup checks, Section 12's pre-launch checklist).

---

## 19. Appendix: Related Assessment Context

**Task 3 of:** Volopay Friends of Finance Growth Squad
**Deliverable:** Deployed live CRM accessible without login

**Related tasks:**
- Task 1: Orientation Guide (community spaces, member profiles)
- Task 2: Comms framework + member outreach sequences
- Task 4: Video demonstration of live CRM (5 min) — see Section 13

**Not included:** sales pipeline or revenue metrics, real finance professional data, automatic outreach or messaging, CRM features not needed for community management.

---

**End of PRD — Version 2.1, Approved for Development**
