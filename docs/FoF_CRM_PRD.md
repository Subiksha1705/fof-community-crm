# PRD: Friends of Finance Community Activity CRM

**Status:** Task 3 — Volopay Growth Squad Assessment  
**Version:** 1.0  
**Last Updated:** August 2024

---

## Executive Summary

**Product:** A deployed, community-focused activity CRM for Friends of Finance that helps community managers understand member engagement, identify who needs attention, and recommend thoughtful next actions—**without turning community participation into sales signals**.

**Unique Selling Point:**  
> **"Community Intelligence Without the Sales Pitch"**
>
> A fully auditable, safety-first community management tool that separates engagement activity from commercial signals. Every member state is explained. Every recommendation is human-reviewed. Every design decision prioritizes community health over conversion intent.

**Key Differentiator:** Unlike sales CRMs, this system is deliberately **activity-first and transparent-second**. Commercial signals exist as a separate, human-reviewed field that does not influence engagement scoring, follow-up priority, or AI recommendations.

---

## 1. Core Problem

A community manager needs to answer three questions:

1. **What is happening with our community?**  
   (Who joined recently? Who is active? Who might need support?)

2. **Who needs attention right now?**  
   (At-risk members, new members needing activation, dormant members worth re-engaging)

3. **What should I do next?**  
   (What community action makes sense for each member—without defaulting to sales outreach)

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
  joinedDate: ISO8601,
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
  date: ISO8601,
  space: string, // One of the 6 core FoF spaces
  type: string, // Introduction, Post, Comment, Question, Answer, Resource contribution, Job interaction, Interview/story
  description: string, // What they actually did
  engagement: string, // "Low", "Medium", "High"
  createdAt: ISO8601
}
```

### Activity State Calculation

State is **computed from activity history** using this deterministic logic:

```javascript
function calculateActivityState(member, activities) {
  const now = today();
  const lastActivityDate = getLastActivityDate(activities);
  const daysInactive = lastActivityDate ? daysBetween(lastActivityDate, now) : 999;
  const daysSinceJoined = daysBetween(member.joinedDate, now);
  const activitiesInLast14Days = countActivitiesInRange(activities, 14);
  const activitiesInLast30Days = countActivitiesInRange(activities, 30);
  const hasHighEngagementInLast14Days = activities
    .filter(a => daysBetween(a.date, now) <= 14)
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

  // Rule 3: Highly Active (recent strong engagement)
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

  // Fallback: brand new with no activity
  if (totalActivities === 0 && daysSinceJoined <= 14) {
    return "NewlyJoined";
  }

  return "Active"; // Default
}
```

**Critical Implementation Notes:**

- **"14 days"** = last 14 calendar days (calculated at UTC midnight, user's local time)
- **"High engagement"** = activity explicitly recorded with `engagement: "High"`
- **"Previously active"** = has ≥2 recorded activities in history (regardless of timing)
- Rules are evaluated in **if-else order** (not precedence table)
- **A newly joined person with high engagement becomes Highly Active**, not Newly Joined
  - Example: Joined Aug 15, posted Aug 17, Aug 18, Aug 19 → **Highly Active** (Rule 3 catches before Rule 4)
- State is deterministic: same input always produces same output
- State recalculates whenever activities change

---

## 5. Seed Data

### Distribution (Exactly 20 Members)
- Newly Joined: 4
- Active: 6
- Highly Active: 4
- At Risk: 3
- Dormant: 3

### Fictional Member Roster
All names, roles, companies, and activity histories are fictional.

1. **Aarav Mehta** — Finance Transformation Lead @ Meridian Systems — Highly Active
2. **Priya Nair** — FP&A Manager @ Northstar Foods — Highly Active
3. **Rohan Kapoor** — Controller @ Vertex Manufacturing — Active
4. **Ananya Rao** — Finance Systems Manager @ BluePeak Retail — Active
5. **Karan Shah** — Treasury Manager @ Atlas Mobility — Highly Active
6. **Meera Iyer** — Senior Finance Analyst @ Cedar Analytics — Newly Joined
7. **Vikram Menon** — CFO @ Lumina HealthTech — Active
8. **Sneha Patel** — Accounts Payable Lead @ Harbor Commerce — At Risk
9. **Aditya Verma** — FP&A Analyst @ Nova Energy — Highly Active
10. **Divya Krishnan** — Finance Operations Manager @ Orbit Logistics — Active
11. **Nikhil Rao** — AR Manager @ Crest Services — Newly Joined
12. **Pooja Shah** — Finance Analyst @ Greenfield Foods — Dormant
13. **Rahul Joshi** — Finance Transformation Manager @ Axis Digital — Newly Joined
14. **Tanya Menon** — Senior Accountant @ Silverline Media — At Risk
15. **Devika Nair** — Treasury Analyst @ Eastbridge Capital — Active
16. **Arjun Pillai** — Finance Manager @ Westlake Technologies — Newly Joined
17. **Neha Kapoor** — FP&A Lead @ Horizon Consumer — At Risk
18. **Sameer Rao** — Accounting Manager @ Riverstone Infrastructure — Dormant
19. **Isha Menon** — Finance Systems Analyst @ Clearpath Software — Dormant
20. **Ritesh Kumar** — Controller @ Summit Services — Active

### Activity Dataset

Each member has a seeded activity history. States are **not manually assigned**—they result from running the state engine against the activity history.

**Critical:** Before deployment, run validation:

```javascript
// Validation script (runs at startup)
import { validateSeedData } from './seed-data';

const result = validateSeedData();

if (!result.isValid) {
  console.error('Seed data validation failed:');
  console.error(`Expected: Newly Joined=4, Active=6, Highly Active=4, At Risk=3, Dormant=3`);
  console.error(`Actual: ${result.distribution}`);
  throw new Error('Seed data does not produce expected state distribution');
}

console.log('✓ Seed data validation passed');
```

**The distribution MUST match before launch.**

If the numbers don't line up, the CRM is fundamentally broken.

---

## 6. Follow-ups Calculation

**Follow-ups required = Newly Joined + At Risk + Dormant**

```
4 Newly Joined
+ 3 At Risk
+ 3 Dormant
─────────────
10 members needing attention
```

This number appears on the Dashboard and drives the Follow-ups view.

A member in follow-ups needs one of:
- **Newly Joined:** Help getting their first contribution
- **At Risk:** Re-engagement (surface relevant discussion, check in)
- **Dormant:** Decision on whether to reach out

---

## 6. Features

### 6.1 Dashboard
**Landing page showing community health at a glance.**

Display:
- Total members: 20
- Newly Joined: 4
- Active: 6
- Highly Active: 4
- At Risk: 3
- Dormant: 3
- Follow-ups required: X members
- Recent activity summary

**Visual:** Clean cards, no decorative charts. Answer: *"What needs my attention?"*

---

### 6.2 Members Directory
**Searchable, filterable table of all members.**

Columns:
- Member (name)
- Role
- Company
- Primary Space
- Activity State (badge)
- Last Activity (relative date)
- Owner
- Next Action

Functionality:
- Search by name (real-time)
- Filter by state
- Filter by space
- Filter by owner
- Sort by last activity
- Click to open detail page
- [+ Add Member] button

---

### 6.3 Add Member
**Form to create a new member.**

Fields:
- Name * (required)
- Role * (required)
- Company * (required)
- Primary Space * (required, select from 6 spaces)
- Owner * (required, text input)
- Joined Date * (required, date picker)
- Notes (optional, textarea)

On save:
- Member appears in directory
- Member is searchable
- Initial state calculated (likely Newly Joined)
- Persists to localStorage

---

### 6.4 Member Detail Page
**Central hub for viewing and managing a single member.**

Sections:

#### Profile Card
- Name
- Role
- Company
- Owner
- Primary Space
- Joined Date
- Notes
- [Edit] button

#### Activity State Badge + Explanation
```
ACTIVITY STATE

HIGHLY ACTIVE

Last activity: 1 day ago
Activities in last 14 days: 4
Reason: Member recorded 4 meaningful activities 
        within the last 14 days.
```

Every state must include a human-readable reason.

#### Next Action Card
```
NEXT ACTION

Invite contribution to Tools & Systems
[Edit] button
```

#### Activity History
Reverse chronological list of all recorded activities:
```
Aug 18 | Tools & Systems | Comment | Shared an ERP migration lesson | Engagement: High
Aug 16 | Finance Workflows | Post | Shared a forecasting workflow | Engagement: Medium
Aug 14 | Tools & Systems | Comment | Responded to another member | Engagement: Medium
```

#### Record Activity Section
**[+ Record Activity] button** → modal form:
- Date (date picker, default today)
- Community Space (select from 6)
- Activity Type (select: Introduction, Post, Comment, Question, Answer, Resource, Job, Interview)
- Description (textarea, what they did)
- Engagement (select: Low, Medium, High)

On save:
- Activity added to history
- Activity state recalculates
- Page refreshes
- localStorage updates

#### Commercial Signal
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

Stored separately; never read by state engine or AI.

#### AI-Assisted Recommendation
```
GENERATE AI RECOMMENDATION

[Generate Recommendation Button]
```

On click → shows recommendation (or simulated recommendation).

---

### 6.5 Record Activity
**Modal/form for adding activities to a member.**

Fields:
- Date * (date picker)
- Community Space * (select)
- Activity Type * (select)
- Description * (textarea)
- Engagement * (radio: Low / Medium / High)

Triggers:
- Activity history updates
- "Last Activity" field updates across CRM
- Activity state recalculates (if applicable)
- Follow-up status refreshes (if applicable)
- localStorage persists change

---

### 6.6 Follow-ups View
**Dedicated page for members needing attention.**

Shows: Newly Joined needing activation + At Risk + Dormant

Card for each member:
```
Aarav Mehta
HIGHLY ACTIVE

Last activity: 1 day ago

Next Action:
Invite contribution to Tools & Systems

Owner: Community Team

[View Member] button
```

Sort by urgency:
1. At Risk (highest)
2. Newly Joined (high)
3. Dormant (medium)

---

### 6.7 Focused Views

#### Newly Joined (4 members)
Shows members in "Newly Joined" state.  
Purpose: Help them get their first meaningful interaction.

#### Highly Active (4 members)
Shows members in "Highly Active" state.  
Purpose: Identify contributors for potential interviews, peer introductions, or special contributions.

#### At Risk / Dormant (6 members)
Shows members in "At Risk" or "Dormant" states together.  
Purpose: Help the manager decide whether/how to re-engage.

Each view:
- Focused table of members in that state
- Same columns as Members Directory
- Filter/sort within the state
- Click to open detail

---

### 6.8 AI-Assisted Action: "Generate Recommendation"
**One intelligent feature that assists the community manager.**

#### Feature: Suggest Next Action

**Button:** [Generate AI Recommendation]

**Input to AI:**
- Member name, role, company
- Recent activity (last 5 activities)
- Primary space
- Activity state
- Owner

**Example Output:**
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
- ✓ AI never contacts member
- ✓ AI never invents activity
- ✓ AI never infers buying intent
- ✓ AI never reads commercial signals
- ✓ AI never automatically changes member state
- ✗ Commercial signals completely hidden from AI input

**Implementation Recommendation: Simulated (Preferred)**

For this assessment, **do NOT call an external LLM API from the browser**.

Reasons:
- Client-side API calls expose keys or require a server proxy
- Sending member data to external services is architecturally weak
- Deterministic rules are actually clearer for demonstrating intent

Instead, use a **deterministic recommendation engine**:

```javascript
function generateRecommendation(member, activities) {
  const state = member.activityState;
  const primarySpace = member.primarySpace;
  const recentActivity = activities.slice(0, 5);

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

**Label clearly:**

```
AI-ASSISTED RECOMMENDATION — SIMULATED

This recommendation is generated from deterministic rules based on 
member state and activity history. It is designed to be consistent, 
predictable, and auditable.

Human review required before taking action.
```

#### Accepting a Recommendation
Clicking **[Accept]** does NOT send anything.

Instead:
- Recommendation text is copied to "Next Action" field
- User can edit
- User manually decides when/how to act

#### Why This Approach

Using deterministic rules instead of an external LLM actually demonstrates better product thinking:
- **Explainable:** The manager can see exactly why a recommendation was generated
- **Auditable:** The logic is transparent and verifiable
- **Safe:** No member data leaves the application
- **Fast:** No API latency
- **Honest:** You're not pretending determinism is magic

---

### 6.9 Edit Member
**Modal or inline form to update member data.**

Editable fields:
- Role
- Company
- Primary Space
- Owner
- Joined Date
- Notes
- Next Action

Changes persist to localStorage.

---

### 6.10 Empty States

These UI states demonstrate production polish and prevent confusion.

#### Member with No Activities

```
ACTIVITY HISTORY

No activities recorded yet.

Recommended next step:
Help this member share their first contribution in [Primary Space].
```

#### Search with No Results

```
No members found matching "xyz"

Try:
• Check spelling
• Search by role or company
• View all members
```

#### No Follow-ups

```
FOLLOW-UP REQUIRED

0 members need attention

Your community is healthy!

Recent community activity:
[show 5 most recent activities]
```

#### Newly Joined Member (No Activities)

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

#### Member with No Recent Activity

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

### 6.11 Activity Audit Trail

For transparency and compliance with "auditable" principle:

Every activity record includes:
```javascript
{
  id: string,
  memberId: string,
  date: ISO8601,           // When the activity occurred
  space: string,
  type: string,
  description: string,
  engagement: string,
  recordedBy: string,      // "Community Team" or user name
  recordedAt: ISO8601,     // When it was entered in CRM
  createdAt: ISO8601       // System timestamp
}
```

On the member detail page, show:

```
Aug 18 | Tools & Systems | Comment
Shared an ERP migration lesson

Recorded by: Community Team
Recorded at: Aug 19, 2024 3:42 PM
```

This makes the system auditable without requiring authentication.

---

### 6.12 Help & Methodology
**Explains the entire system.**

Sections:

#### About This CRM
> This is a community activity-management prototype built for the Volopay Friends of Finance Growth Squad assessment (Task 3). It demonstrates how a community manager can track member engagement, identify who needs attention, and recommend thoughtful community actions—without converting community participation into sales signals.

#### Technology Stack
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **State:** Zustand
- **Storage:** localStorage (single-browser persistence)
- **Deployment:** Vercel
- **Data:** Static seed data bundled with app

#### Data
> All 20 members and activity records are entirely fictional.
> 
> No real finance professionals from the community are included.
> No activity is fabricated for real people.
> No real community members are contacted.

#### Activity-State Rules

The state engine evaluates these rules in order (if-else):

```
1. DORMANT
   Last activity ≥60 days ago

2. AT RISK  
   Last activity 30–59 days ago AND member has ≥2 historical activities

3. HIGHLY ACTIVE
   3+ activities in last 14 days OR 1+ high-engagement activity in last 14 days

4. NEWLY JOINED
   Joined ≤14 days ago AND <2 total activities

5. ACTIVE
   ≥1 activity in last 30 days (and doesn't match rules 1-4)

KEY: A newly joined member with high engagement becomes Highly Active.
     Rules are evaluated in order; first match wins.
```

#### AI Feature

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

Output example:
"This member is highly active in Tools & Systems. 
 Consider inviting them to contribute a guest article 
 or interview about their practical experience."

User can:
• Accept (copy to Next Action field)
• Edit (modify the suggestion)
• Dismiss (ignore)
```

#### Commercial Signal (Assessment-Only Safeguard)

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

#### Persistence Limitation
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

#### Testing Checklist
```
RECOMMENDED TEST FLOW

1. Open dashboard
   → See 20 members, state counts, follow-up count
   
2. Search for "Aarav Mehta"
   → Member appears in results
   
3. Open Aarav's detail page
   → View profile, state, activity history
   
4. Review state explanation
   → Understand why he's "Highly Active"
   
5. Add a new activity
   → Record a comment in Tools & Systems today
   → Confirm activity appears in history
   → Confirm state recalculates (still Highly Active)
   
6. Go to Members directory
   → Filter by "At Risk"
   → See 3 at-risk members
   
7. Click Follow-ups
   → See members needing attention
   
8. Go to Newly Joined view
   → See 4 new members
   
9. Return to a member detail
   → Generate AI recommendation
   → Confirm message does not auto-send
   → Click [Dismiss]
   
10. Review commercial signal section
    → Confirm it's separate from activity state
    
11. Add a new member
    → Fill form, click Save
    → Return to Members directory
    → Search for new member
    → Refresh browser
    → Confirm new member persists
    
12. Open Help
    → Review rules, tech stack, safeguards
```

---

## 7. Navigation Structure

```
┌────────────────────────────────────┐
│ Friends of Finance CRM             │
├────────────────────────────────────┤
│                                    │
│ Dashboard                          │
│ Members                            │
│ Follow-ups                         │
│ Newly Joined                       │
│ Highly Active                      │
│ At Risk / Dormant                  │
│ Help & Methodology                 │
│                                    │
└────────────────────────────────────┘
```

Sidebar or top navigation. Responsive for mobile, optimized for desktop.

---

## 8. Visual Design

**Style Direction:**
- Clean SaaS dashboard aesthetic
- Light neutral background (#f9fafb or white)
- Dark, readable typography
- Subtle borders (#e5e7eb)
- Rounded cards (4–6px radius)
- Clear state badges with distinct colors:
  - Newly Joined: Blue
  - Active: Green
  - Highly Active: Emerald/Dark Green
  - At Risk: Amber/Orange
  - Dormant: Gray
- Strong spacing and breathing room
- Professional, not playful

**No unnecessary animations.** The tool should feel like an internal operations dashboard, not a consumer app.

---

## 13. Implementation Constraints

### Date & Time Handling

**All state calculations use calendar days, not hours.**

```javascript
// Correct:
const daysInactive = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));

// Do NOT use precise time differences
// 13.5 hours is not "1 day"
```

**Definition of "14 days":**
- 14 calendar days (not 14 × 24 hours)
- Calculated at user's local midnight
- All dates stored as ISO 8601 strings

Example:
- Member joined Aug 5 at 11 PM
- Today is Aug 19 at 9 AM
- daysInactive = 14 calendar days → triggers Dormant threshold

**Timezone handling:**
- No timezone conversion needed
- Compare local dates directly
- Client-side only (no server)

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

- **Seed data:** Bundled in the app, never changes (unless user adds)
- **User edits:** Stored in localStorage under key `fof-crm-data`
- **Sync:** Single browser only (no multi-device sync)
- **Backup:** User is responsible for backups (this is a demo, not production)

---

## 14. Deployment

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

## 15. Success Criteria (Definition of Done)

### Data & Members
- [x] 20 fictional members exist
- [x] All names, companies, roles are fictional
- [x] Member distribution matches target (4/6/4/3/3)
- [x] Activity histories produce correct states
- [x] No real finance professionals included

### Core Features
- [x] Dashboard displays overview + follow-ups
- [x] Members directory with search, filter, sort
- [x] Add member form works and persists
- [x] Edit member works
- [x] Member detail page displays all info
- [x] Activity recording works
- [x] Activity history displays correctly
- [x] Activity state auto-calculates
- [x] State explanation visible for every member

### Classification & Rules
- [x] Activity state engine implements 5 rules correctly
- [x] Precedence resolves ties (no duplicate states)
- [x] Every member has exactly one state
- [x] State explanation is human-readable
- [x] Owner assigned to every member
- [x] Next action assigned to every member

### Views & Navigation
- [x] Follow-ups view shows at-risk/new/dormant
- [x] Newly Joined view shows 4 new members
- [x] Highly Active view shows 4 active members
- [x] At Risk / Dormant view shows 6 members
- [x] Navigation menu complete and working

### AI & Safety
- [x] AI-assisted action implemented (working or simulated)
- [x] AI action clearly labeled [Working] or [Simulated]
- [x] AI generates recommendation without sending
- [x] AI does not read commercial signals
- [x] AI does not automatically change state
- [x] AI does not contact members

### Commercial Safeguards
- [x] Commercial signal field exists (separate from activity)
- [x] Commercial signal does NOT affect activity state
- [x] Commercial signal does NOT affect follow-up priority
- [x] Commercial signal does NOT inform AI
- [x] Commercial signal requires human review
- [x] Safeguard visibly documented in UI and Help

### Help & Documentation
- [x] Help page exists
- [x] Tech stack documented
- [x] Data privacy explained
- [x] Activity-state rules displayed
- [x] AI feature explained
- [x] Commercial safeguards documented
- [x] Testing checklist provided
- [x] Persistence limitation explained

### Deployment & Polish
- [x] App deployed to public URL
- [x] No authentication required
- [x] Works in incognito mode
- [x] Responsive on desktop (priority), tablet, mobile
- [x] localStorage persistence works
- [x] Professional visual design
- [x] No console errors
- [x] Ready for 5-minute demo

---

## 12. Task 4 Demo Script (5 Minutes)

**Duration:** 5 minutes  
**Fictional Member Focus:** Aarav Mehta (Highly Active)

### Flow

1. **Open Dashboard** (15 sec)
   - Show community overview: 20 members, state distribution
   - Highlight: 3 members need follow-up

2. **Search for Aarav Mehta** (20 sec)
   - Type in search
   - Click to open detail

3. **Review Member Profile** (30 sec)
   - Name, role, company
   - Primary space: Tools & Systems
   - Owner: Community Team
   - State: Highly Active
   - **Explain why:** 4 activities in last 14 days

4. **Show Activity History** (30 sec)
   - Aug 18 — Comment in Tools & Systems
   - Aug 16 — Post in Finance Workflows
   - Aug 14 — Comment in Tools & Systems
   - Aug 10 — Answer in Ask Finance Peers
   - Narrate: *"The state is calculated from this activity, not assigned manually."*

5. **Record a New Activity** (30 sec)
   - Click [+ Record Activity]
   - Add: "Today, shared ERP best practices in Tools & Systems, High engagement"
   - Save
   - Show activity added to history instantly

6. **Generate AI Recommendation** (30 sec)
   - Click [Generate AI Recommendation]
   - Show: *"Consider inviting Aarav to share a workflow article..."*
   - Explain: *"AI suggests community action, not sales outreach. I can accept, edit, or dismiss. Nothing is sent automatically."*
   - Click [Dismiss]

7. **Show Commercial Signal Separation** (30 sec)
   - Scroll to Commercial Signal section
   - Explain: *"This field exists but is completely separate from activity state. It doesn't affect engagement scoring or follow-up recommendations."*

8. **Navigate to Follow-ups** (20 sec)
   - Show 3 members needing attention
   - Click on "Sneha Patel" (At Risk)
   - Explain: *"Last activity 42 days ago. This is why she's At Risk. Recommended next action: surface a relevant discussion."*

9. **Open Help Page** (15 sec)
   - Show testing checklist
   - Show activity-state rules
   - Highlight commercial safeguards

10. **Close with Limitation** (10 sec)
    - *"Current limitation: this is browser-local with localStorage. Edits persist here but aren't synced across devices."*
    - *"Next improvement: add a real database so multiple managers work from one live dataset."*

---

## 12. Constraints & Assumptions

### Technology Constraints
- No backend database (localStorage only)
- No authentication
- No real API integrations
- No third-party community platform access

### Data Constraints
- 20 fictional members only
- No real finance professionals
- All activity is fictional and pre-seeded (except user additions)
- No real company data or industry metrics

### Design Constraints
- Desktop-first (mobile responsive but desktop optimized)
- No unnecessary features
- No decorative visualizations
- No duplicate/overlapping functionality

### Scope Constraints
- One AI-assisted action only
- No sales pipeline or lead scoring
- No automation beyond state calculation
- No email, SMS, or LinkedIn integration
- No real-time collaboration features

---

## 16. Unique Selling Point Summary

This CRM stands apart because it **prioritizes community trust over sales velocity**.

**Every design choice reflects the principle:**  
> **"Measure participation, not commercial intent. Recommend actions, don't automate relationships."**

### What Makes It Different:
1. **Transparent Classification:** Every state is calculated visibly from activity rules
2. **Explainable Decisions:** Every member state includes a human-readable reason
3. **Separated Signals:** Commercial signals are structurally isolated from engagement scoring
4. **Human-Centered AI:** Recommendations are suggestions for human review, never automated actions
5. **Community-First Actions:** Every recommended action serves the member or community, not sales goals
6. **Auditable System:** A manager can always see why a member has their current state and what the system recommends next

---

## 17. Success Metrics (For Demo)

Evaluator should be able to:
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

## 18. Appendix: Related Assessment Context

**Task 3 of:** Volopay Friends of Finance Growth Squad  
**Deliverable:** Deployed live CRM accessible without login  
**Related Tasks:**
- Task 1: Orientation Guide (community spaces, member profiles)
- Task 2: Comms framework + member outreach sequences
- Task 4: Video demonstration of live CRM (5 min)

**Not included:**
- Sales pipeline or revenue metrics
- Real finance professional data
- Automatic outreach or messaging
- CRM features not needed for community management

---

**End of PRD**
