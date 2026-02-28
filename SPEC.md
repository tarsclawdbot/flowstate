# FlowState — Technical Specification

**Product:** FlowState  
**Tagline:** "Calendar intelligence for engineers. Knows when you code best."  
**Version:** 1.0.0  
**Last Updated:** 2026-02-27

---

## 1. Product Overview

FlowState is a developer-focused calendar intelligence tool that analyzes GitHub commit history to identify a developer's peak coding hours, then measures and visualizes how meetings fragment those precious flow windows. It provides actionable suggestions to protect deep work time.

### Core Value Proposition
Your GitHub commit history is a goldmine of productivity data. FlowState extracts insights from your coding patterns and defends those hours from calendar fragmentation.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (GitHub + Google OAuth) |
| Database | Prisma ORM + SQLite |
| API | GitHub REST API v3 |
| API | Google Calendar API v3 |
| Charts | Recharts |
| Icons | Lucide React |

---

## 3. Architecture Overview

### Pages Structure

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout (fonts, metadata)
├── (auth)/
│   ├── login/page.tsx          # Login/landing when authenticated
├── dashboard/
│   ├── page.tsx                # Main dashboard
│   ├── report/page.tsx         # Weekly Focus Report
├── connect/
│   ├── github/page.tsx         # GitHub OAuth connect
│   ├── calendar/page.tsx       # Google Calendar OAuth connect
├── settings/
│   └── page.tsx                # User settings
├── pricing/
│   └── page.tsx                # Pricing page
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── github/analyze/route.ts
    ├── calendar/analyze/route.ts
    └── report/weekly/route.ts
```

### Components Structure

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   └── Skeleton.tsx
├── layout/
│   ├── Sidebar.tsx             # Desktop navigation
│   ├── BottomNav.tsx           # Mobile navigation
│   └── PageHeader.tsx
├── dashboard/
│   ├── FragmentationScore.tsx  # Large score display with trend
│   ├── FlowWindowsHeatmap.tsx  # 7x24 grid heatmap
│   ├── DeepWorkHours.tsx       # Weekly deep work stats
│   ├── SuggestionCard.tsx      # Smart suggestions
│   └── ProtectedBlocks.tsx     # Upcoming protected time
├── report/
│   ├── HoursByDay.tsx          # Bar chart
│   ├── FragmentationTrend.tsx  # Line chart over weeks
│   ├── MeetingDebt.tsx         # Visual debt representation
│   └── PeakWindow.tsx          # Peak window callout
├── connect/
│   ├── OAuthButton.tsx         # GitHub/Google connect buttons
│   └── ConnectStatus.tsx       # Connection status card
└── landing/
    ├── Hero.tsx
    ├── Features.tsx
    ├── Pricing.tsx
    └── CTA.tsx
```

---

## 4. Data Models

### Prisma Schema

```prisma
// schema.prisma

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?
  githubId        String?   @unique
  githubAccessToken String?
  googleId        String?   @unique
  googleAccessToken String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  githubData      GitHubData?
  calendarData    CalendarData?
  weeklyReports   WeeklyReport[]
}

model GitHubData {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  // Raw commit data (JSON blob for flexibility)
  commits         Json      // Array of {sha, date, hour, dayOfWeek}
  
  // Aggregated insights
  peakHourStart   Int       // 0-23
  peakHourEnd     Int       // 0-23
  peakDayOfWeek   Int       // 0-6 (0=Sunday)
  totalCommits    Int
  codingStreak    Int       // Consecutive days with commits
  commitHeatmap   Json      // 7x24 matrix of commit counts
  
  updatedAt       DateTime  @updatedAt
}

model CalendarData {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  // Weekly metrics
  fragmentationScore Int    // 0-100
  meetingCount        Int
  totalMeetingMinutes Int
  meetingDebtMinutes  Int    // Lost to context switching
  
  // Daily breakdown
  dailyMetrics    Json      // Array of {date, meetings, fragmentation}
  
  updatedAt       DateTime  @updatedAt
}

model WeeklyReport {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  weekStart       DateTime  // Monday of the week
  weekEnd         DateTime  // Sunday of the week
  
  fragmentationScore Int    // 0-100
  meetingDebtHours   Float  // Decimal hours
  deepWorkHours      Float  // Hours in flow windows without meetings
  totalMeetingHours  Float
  
  suggestions     Json      // Array of suggestion objects
  
  createdAt       DateTime  @default(now())
}
```

---

## 5. API Integrations

### GitHub API Integration

**OAuth Scopes Required:**
- `read:user` — Get user profile
- `repo` — Read commit data (public + private repos)

**Endpoints Used:**

| Endpoint | Purpose |
|----------|---------|
| `GET /user` | Get authenticated user info |
| `GET /users/{username}/events/public` | Get recent activity |
| `GET /repos/{owner}/{repo}/commits` | Get commit history per repo |

**Data Extracted per Commit:**
```typescript
interface CommitData {
  sha: string;
  date: string;          // ISO 8601
  hour: number;          // 0-23 (derived from date)
  dayOfWeek: number;     // 0-6 (0=Sunday)
  repo: string;
  message: string;
}
```

**Analysis Performed:**
1. Fetch all user commits from past 90 days
2. Bin by hour of day (0-23) and day of week (0-6)
3. Calculate commit density matrix (7×24)
4. Identify peak hours: find hours with >50% of max density
5. Identify peak day: day with most commits
6. Calculate coding streak: consecutive days with at least 1 commit

### Google Calendar API Integration

**OAuth Scopes Required:**
- `https://www.googleapis.com/auth/calendar.readonly` — Read calendar events

**Endpoints Used:**

| Endpoint | Purpose |
|----------|---------|
| `GET /calendars/primary/events` | List events from primary calendar |

**Query Parameters:**
- `timeMin`: Start of week (Monday 00:00:00 UTC)
- `timeMax`: End of week (Sunday 23:59:59 UTC)
- `singleEvents`: true (expand recurring events)
- `orderBy`: startTime

**Data Extracted per Event:**
```typescript
interface CalendarEvent {
  id: string;
  summary: string;         // Event title
  start: { dateTime: string };
  end: { dateTime: string };
  durationMinutes: number; // Calculated
  isAllDay: boolean;
}
```

---

## 6. Algorithms

### Fragmentation Score™ Formula

**Concept:** Measures how broken up a week's schedule is by meetings.

**Calculation:**
```
fragmentation_index = Σ (meetings_per_day × avg_context_switches_per_meeting)

Where:
- meetings_per_day = total meetings / 5 (work days)
- avg_context_switches_per_meeting = 2.5 (industry research average)

fragmentation_score = 100 - min(100, fragmentation_index × 10)
```

**Example:**
- 15 meetings/week = 3 meetings/day
- fragmentation_index = 3 × 2.5 = 7.5
- fragmentation_score = 100 - (7.5 × 10) = 25 (poor)

**Score Interpretation:**
| Score | Label | Color |
|-------|-------|-------|
| 80-100 | 🔥 Flow Zone | Green |
| 60-79 | Good | Teal |
| 40-59 | Fragmented | Yellow |
| 0-39 | Critical | Red |

### Meeting Debt Calculator

**Concept:** Based on interruption science — each context switch costs ~23 minutes of recovery time (UC Irvine study).

**Calculation:**
```
meeting_debt_minutes = Σ (isolated_meetings × 23)

Where isolated_meeting = meeting that breaks a 2+ hour block of potential flow time

meeting_debt_hours = meeting_debt_minutes / 60
```

**Example:**
- 5 isolated meetings in a week
- meeting_debt = 5 × 23 = 115 minutes = 1.9 hours lost

### Flow Windows Calculation

**Concept:** Create a 7×24 matrix showing when user commits most.

**Algorithm:**
```
1. For each commit, extract hour (0-23) and dayOfWeek (0-6)
2. Increment matrix[dayOfWeek][hour] by 1
3. Find max_value in matrix
4. Normalize each cell: score = (value / max_value) × 100
5. Peak window = cells with score > 75
```

**Visualization:**
- 7 rows (days) × 24 columns (hours)
- Color intensity: 0 (empty) → 100 (peak)
- Highlight peak window with border

---

## 7. Pages Specification

### 7.1 Landing Page (`/`)

**Hero Section:**
- Large headline: "Know When You Code Best"
- Subheadline: "FlowState analyzes your GitHub history to find your peak coding hours, then protects them from calendar fragmentation."
- Two CTAs: "Connect GitHub" (primary), "Connect Calendar" (secondary)
- Background: Subtle animated gradient (dark navy to slate)

**Features Section (3 columns on desktop, stacked on mobile):**
1. **GitHub Connect** — "We analyze thousands of commits to find exactly when you're in flow."
2. **Fragmentation Score** — "See how broken up your week really is with our proprietary metric."
3. **Smart Suggestions** — "Get actionable recommendations to reclaim your deep work time."

**Social Proof:**
- "Used by developers at companies like Vercel, Stripe, Linear"

**Pricing Preview:**
- $15/month after free trial
- CTA: "Start Free Trial"

**Footer:**
- Links: About, Privacy, Terms, GitHub repo

### 7.2 Dashboard (`/dashboard`)

**Layout:** 
- Desktop: Sidebar (left) + Main content
- Mobile: Bottom navigation + Main content

**Main Content Sections:**

**1. Header:**
- Welcome message: "Good morning, {name}"
- Current date/week display

**2. Fragmentation Score Card (top left):**
- Large number: 0-100
- Trend indicator: ↑ or ↓ vs last week
- Color-coded background ring

**3. Flow Windows Heatmap (top right):**
- 7×24 grid
- Days: Mon-Sun (or M-S on mobile)
- Hours: 6am-10pm (focused view) or 24h (toggle)
- Color: Electric blue gradient
- Hover: Show commit count

**4. Deep Work Hours (middle):**
- This week's total: "12.5 hours"
- Comparison to last week: "+2 hours"
- Progress bar toward weekly goal (default: 20 hours)

**5. Top Suggestion Card (prominent):**
- Icon: Lightbulb or suggestion icon
- Text: "Your best coding window is 9-11am. You have a standup at 10am Tue/Thu. Moving it to 9am would save you ~3 hours of deep work this week."
- Action button: "Apply Suggestion" (optional)

**6. Upcoming Protected Blocks:**
- List of next 3-5 protected flow windows
- Show: Day, time range, "protected" badge

### 7.3 Weekly Report (`/dashboard/report`)

**Full breakdown page with charts:**

**1. Summary Cards (4 columns):**
- Deep Work Hours: 12.5 hrs
- Fragmentation Score: 45/100
- Meeting Debt: 2.3 hrs
- Peak Window: "Mon-Wed, 9am-12pm"

**2. Hours by Day (Bar Chart):**
- X-axis: Mon-Fri
- Y-axis: Hours
- Bars: Deep work (green), Meetings (orange), Free (gray)

**3. Fragmentation Trend (Line Chart):**
- X-axis: Last 8 weeks
- Y-axis: Fragmentation score
- Line with dots, shaded area under

**4. Meeting Debt Visualization:**
- Visual timeline showing context switches
- Count of "broken blocks"
- Total debt in hours

**5. Suggestions List:**
- All suggestions for the week
- Priority-sorted
- Actionable items

### 7.4 Connect GitHub (`/connect/github`)

**Simple, focused page:**
- Header: "Connect Your GitHub Account"
- Explanation: "We need read access to analyze your commit history. We never store your code."
- OAuth button: "Connect with GitHub"
- Back link: "Skip for now"
- Status (if already connected): Show connected account, "Reconnect" button

### 7.5 Connect Calendar (`/connect/calendar`)

**Simple, focused page:**
- Header: "Connect Your Google Calendar"
- Explanation: "We read your calendar to understand meeting patterns. Your data stays private."
- OAuth button: "Connect with Google"
- Back link: "Skip for now"
- Status (if already connected): Show connected account, "Reconnect" button

### 7.6 Settings (`/settings`)

**Sections:**
1. **Connected Accounts**
   - GitHub: Connected as @username / Connect
   - Google: Connected as user@gmail.com / Connect

2. **Preferences**
   - Week starts on: Monday / Sunday
   - Time zone: Dropdown (auto-detect)
   - Protected hours goal: Number input (default: 20)

3. **Data**
   - Export data button
   - Delete account button (with confirmation)

### 7.7 Pricing (`/pricing`)

**Single pricing card:**
- Plan name: "FlowState Pro"
- Price: "$15/month"
- Subtitle: "after 14-day free trial"
- Features list:
  - Unlimited history analysis
  - Weekly focus reports
  - Smart suggestions
  - Meeting debt tracking
  - Priority support
- CTA: "Start Free Trial" (link to sign up)
- Note: "No payment required for demo"

---

## 8. API Routes

### Authentication

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js handlers |

### GitHub Integration

| Route | Method | Description |
|-------|--------|-------------|
| `/api/github/analyze` | POST | Trigger GitHub data analysis |
| `/api/github/analyze` | GET | Get cached analysis results |

### Calendar Integration

| Route | Method | Description |
|-------|--------|-------------|
| `/api/calendar/analyze` | POST | Trigger calendar analysis |
| `/api/calendar/analyze` | GET | Get cached analysis results |

### Reports

| Route | Method | Description |
|-------|--------|-------------|
| `/api/report/weekly` | GET | Get current week's report |
| `/api/report/weekly` | POST | Generate new weekly report |

---

## 9. Mock Data (Demo Mode)

When GitHub or Calendar is not connected, show realistic demo data:

```typescript
const mockGitHubData = {
  commits: generateMockCommits(500),
  peakHourStart: 9,
  peakHourEnd: 12,
  peakDayOfWeek: 2, // Tuesday
  totalCommits: 487,
  codingStreak: 12,
  commitHeatmap: generateMockHeatmap()
};

const mockCalendarData = {
  fragmentationScore: 45,
  meetingCount: 18,
  totalMeetingMinutes: 720,
  meetingDebtMinutes: 115,
  dailyMetrics: [
    { date: '2026-02-23', meetings: 4, fragmentation: 52 },
    { date: '2026-02-24', meetings: 3, fragmentation: 38 },
    { date: '2026-02-25', meetings: 5, fragmentation: 61 },
    { date: '2026-02-26', meetings: 2, fragmentation: 28 },
    { date: '2026-02-27', meetings: 4, fragmentation: 46 }
  ]
};

const mockWeeklyReport = {
  weekStart: '2026-02-23',
  weekEnd: '2026-03-01',
  fragmentationScore: 45,
  meetingDebtHours: 1.9,
  deepWorkHours: 12.5,
  totalMeetingHours: 12.0,
  suggestions: [
    {
      id: '1',
      type: 'move_meeting',
      title: 'Move standup to start of day',
      impact: 'Save 3 hours/week',
      details: 'Your 10am standup Tue/Thu breaks your 9-11am flow window. Moving to 9am reclaims 2 hours.'
    }
  ]
};
```

---

## 10. Environment Variables

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

---

## 11. Acceptance Criteria

### Landing Page
- [ ] Hero section renders with correct headline
- [ ] Both OAuth CTAs are visible and clickable
- [ ] Pricing section shows $15/month
- [ ] Mobile responsive at 390px width

### Dashboard
- [ ] Fragmentation score displays 0-100 with color coding
- [ ] Flow windows heatmap renders 7×24 grid
- [ ] Deep work hours show weekly total
- [ ] Top suggestion card displays actionable text
- [ ] Navigation works (sidebar on desktop, bottom nav on mobile)

### Data Integrations
- [ ] GitHub OAuth flow completes successfully
- [ ] Google Calendar OAuth flow completes successfully
- [ ] Commit data is fetched and analyzed correctly
- [ ] Calendar events are fetched and analyzed correctly

### Algorithms
- [ ] Fragmentation score calculates correctly
- [ ] Meeting debt calculates correctly (isolated meetings × 23 min)
- [ ] Flow windows heatmap normalizes correctly

### Demo Mode
- [ ] App functions without OAuth connections
- [ ] Mock data displays realistic numbers
- [ ] Charts render with mock data

---

## 12. Future Considerations (Out of Scope)

- Payment processing (Stripe)
- Email notifications
- Slack integration
- Team/workspace features
- Meeting scheduling suggestions
- Custom calendar rules
- Mobile app
